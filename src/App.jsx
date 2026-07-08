import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PageLoader from "./components/PageLoader";
import { enableFirebasePushNotifications } from "./lib/pushNotifications";

const askNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Notifications enabled", {
      body: "You will now receive reminders from this app.",
    });
  }
};
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
import ReminderPanel from "./components/ReminderPanel";

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      askNotificationPermission();
      enableFirebasePushNotifications({
        onReady: (token) => {
          console.log("Firebase push token ready", token);
        },
        onError: (error) => {
          console.warn("Firebase push setup failed", error);
        },
      });
    }, 3000);

    return () => window.clearTimeout(timer);
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
          <ReminderPanel />
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
