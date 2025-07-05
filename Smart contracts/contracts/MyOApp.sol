// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Context } from "@oppenzeppelin/contracts/utils/Context.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControlEnumerable } from "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import { IERC7943 } from "interfaces/IERC7943.sol";

contract MyOApp is OApp, OAppOptionsType3, Context, ERC20, AccessControlEnumerable, IERC7943 {
    address[] public whitelisted;

    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    // Override function for transaction fees adapted to multi-network
    function _payNative(uint256 _nativeFee) internal override returns (uint256 nativeFee) {
        if (msg.value < _nativeFee) revert NotEnoughNative(msg.value);
        return _nativeFee;
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    function quoteBatchSend(
        uint32[] memory _dstEids,
        address _whitelistAddress,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        bytes memory _message = abi.encode(_whitelistAddress);
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

    function sendBatchWhitelist(
        uint32[] memory _dstEids,
        address _whitelistAddress,
        bytes calldata _options
    ) external payable {
        bytes memory _message = abi.encode(_whitelistAddress);
        uint256 len = _dstEids.length;

        // 1) Compute each fee exactly once
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

        whitelist(_whitelistAddress);
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
        address _address = abi.decode(_message, (address));

        whitelist(_address);

        // 3. (Optional) Trigger further on-chain actions.
        //    e.g., emit an event, mint tokens, call another contract, etc.
        //    emit MessageReceived(_origin.srcEid, _string);
    }

    function whitelist(address _whiteAddr) public {
        whitelisted.push(_whiteAddr);
    }

    function getWhitelist() external view returns (address[] memory) {
        return whitelisted;
    }
}
