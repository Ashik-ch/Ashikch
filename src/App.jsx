import { lazy, Suspense, useState, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import Layout from "./components/Layout";
import DemoOne from "./components/demo";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";

const TaskManager = lazy(() => import("./components/TaskManager"));

function App() {
  const [showTasks, setShowTasks] = useState(
    () => window.location.hash === "#tasks",
  );

  useEffect(() => {
    const onHashChange = () => setShowTasks(window.location.hash === "#tasks");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    // Restore push only for visitors who have already enabled notifications.
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    let cancelled = false;
    let unsubscribe;
    const timer = window.setTimeout(() => {
      import("./lib/pushNotifications")
        .then(async ({ enableFirebasePushNotifications }) => {
          if (cancelled) return;
          const cleanup = await enableFirebasePushNotifications();
          if (typeof cleanup !== "function") return;
          if (cancelled) cleanup();
          else unsubscribe = cleanup;
        })
        .catch((error) => console.warn("Firebase push setup failed", error));
    }, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  if (showTasks) {
    return (
      <Suspense fallback={<div role="status" className="min-h-screen grid place-items-center">Loading workspace…</div>}>
        <TaskManager
          onBack={() => {
            window.location.hash = "";
          }}
        />
      </Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <DemoOne />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Testimonials />
        <Contact />
      </Layout>
    </MotionConfig>
  );
}

export default App;
