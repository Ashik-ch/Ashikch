import { motion } from 'framer-motion';
import CustomCursor from './CustomCursor';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen bg-grid-pattern selection:bg-blue-600/30 selection:text-blue-900">
      {/* Custom Cursor (Hidden on mobile via CSS usually, but we handle it via pointer-events) */}
      {/* <div className="hidden md:block">
        <CustomCursor />
      </div> */}

      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
