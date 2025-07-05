import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "motion/react";
import Logo from "./assets/Full logo.png";
import { WalletButton } from "./components/walletButton";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import Bank from "./pages/Bank";
import Account from "./pages/Account";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <div className="relative h-screen flex flex-col bg-gradient-to-l from-blue-200 to-white overflow-hidden">
        <div className="absolute top-4 left-4 z-50">
          <img
            src={Logo}
            alt="App Logo"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>
        <WalletButton />
        <Navbar />
        <main className="flex-grow flex justify-center items-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-7xl"
          >
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/bank" element={<Bank />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </motion.div>
        </main>
        <Toaster position="bottom-center" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
