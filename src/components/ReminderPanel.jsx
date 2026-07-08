import { useEffect, useMemo, useState } from "react";

function formatDateTime(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString();
}

export default function ReminderPanel() {
  const [message, setMessage] = useState("Check your portfolio updates");
  const [when, setWhen] = useState("");
  const [status, setStatus] = useState("");
  const [savedReminder, setSavedReminder] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("portfolio-reminder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedReminder(parsed);
      } catch {
        window.localStorage.removeItem("portfolio-reminder");
      }
    }
  }, []);

  const canUseNotifications = useMemo(() => {
    return typeof window !== "undefined" && "Notification" in window;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!when) {
      setStatus("Please choose a reminder time.");
      return;
    }

    if (!canUseNotifications) {
      setStatus("Notifications are not supported in this browser.");
      return;
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission was not granted.");
        return;
      }
    }

    if (Notification.permission !== "granted") {
      setStatus("Notification permission is blocked.");
      return;
    }

    const dueTime = new Date(when).getTime();
    if (Number.isNaN(dueTime) || dueTime <= Date.now()) {
      setStatus("Please choose a future time.");
      return;
    }

    const reminder = {
      id: `${Date.now()}`,
      message,
      dueTime,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem("portfolio-reminder", JSON.stringify(reminder));
    setSavedReminder(reminder);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: "SET_REMINDER",
          data: reminder,
        });
      });
    }

    setStatus("Reminder scheduled. You will get a notification on time.");
  };

  const clearReminder = () => {
    window.localStorage.removeItem("portfolio-reminder");
    setSavedReminder(null);
    setStatus("Reminder cleared.");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: "CLEAR_REMINDER",
        });
      });
    }
  };

  return (
    <section
      id="reminders"
      className="mx-auto mb-20 max-w-6xl rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur"
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
            Reminders
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Set a reminder for your next visit
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            If this page is installed on your phone as a shortcut, reminders can
            be delivered through the app on supported devices.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_auto]"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Reminder message
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-500"
            placeholder="Example: Review my latest project"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Date and time
          <input
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 focus:border-cyan-500"
          />
        </label>

        <button
          type="submit"
          className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Schedule
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}

      {savedReminder ? (
        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-cyan-800">Active reminder</p>
              <p>{savedReminder.message}</p>
              <p>{formatDateTime(savedReminder.dueTime)}</p>
            </div>
            <button
              type="button"
              onClick={clearReminder}
              className="rounded-2xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
