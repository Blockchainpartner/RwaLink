export default function Overview() {
  return (
    <div className="flex h-screen v-screen">
      {/* Left half: vertically centered, text pushed more left */}
      <section className="flex-1 flex items-center justify-start ">
        <div className="max-w-md text-left">
          <h1 className="text-4xl font-bold mb-6 text-black">
            Project Presentation
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </section>

      {/* Right half: vertically centered, animation near right edge */}
      <section className="flex-1 flex items-center justify-center ">
        <svg
          className="animate-spin h-24 w-24 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </section>
    </div>
  );
}
