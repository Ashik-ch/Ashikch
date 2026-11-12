import Navbar from './Navbar';
import CustomCursor from './CustomCursor';

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen bg-grid-pattern selection:bg-blue-600/30 selection:text-blue-900">
      <CustomCursor />
      <Navbar />

      <main className="relative z-10 pb-28">
        {children}
      </main>
    </div>
  );
}
