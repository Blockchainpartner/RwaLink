import animationGif from "../assets/asset.gif";

export default function Overview() {
  return (
    <div className="flex h-screen">
      {/* Left half: vertically centered, text pushed more left */}
<section className="flex-1 flex items-center justify-start pl-10">
  <div className="max-w-2xl text-left">
    <h1 className="text-4xl font-bold mb-6 text-black">
      Universal Real World Asset Tokenization
    </h1>
    <p className="text-gray-700 leading-relaxed">
      This platform enables seamless and compliant tokenization of Real World Assets (RWAs) across multiple blockchains.
      Built on <span className="font-semibold text-blue-700">ERC-7943: uRWA</span>, it provides a universal interface that abstracts away the complexities of multichain deployment.
      <br /><br />
      With a unified UX and synchronized compliance rules on every chain, we empower users, institutions, and developers to issue, transfer, and manage RWA tokens  transparently  no matter the underlying Blockchain.
    </p>
  </div>
</section>

      <h1 className="text-4xl font-bold mb-6 text-black">
</h1>


      {/* Right half: vertically centered, transparent animated gif */}
      <section className="flex-1 flex items-center justify-center pr-10">
        <img
          src={animationGif}
          alt="Animated logo"
          className="h-70 w-auto object-contain"
        />
      </section>
    </div>
  );
}
