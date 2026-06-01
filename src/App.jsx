import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';
import DemoOne from './components/demo';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';

function App() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <PageLoader key="loader" onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!loading && (
        <Layout>
          <DemoOne />
          {/* <Hero /> */}
          <About />
          <Projects />
          <Skills />
          <Experience />
          <Testimonials />
          <Contact />
        </Layout>
      )}
    </>
  );
}

export default App;
