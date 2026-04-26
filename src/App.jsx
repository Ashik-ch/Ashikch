import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <PageLoader key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <Layout>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Testimonials />
          <Contact />
        </Layout>
      )}
    </>
  );
}

export default App;
