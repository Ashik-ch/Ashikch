import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, X, Check, Circle, Trash2, Pencil, Bell, BellOff,
  AlarmClock, Flag, AlertTriangle, ListTodo, Lock, KeyRound, Eye, EyeOff,
  Copy, Globe, LoaderCircle, ShieldCheck, Search
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, orderBy, query
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { generateSaltBase64, deriveVaultKey, encryptString, decryptString } from '../lib/vaultCrypto';

const NOTIFY_KEY = 'tasks_app_notify_v1';
const NOTIFIED_KEY = 'tasks_app_notified_v1';
const LAST_EMAIL_KEY = 'vault_last_email';

const PRIORITY = {
  high: { label: 'High', order: 3, dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { label: 'Medium', order: 2, dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { label: 'Low', order: 1, dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function getDueStatus(task) {
  if (task.completed) return 'done';
  if (!task.dueDate) return 'none';
  const diff = new Date(task.dueDate).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff < 24 * 60 * 60 * 1000) return 'soon';
  return 'upcoming';
}

function formatDue(dueDate) {
  const d = new Date(dueDate);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`;
}

function mapAuthError(err) {
  const code = err?.code || '';
  console.error('[Vault] sign-in error:', code, err?.message);

  if (code.startsWith('auth/')) {
    if (code.includes('configuration-not-found') || code.includes('operation-not-allowed')) {
      return 'Email/Password sign-in is not enabled yet in Firebase Console (Authentication → Sign-in method).';
    }
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Incorrect email or password.';
    }
    if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.';
    if (code.includes('invalid-email')) return 'Enter a valid email address.';
    if (code.includes('network-request-failed')) return 'Network error — check your connection.';
    return `Sign-in failed (${code}).`;
  }

  if (code === 'permission-denied' || code.includes('permission-denied')) {
    return 'Signed in, but Firestore is blocking access. Publish the security rules (Firestore Database → Rules) and make sure the database exists.';
  }
  if (code === 'unavailable' || code.includes('unavailable')) {
    return 'Could not reach Firestore. Make sure a Firestore database has been created for this project.';
  }
  if (code === 'not-found') {
    return 'Firestore database not found for this project. Create one in Firebase Console → Firestore Database.';
  }

  return `Sign-in failed: ${code || err?.message || 'unknown error'}.`;
}

// ------------------------------------------------------------------
// Login gate — every visit to this page requires the vault password.
// Firebase Auth confirms identity; the same password also derives the
// AES key used to decrypt saved credentials (never stored anywhere).
// ------------------------------------------------------------------
function VaultLogin({ onUnlock }) {
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      localStorage.setItem(LAST_EMAIL_KEY, email.trim());

      const securityRef = doc(db, 'users', user.uid, 'meta', 'security');
      const snap = await getDoc(securityRef);
      let salt;
      if (snap.exists()) {
        salt = snap.data().salt;
      } else {
        salt = generateSaltBase64();
        await setDoc(securityRef, { salt, createdAt: Date.now() });
      }
      const key = await deriveVaultKey(password, salt);
      onUnlock(user, key);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[40%] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[40%] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
            <Lock size={20} />
          </div>
          <h1 className="font-heading font-bold text-lg">Private Space</h1>
          <p className="text-xs text-gray-400">Sign in to access Tasks &amp; saved Creds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {busy ? 'Signing in...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Tasks tab — synced to Firestore under users/{uid}/tasks.
// ------------------------------------------------------------------
function TasksTab({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'completed'
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'created'
  const [notifyEnabled, setNotifyEnabled] = useState(() => localStorage.getItem(NOTIFY_KEY) === 'true');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'medium', notes: '' });
  const notifiedRef = useRef(new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')));

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user.uid]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      tasks.forEach(t => {
        if (t.completed || !t.dueDate) return;
        if (notifiedRef.current.has(t.id)) return;
        if (new Date(t.dueDate).getTime() <= now) {
          notifiedRef.current.add(t.id);
          localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notifiedRef.current]));

          setToasts(prev => [...prev, { id: uid(), title: t.title, taskId: t.id }]);

          if (notifyEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Task due', { body: t.title, tag: t.id });
          }
        }
      });
    };
    check();
    const interval = setInterval(check, 20000);
    return () => clearInterval(interval);
  }, [tasks, notifyEnabled]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 6000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const handleToggleNotify = async () => {
    if (!notifyEnabled && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    localStorage.setItem(NOTIFY_KEY, String(next));
  };

  const resetForm = () => setForm({ title: '', dueDate: '', priority: 'medium', notes: '' });

  const openAddForm = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setForm({
      title: task.title,
      dueDate: task.dueDate || '',
      priority: task.priority,
      notes: task.notes || '',
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    if (editingId) {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', editingId), {
        title, dueDate: form.dueDate || null, priority: form.priority, notes: form.notes.trim(),
      });
      notifiedRef.current.delete(editingId);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title,
        dueDate: form.dueDate || null,
        priority: form.priority,
        notes: form.notes.trim(),
        completed: false,
        createdAt: Date.now(),
      });
    }
    setShowForm(false);
    resetForm();
    setEditingId(null);
  };

  const toggleComplete = async (task) => {
    await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
  };

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (filter === 'active') list = list.filter(t => !t.completed);
    if (filter === 'completed') list = list.filter(t => t.completed);

    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (sortBy === 'priority') return PRIORITY[b.priority].order - PRIORITY[a.priority].order;
      if (sortBy === 'deadline') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, sortBy]);

  const overdueCount = tasks.filter(t => getDueStatus(t) === 'overdue').length;
  const soonCount = tasks.filter(t => getDueStatus(t) === 'soon').length;

  return (
    <>
      {(overdueCount > 0 || soonCount > 0) && (
        <div className="px-4 sm:px-6 pt-4">
          <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl px-3 py-2.5">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              {overdueCount > 0 && <strong className="text-red-300">{overdueCount} overdue</strong>}
              {overdueCount > 0 && soonCount > 0 && ' · '}
              {soonCount > 0 && <span>{soonCount} due within 24h</span>}
            </span>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 pt-4 flex items-center justify-between gap-2">
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          {['active', 'all', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-300 focus:outline-none"
          >
            <option value="deadline" className="bg-[#0d0c15]">By deadline</option>
            <option value="priority" className="bg-[#0d0c15]">By priority</option>
            <option value="created" className="bg-[#0d0c15]">Newest first</option>
          </select>
          <button
            onClick={handleToggleNotify}
            className={`p-2.5 rounded-xl border transition-colors ${notifyEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            title={notifyEnabled ? 'Deadline alerts on' : 'Deadline alerts off'}
          >
            {notifyEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4 space-y-2.5 max-w-2xl w-full mx-auto pb-28">
        {loading && (
          <div className="flex justify-center py-16 text-gray-500">
            <LoaderCircle size={22} className="animate-spin" />
          </div>
        )}
        <AnimatePresence initial={false}>
          {filteredTasks.map(task => {
            const status = getDueStatus(task);
            const p = PRIORITY[task.priority];
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`bg-white/[0.03] border rounded-2xl p-3.5 flex items-start gap-3 ${status === 'overdue' && !task.completed ? 'border-red-500/30' : 'border-white/5'}`}
              >
                <button
                  onClick={() => toggleComplete(task)}
                  className={`mt-0.5 shrink-0 ${task.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                >
                  {task.completed ? <Check size={20} /> : <Circle size={20} />}
                </button>

                <div className="flex-1 min-w-0" onClick={() => openEditForm(task)}>
                  <p className={`text-sm font-medium break-words ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 break-words">{task.notes}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.bg} ${p.text} ${p.border}`}>
                      <Flag size={9} /> {p.label}
                    </span>
                    {task.dueDate && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        status === 'soon' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        <AlarmClock size={9} /> {formatDue(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => openEditForm(task)} className="p-1.5 text-gray-500 hover:text-white">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-500 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ListTodo size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No {filter !== 'all' ? filter : ''} tasks yet</p>
          </div>
        )}
      </div>

      <button
        onClick={openAddForm}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#15131f] border border-amber-500/30 rounded-xl px-4 py-3 shadow-xl flex items-center gap-2.5"
            >
              <AlarmClock size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Task due now</p>
                <p className="text-xs text-gray-400 truncate">{toast.title}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50 bg-[#0d0c15] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">{editingId ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Title</label>
                  <input
                    autoFocus
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="What needs to be done?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Deadline</label>
                    <input
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Priority</label>
                    <div className="flex gap-1.5">
                      {Object.entries(PRIORITY).map(([key, val]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setForm(f => ({ ...f, priority: key }))}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-semibold border transition-all ${form.priority === key ? `${val.bg} ${val.text} ${val.border}` : 'border-white/10 text-gray-500 hover:text-white'}`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any extra details..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {editingId ? 'Save Changes' : 'Add Task'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ------------------------------------------------------------------
// Creds tab — Chrome-style saved logins. Site/username are stored in
// Firestore as-is; the password is AES-GCM encrypted client-side with
// a key derived from the vault password, so it never reaches
// Firestore (or the network) as plaintext.
// ------------------------------------------------------------------
function CredsTab({ user, vaultKey }) {
  const [creds, setCreds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ site: '', username: '', password: '', notes: '' });
  const [showFormPw, setShowFormPw] = useState(false);
  const [revealedMap, setRevealedMap] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'creds'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCreds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user.uid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creds;
    return creds.filter(c => c.site.toLowerCase().includes(q) || (c.username || '').toLowerCase().includes(q));
  }, [creds, search]);

  const resetForm = () => setForm({ site: '', username: '', password: '', notes: '' });

  const openAddForm = () => {
    resetForm();
    setEditingId(null);
    setShowFormPw(false);
    setShowForm(true);
  };

  const openEditForm = async (item) => {
    let plain = revealedMap[item.id];
    if (plain === undefined) {
      try {
        plain = await decryptString(vaultKey, item.cipher, item.iv);
      } catch {
        plain = '';
      }
    }
    setForm({ site: item.site, username: item.username || '', password: plain, notes: item.notes || '' });
    setEditingId(item.id);
    setShowFormPw(false);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const site = form.site.trim();
    if (!site || !form.password) return;

    setSaving(true);
    try {
      const { cipher, iv } = await encryptString(vaultKey, form.password);
      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'creds', editingId), {
          site, username: form.username.trim(), cipher, iv, notes: form.notes.trim(), updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'creds'), {
          site, username: form.username.trim(), cipher, iv, notes: form.notes.trim(), createdAt: Date.now(),
        });
      }
      setShowForm(false);
      resetForm();
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'creds', id));
    setRevealedMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggleReveal = async (item) => {
    if (revealedMap[item.id] !== undefined) {
      setRevealedMap(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      return;
    }
    try {
      const plain = await decryptString(vaultKey, item.cipher, item.iv);
      setRevealedMap(prev => ({ ...prev, [item.id]: plain }));
    } catch {
      // wrong key or corrupted entry — silently ignore
    }
  };

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const handleCopyPassword = async (item) => {
    let plain = revealedMap[item.id];
    if (plain === undefined) {
      try {
        plain = await decryptString(vaultKey, item.cipher, item.iv);
      } catch {
        return;
      }
    }
    handleCopy(plain, `${item.id}-pw`);
  };

  return (
    <>
      <div className="px-4 sm:px-6 pt-4">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved logins..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4 space-y-2.5 max-w-2xl w-full mx-auto pb-28">
        {loading ? (
          <div className="flex justify-center py-16 text-gray-500">
            <LoaderCircle size={22} className="animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map(item => {
              const isRevealed = revealedMap[item.id] !== undefined;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex items-start gap-3"
                >
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                    <Globe size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white break-words">{item.site}</p>
                    {item.username && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-400 truncate">{item.username}</p>
                        <button onClick={() => handleCopy(item.username, `${item.id}-user`)} className="text-gray-500 hover:text-white shrink-0">
                          <Copy size={11} />
                        </button>
                        {copiedKey === `${item.id}-user` && <span className="text-[10px] text-emerald-400 shrink-0">Copied</span>}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-xs font-mono text-gray-300 tracking-wider">
                        {isRevealed ? revealedMap[item.id] : '••••••••'}
                      </span>
                      <button onClick={() => toggleReveal(item)} className="text-gray-500 hover:text-white shrink-0">
                        {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => handleCopyPassword(item)} className="text-gray-500 hover:text-white shrink-0">
                        <Copy size={12} />
                      </button>
                      {copiedKey === `${item.id}-pw` && <span className="text-[10px] text-emerald-400 shrink-0">Copied</span>}
                    </div>

                    {item.notes && <p className="text-xs text-gray-500 mt-1.5 break-words">{item.notes}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => openEditForm(item)} className="p-1.5 text-gray-500 hover:text-white">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <KeyRound size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No saved logins yet</p>
          </div>
        )}
      </div>

      <button
        onClick={openAddForm}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50 bg-[#0d0c15] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">{editingId ? 'Edit Login' : 'New Login'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Site / App</label>
                  <input
                    autoFocus
                    type="text"
                    value={form.site}
                    onChange={(e) => setForm(f => ({ ...f, site: e.target.value }))}
                    placeholder="e.g. github.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Username / Email</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Password</label>
                  <div className="relative">
                    <input
                      type={showFormPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showFormPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any extra details..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Login'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ------------------------------------------------------------------
// Page shell — auth gate, then Tasks / Creds tab switcher.
// ------------------------------------------------------------------
export default function TaskManager({ onBack }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [vaultKey, setVaultKey] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
      if (!u) setVaultKey(null);
    });
    return () => unsub();
  }, []);

  const handleLock = async () => {
    setVaultKey(null);
    await signOut(auth);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#08070d] flex items-center justify-center">
        <LoaderCircle size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user || !vaultKey) {
    return <VaultLogin onUnlock={(u, key) => { setUser(u); setVaultKey(key); }} />;
  }

  return (
    <div className="min-h-screen bg-[#08070d] text-white flex flex-col font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[40%] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[40%] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-heading font-bold">Private Space</h1>
            <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLock}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          title="Lock & sign out"
        >
          <Lock size={16} />
        </button>
      </header>

      <div className="px-4 sm:px-6 pt-4">
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 max-w-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'tasks' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            <ListTodo size={14} /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('creds')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'creds' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            <KeyRound size={14} /> Creds
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? <TasksTab user={user} /> : <CredsTab user={user} vaultKey={vaultKey} />}
    </div>
  );
}
