export default function Home() {
  return (
    <div>
      <header className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
        {/* Left side: Logo and Website Name */}
        <div className="flex items-center">
          <img
            src="/hammer_anvil.svg" // Replace with the actual path to your anvil logo
            alt="Anvil Logo"
            className="h-8 w-8 mr-2 filter invert"
          />
          <h1 className="text-xl font-bold px-2">Reforge</h1> {/* Added padding */}
        </div>

        {/* Right side: Login / Signup Button */}
        <div>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Login
          </button> {/* Adjusted padding */}
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 flex-col justify-center">
        <h2 className="text-6xl font-semibold text-center mt-5">Welcome to Reforge!</h2>
        <p className="text-2xl mt-7 text-gray-300 text-center">
          Start your journey to productivity and success.
        </p>
      </main>
    </div>
  );
}