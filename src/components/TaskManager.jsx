import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, X, Check, Circle, Trash2, Pencil, Bell, BellOff,
  AlarmClock, Flag, AlertTriangle, ListTodo
} from 'lucide-react';

const TASKS_KEY = 'tasks_app_data_v1';
const NOTIFY_KEY = 'tasks_app_notify_v1';
const NOTIFIED_KEY = 'tasks_app_notified_v1';

const PRIORITY = {
  high: { label: 'High', order: 3, dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { label: 'Medium', order: 2, dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { label: 'Low', order: 1, dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

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

export default function TaskManager({ onBack }) {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'completed'
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'created'
  const [notifyEnabled, setNotifyEnabled] = useState(() => localStorage.getItem(NOTIFY_KEY) === 'true');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'medium', notes: '' });
  const notifiedRef = useRef(new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')));

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Deadline watcher: fires an alert once per task when its due time arrives
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

  // Auto-dismiss toasts
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    if (editingId) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title, dueDate: form.dueDate || null, priority: form.priority, notes: form.notes.trim() } : t));
      notifiedRef.current.delete(editingId);
    } else {
      const newTask = {
        id: uid(),
        title,
        dueDate: form.dueDate || null,
        priority: form.priority,
        notes: form.notes.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setShowForm(false);
    resetForm();
    setEditingId(null);
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
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

  const activeCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => getDueStatus(t) === 'overdue').length;
  const soonCount = tasks.filter(t => getDueStatus(t) === 'soon').length;

  return (
    <div className="min-h-screen bg-[#08070d] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[40%] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[40%] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              <ListTodo size={18} className="text-blue-400" /> Tasks
            </h1>
            <p className="text-[11px] text-gray-400">{activeCount} active{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}</p>
          </div>
        </div>

        <button
          onClick={handleToggleNotify}
          className={`p-2.5 rounded-xl border transition-colors ${notifyEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          title={notifyEnabled ? 'Deadline alerts on' : 'Deadline alerts off'}
        >
          {notifyEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
      </header>

      {/* Deadline alert banner */}
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

      {/* Filters + Sort */}
      <div className="px-4 sm:px-6 pt-4 flex items-center justify-between gap-3">
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-300 focus:outline-none"
        >
          <option value="deadline" className="bg-[#0d0c15]">By deadline</option>
          <option value="priority" className="bg-[#0d0c15]">By priority</option>
          <option value="created" className="bg-[#0d0c15]">Newest first</option>
        </select>
      </div>

      {/* Task list */}
      <div className="flex-1 px-4 sm:px-6 py-4 space-y-2.5 max-w-2xl w-full mx-auto pb-28">
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
                  onClick={() => toggleComplete(task.id)}
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ListTodo size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No {filter !== 'all' ? filter : ''} tasks yet</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openAddForm}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Toast alerts */}
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

      {/* Add/Edit Form — bottom sheet on mobile, centered modal on desktop */}
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
    </div>
  );
}
