/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Bell, Repeat } from 'lucide-react';
import { useCreateTodo, useUpdateTodo } from '../hooks/useTodos';
import type { Todo, TodoFormData, Priority, RecurrenceType, Class } from '../types';

interface TodoFormProps {
  editingTodo?: Todo | null;
  onClose: () => void;
  classes: Class[];
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-50 border-gray-200' },
];

const recurrenceOptions: { value: RecurrenceType | ''; label: string }[] = [
  { value: '', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TodoForm({ editingTodo, onClose, classes }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderOffset, setReminderOffset] = useState('');
  const [classId, setClassId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | ''>('');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const isEditing = !!editingTodo;

  // Sync form state with editingTodo
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      if (editingTodo.due_date) {
        const date = new Date(editingTodo.due_date);
        setDueDate(date.toISOString().split('T')[0]);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        if (hours !== '00' || minutes !== '00') {
          setDueTime(`${hours}:${minutes}`);
        }
      }
      setClassId(editingTodo.class_id || '');
      setPriority(editingTodo.priority);
      setRecurrenceType(editingTodo.recurrence_type || '');
      setRecurrenceInterval(editingTodo.recurrence_interval || 1);
      if (editingTodo.recurrence_end_date) {
        setRecurrenceEndDate(editingTodo.recurrence_end_date.split('T')[0]);
      }
      if (editingTodo.reminder_time || editingTodo.recurrence_type) {
        setShowAdvanced(true);
      }
    }
  }, [editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let dueDateISO: string | undefined;
    if (dueDate) {
      const dateStr = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T00:00:00`;
      dueDateISO = new Date(dateStr).toISOString();
    }

    let reminderTimeISO: string | undefined;
    if (dueDateISO && reminderOffset) {
      const dueDateTime = new Date(dueDateISO);
      const offsetMinutes = parseInt(reminderOffset, 10);
      reminderTimeISO = new Date(dueDateTime.getTime() - offsetMinutes * 60 * 1000).toISOString();
    }

    const formData: TodoFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDateISO,
      reminder_time: reminderTimeISO,
      class_id: classId || undefined,
      priority,
      recurrence_type: recurrenceType || undefined,
      recurrence_interval: recurrenceType ? recurrenceInterval : undefined,
      recurrence_end_date: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
    };

    try {
      if (isEditing) {
        await updateTodo.mutateAsync({ id: editingTodo.id, updates: formData });
      } else {
        await createTodo.mutateAsync(formData);
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setReminderOffset('');
    setClassId('');
    setPriority('medium');
    setRecurrenceType('');
    setRecurrenceInterval(1);
    setRecurrenceEndDate('');
    setShowAdvanced(false);
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close form"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="todo-title" className="sr-only">Task title</label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              aria-required="true"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="todo-description" className="sr-only">Description (optional)</label>
            <textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Priority and Class row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex gap-1" role="group" aria-label="Priority selection">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    aria-pressed={priority === p.value}
                    className={`
                      flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${priority === p.value ? p.color : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">No class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date and time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Advanced options toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Advanced options
          </button>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              {/* Reminder */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Bell size={14} />
                  Reminder
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(e.target.value)}
                  disabled={!dueDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">No reminder</option>
                  <option value="0">At due time</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
                {!dueDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Set a due date to enable reminders
                  </p>
                )}
              </div>

              {/* Recurrence */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Repeat size={14} />
                  Repeat
                </label>
                <div className="flex gap-2">
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType | '')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    {recurrenceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {recurrenceType && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">every</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value, 10) || 1)}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Recurrence end date */}
              {recurrenceType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End repeat (optional)
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    min={dueDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
