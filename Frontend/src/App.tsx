import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "motion/react";

import { WalletButton } from "./components/walletButton";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import Bank from "./pages/Bank";
import Account from "./pages/Account";
function App() {
  return (
<Router>
<WalletButton />
<Navbar />
  <div className="absolute inset-0">
    <div className="relative h-full w-full [&>div]:absolute [&>div]:top-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-l [&>div]:from-blue-200 [&>div]:to-white">
    <div></div>
    
  </div>
  </div>        <main className="text-center mt-16">
                        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Routes>
            <Route path="/" element={< Overview/>} />
            <Route path="/bank" element={<Bank />} />
            <Route path="/account" element={<Account />} />
          </Routes>
            </motion.div>

        </main>
        
    </Router>
  );
}

export default App;
