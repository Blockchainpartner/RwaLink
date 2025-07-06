// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { IERC7943 } from "./interfaces/IERC7943.sol";

contract MyOApp is OApp, OAppOptionsType3, ERC20, AccessControlEnumerable, IERC7943 {
    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    uint256 public constant WHITELIST_ACTION = 0;
    uint256 public constant MINT_ACTION = 1;
    uint256 public constant BURN_ACTION = 2;
    uint256 public constant FREEZE_ACTION = 3;
    uint256 public constant SEND_ACTION = 4;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant ENFORCER_ROLE = keccak256("ENFORCER_ROLE");
    bytes32 public constant WHITELIST_ROLE = keccak256("WHITELIST_ROLE");

    mapping(address user => bool whitelisted) public isWhitelisted;
    mapping(address user => uint256 amount) internal _frozenTokens;

    event Whitelisted(address indexed account, bool status);
    event Mint(address indexed account, uint256 amount);
    event Burn(address indexed account, uint256 amount);
    error NotZeroAddress();

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(address _endpoint, address _owner, string memory _name, string memory _symbol) OApp(_endpoint, _owner) ERC20(_name, _symbol) Ownable(_owner) {
        // for simplicity the Bank has all the rights
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);
        _grantRole(BURNER_ROLE, _owner);
        _grantRole(ENFORCER_ROLE, _owner);
        _grantRole(WHITELIST_ROLE, _owner);
    }

    // Override function for transaction fees adapted to multi-network call
    function _payNative(uint256 _nativeFee) internal override returns (uint256 nativeFee) {
        if (msg.value < _nativeFee) revert NotEnoughNative(msg.value);
        return _nativeFee;
    }

    function isTransferAllowed(
        address from,
        address to,
        uint256,
        uint256 amount
    ) public view virtual returns (bool allowed) {
        if (amount > balanceOf(from) - _frozenTokens[from]) return false;
        if (!isUserAllowed(from) || !isUserAllowed(to)) return false;
        allowed = true;
    }

    function isUserAllowed(address user) public view virtual returns (bool allowed) {
        if (isWhitelisted[user]) allowed = true;
    }

    /* standard mint and burn functions with access control ...*/

    function setFrozen(address user, uint256, uint256 amount) public onlyRole(ENFORCER_ROLE) {
        require(amount <= balanceOf(user), "Insufficient balance");
        _frozenTokens[user] = amount;
        emit Frozen(user, 0, amount);
    }

    function getFrozen(address user, uint256) external view returns (uint256 amount) {
        amount = _frozenTokens[user];
    }

    function forceTransfer(address from, address to, uint256, uint256 amount) public onlyRole(ENFORCER_ROLE) {
        require(isUserAllowed(to), "ERC7943NotAllowedUser(to)");
        _excessFrozenUpdate(from, amount);
        super._update(from, to, amount);
        emit ForcedTransfer(from, to, 0, amount);
    }

    function _excessFrozenUpdate(address user, uint256 amount) internal {
        uint256 unfrozenBalance = balanceOf(user) - _frozenTokens[user];
        if (amount > unfrozenBalance && amount <= balanceOf(user)) {
            // Protect from underflow: if amount > balanceOf(user) the call will revert in super._update with insufficient balance error
            _frozenTokens[user] -= amount - unfrozenBalance; // Reduce by excess amount
            emit Frozen(user, 0, _frozenTokens[user]);
        }
    }

    function _update(address from, address to, uint256 amount) internal virtual override {
        if (from != address(0) && to != address(0)) {
            // Transfer
            require(amount <= balanceOf(from), "IERC20Errors.ERC20InsufficientBalance(from, balanceOf(from), amount)");
            require(
                amount <= balanceOf(from) - _frozenTokens[from],
                "ERC7943InsufficientUnfrozenBalance(from, 0, amount, balanceOf(from) - _frozenTokens[from])"
            );
            require(isTransferAllowed(from, to, 0, amount), "ERC7943NotAllowedTransfer(from, to, 0, amount)");
        } else if (from == address(0)) {
            // Mint
            require(isUserAllowed(to), "ERC7943NotAllowedUser(to)");
        } else {
            // Burn
            _excessFrozenUpdate(from, amount);
        }

        super._update(from, to, amount);
    }

    function mintRWA(address user, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(user != address(0), "Address error");
        require(isUserAllowed(user), "User not whitelisted");

        _update(address(0), user, amount);

        emit Mint(user, amount);
    }

    function burnRWA(address user, uint256 amount) public onlyRole(BURNER_ROLE) {
        require(user != address(0), "Address error");
        require(isUserAllowed(user), "User not whitelisted");
        require(amount <= balanceOf(user), "Insufficient balance");
        require(amount <= balanceOf(user) - _frozenTokens[user], "Tokens are frozen");

        _update(user, address(0), amount);

        emit Burn(user, amount);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    function quoteBatchWhitelist(
        uint32[] memory _dstEids,
        address _whitelistAddress,
        bytes calldata _options,
        bool status,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        bytes memory _message = abi.encode(WHITELIST_ACTION, _whitelistAddress, status);
        uint256 len = _dstEids.length;

        uint256 nativeSum = 0;
        uint256 zroSum = 0;

        for (uint256 i = 0; i < len; i++) {
            uint32 dst = _dstEids[i];
            bytes memory opts = combineOptions(dst, SEND, _options);
            MessagingFee memory fee = _quote(dst, _message, opts, _payInLzToken);
            nativeSum += fee.nativeFee;
            zroSum += 0;
        }

        return MessagingFee(nativeSum, zroSum);
    }

    function quoteBatchMint(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(MINT_ACTION, _userAddress, amountPerNetwork);

        uint256 nativeSum = 0;
        uint256 zroSum = 0;

        for (uint256 i = 0; i < len; i++) {
            uint32 dst = _dstEids[i];
            bytes memory opts = combineOptions(dst, SEND, _options);
            MessagingFee memory fee = _quote(dst, _message, opts, _payInLzToken);
            nativeSum += fee.nativeFee;
            zroSum += 0;
        }

        return MessagingFee(nativeSum, zroSum);
    }

    function quoteBatchBurn(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(BURN_ACTION, _userAddress, amountPerNetwork);

        uint256 nativeSum = 0;
        uint256 zroSum = 0;

        for (uint256 i = 0; i < len; i++) {
            uint32 dst = _dstEids[i];
            bytes memory opts = combineOptions(dst, SEND, _options);
            MessagingFee memory fee = _quote(dst, _message, opts, _payInLzToken);
            nativeSum += fee.nativeFee;
            zroSum += 0;
        }

        return MessagingFee(nativeSum, zroSum);
    }

    function quoteBatchFreeze(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(FREEZE_ACTION, _userAddress, amountPerNetwork);

        uint256 nativeSum = 0;
        uint256 zroSum = 0;

        for (uint256 i = 0; i < len; i++) {
            uint32 dst = _dstEids[i];
            bytes memory opts = combineOptions(dst, SEND, _options);
            MessagingFee memory fee = _quote(dst, _message, opts, _payInLzToken);
            nativeSum += fee.nativeFee;
            zroSum += 0;
        }

        return MessagingFee(nativeSum, zroSum);
    }

    function quoteSendRWA(
        uint32 _dstEid,
        uint256 _amount,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = abi.encode(SEND_ACTION, msg.sender, _amount);

        fee = _quote(_dstEid, _message, combineOptions(_dstEid, SEND, _options), _payInLzToken);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    function changeWhitelist(
        uint32[] memory _dstEids,
        address _whitelistAddress,
        bytes calldata _options,
        bool status
        ) external payable onlyRole(WHITELIST_ROLE) {
        require(_whitelistAddress != address(0), "Address error");

        bytes memory _message = abi.encode(WHITELIST_ACTION, _whitelistAddress, status);
        uint256 len = _dstEids.length;
        
        MessagingFee[] memory fees = new MessagingFee[](len);
        uint256 totalNativeFee = 0;

        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            // only one _quote call per destination
            fees[i] = _quote(_dstEids[i], _message, opts, /*payInZRO=*/ false);
            totalNativeFee += fees[i].nativeFee;
        }

        // 2) Check up‐front that the caller supplied enough
        require(msg.value >= totalNativeFee, "Insufficient fee");

        // 3) Now do all the sends, reusing the fees we already fetched
        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            _lzSend(_dstEids[i], _message, opts, fees[i], payable(msg.sender));
        }

        isWhitelisted[_whitelistAddress] = status;

        emit Whitelisted(_whitelistAddress, status);
    }

    function batchMint(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options
        ) external payable onlyRole(MINTER_ROLE) {
        require(_userAddress != address(0), "Address error");
        require(isUserAllowed(_userAddress), "User not whitelisted");

        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(MINT_ACTION, _userAddress, amountPerNetwork);
        
        MessagingFee[] memory fees = new MessagingFee[](len);
        uint256 totalNativeFee = 0;

        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            // only one _quote call per destination
            fees[i] = _quote(_dstEids[i], _message, opts, /*payInZRO=*/ false);
            totalNativeFee += fees[i].nativeFee;
        }

        // 2) Check up‐front that the caller supplied enough
        require(msg.value >= totalNativeFee, "Insufficient fee");

        // 3) Now do all the sends, reusing the fees we already fetched
        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            _lzSend(_dstEids[i], _message, opts, fees[i], payable(msg.sender));
        }

        mintRWA(_userAddress, amountPerNetwork);
    }

    function batchBurn(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options
        ) external payable onlyRole(BURNER_ROLE) {
        require(_userAddress != address(0), "Address error");
        require(isUserAllowed(_userAddress), "User not whitelisted");
        require(_amount <= balanceOf(_userAddress), "Insufficient balance");
        require(_amount <= balanceOf(_userAddress) - _frozenTokens[_userAddress], "Tokens are frozen");

        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(BURN_ACTION, _userAddress, amountPerNetwork);
        
        MessagingFee[] memory fees = new MessagingFee[](len);
        uint256 totalNativeFee = 0;

        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            // only one _quote call per destination
            fees[i] = _quote(_dstEids[i], _message, opts, /*payInZRO=*/ false);
            totalNativeFee += fees[i].nativeFee;
        }

        // 2) Check up‐front that the caller supplied enough
        require(msg.value >= totalNativeFee, "Insufficient fee");

        // 3) Now do all the sends, reusing the fees we already fetched
        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            _lzSend(_dstEids[i], _message, opts, fees[i], payable(msg.sender));
        }

        burnRWA(_userAddress, amountPerNetwork);
    }

    function batchFreeze(
        uint32[] memory _dstEids,
        address _userAddress,
        uint256 _amount,
        bytes calldata _options
        ) external payable onlyRole(ENFORCER_ROLE) {
        require(_userAddress != address(0), "Address error");
        require(_amount <= balanceOf(_userAddress), "Insufficient balance");

        uint256 len = _dstEids.length;
        uint256 amountPerNetwork = _amount / (len + 1);

        bytes memory _message = abi.encode(FREEZE_ACTION, _userAddress, amountPerNetwork);
        
        MessagingFee[] memory fees = new MessagingFee[](len);
        uint256 totalNativeFee = 0;

        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            // only one _quote call per destination
            fees[i] = _quote(_dstEids[i], _message, opts, /*payInZRO=*/ false);
            totalNativeFee += fees[i].nativeFee;
        }

        // 2) Check up‐front that the caller supplied enough
        require(msg.value >= totalNativeFee, "Insufficient fee");

        // 3) Now do all the sends, reusing the fees we already fetched
        for (uint256 i = 0; i < len; i++) {
            bytes memory opts = combineOptions(_dstEids[i], SEND, _options);
            _lzSend(_dstEids[i], _message, opts, fees[i], payable(msg.sender));
        }

        setFrozen(_userAddress, 0, amountPerNetwork);
    }

    function sendRWA(
        uint32 _dstEid,
        uint256 _amount,
        bytes calldata _options
        ) external payable {
        require(isUserAllowed(msg.sender), "User not whitelisted");
        require(_amount <= balanceOf(msg.sender), "Insufficient balance");
        require(_amount <= balanceOf(msg.sender) - _frozenTokens[msg.sender], "Tokens are frozen");

        bytes memory _message = abi.encode(SEND_ACTION, msg.sender, _amount);

        _lzSend(
            _dstEid,
            _message,
            combineOptions(_dstEid, SEND, _options),
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        _update(msg.sender, address(0), _amount);

        emit Burn(msg.sender, _amount);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Receive business logic
    //
    // Override _lzReceive to decode the incoming bytes and apply your logic.
    // The base OAppReceiver.lzReceive ensures:
    //   • Only the LayerZero Endpoint can call this method
    //   • The sender is a registered peer (peers[srcEid] == origin.sender)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Invoked by OAppReceiver when EndpointV2.lzReceive is called
    /// @dev   _origin    Metadata (source chain, sender address, nonce)
    /// @dev   _guid      Global unique ID for tracking this message
    /// @param _message   ABI-encoded bytes (the string we sent earlier)
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // 1. Decode the incoming bytes into a string
        //    You can use abi.decode, abi.decodePacked, or directly splice bytes
        //    if you know the format of your data structures
        // uint256 actionID, address _address = abi.decode(_message, (address));
        (uint256 action) = abi.decode(_message, (uint256));

        if (action == WHITELIST_ACTION) {
            (uint256 _actionID, address _whitelistAddress, bool _status) = abi.decode(_message, (uint256, address, bool));

            isWhitelisted[_whitelistAddress] = _status;

            emit Whitelisted(_whitelistAddress, _status);
        }

        if (action == MINT_ACTION) {
            (uint256 _actionID, address _userAddress, uint256 _amount) = abi.decode(_message, (uint256, address, uint256));

            _update(address(0), _userAddress, _amount);

            emit Mint(_userAddress, _amount);
        }

        if (action == BURN_ACTION) {
            (uint256 _actionID, address _userAddress, uint256 _amount) = abi.decode(_message, (uint256, address, uint256));

            _update(_userAddress, address(0), _amount);

            emit Burn(_userAddress, _amount);
        }

        if (action == FREEZE_ACTION) {
            (uint256 _actionID, address _userAddress, uint256 _amount) = abi.decode(_message, (uint256, address, uint256));

            _frozenTokens[_userAddress] = _amount;

            emit Frozen(_userAddress, 0, _amount);
        }

        if (action == SEND_ACTION) {
            (uint256 _actionID, address _userAddress, uint256 _amount) = abi.decode(_message, (uint256, address, uint256));

            _update(address(0), _userAddress, _amount);

            emit Mint(_userAddress, _amount);
        }
    }
}
