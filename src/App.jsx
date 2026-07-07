import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PageLoader from "./components/PageLoader";
import Layout from "./components/Layout";
import DemoOne from "./components/demo";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import ResumeAi from "./components/ResumeAi";
import TaskManager from "./components/TaskManager";

function App() {
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(
    () => window.location.hash === "#tasks",
  );

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const onHashChange = () => setShowTasks(window.location.hash === "#tasks");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (showTasks) {
    return (
      <TaskManager
        onBack={() => {
          window.location.hash = "";
        }}
      />
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <PageLoader key="loader" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!loading && (
        <Layout>
          <DemoOne />
          {/* <Hero /> */}
          {/* <ResumeAi /> */}
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
