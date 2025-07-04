import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "motion/react";

import { WalletButton } from "./components/walletButton";
import Navbar from "./components/Navbar";
import Page1 from "./pages/Page 1";
import Page2 from "./pages/Page 2";
import Page3 from "./pages/Page 3";
function App() {
  return (
<Router>
      <WalletButton />

      <Navbar />
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <main className="text-center mt-16">
                        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Routes>
            <Route path="/" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
            <Route path="/page3" element={<Page3 />} />
          </Routes>
            </motion.div>

        </main>
      </div>
        
    </Router>
  );
}

export default App;
