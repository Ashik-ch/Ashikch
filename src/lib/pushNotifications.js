import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

export async function enableFirebasePushNotifications({ onReady, onError } = {}) {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        onError?.(new Error('This browser does not support push notifications.'));
        return false;
    }

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            onError?.(new Error('Notification permission was not granted.'));
            return false;
        }
    }

    if (Notification.permission !== 'granted') {
        onError?.(new Error('Notification permission is blocked.'));
        return false;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        onError?.(new Error('Missing VITE_FIREBASE_VAPID_KEY.'));
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            window.localStorage.setItem('firebase-push-token', token);
            onReady?.(token);
        } else {
            onError?.(new Error('Unable to create a push token.'));
            return false;
        }

        onMessage(messaging, (payload) => {
            const title = payload?.notification?.title || 'Portfolio Reminder';
            const body = payload?.notification?.body || 'You have a new reminder';

            registration.showNotification(title, {
                body,
                icon: '/icon.svg',
                badge: '/icon.svg',
            });
        });

        return true;
    } catch (error) {
        onError?.(error);
        return false;
    }
}
