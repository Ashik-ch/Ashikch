let reminderTimer = null;
let activeReminder = null;

const showReminderNotification = (message) => {
    self.registration.showNotification('Portfolio Reminder', {
        body: message,
        icon: '/icon.svg',
        badge: '/icon.svg',
    });
};

const clearReminderTimer = () => {
    if (reminderTimer) {
        clearTimeout(reminderTimer);
        reminderTimer = null;
    }
};

const scheduleReminder = (reminder) => {
    clearReminderTimer();
    activeReminder = reminder;
    const delay = reminder.dueTime - Date.now();
    if (delay <= 0) {
        showReminderNotification(reminder.message);
        return;
    }

    reminderTimer = setTimeout(() => {
        showReminderNotification(reminder.message);
        activeReminder = null;
    }, delay);
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data?.type === 'SET_REMINDER') {
        scheduleReminder(event.data.data);
    }

    if (event.data?.type === 'CLEAR_REMINDER') {
        clearReminderTimer();
        activeReminder = null;
    }
});

self.addEventListener('push', (event) => {
    const payload = event.data ? event.data.text() : 'You have a new reminder';
    event.waitUntil(
        self.registration.showNotification('Portfolio Reminder', {
            body: payload,
            icon: '/icon.svg',
            badge: '/icon.svg',
        })
    );
});
