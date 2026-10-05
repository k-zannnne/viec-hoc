'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Hoàn thành bài tập Next.js', completed: false },
    { id: '2', title: 'Đọc tài liệu Supabase', completed: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), title: newTaskTitle.trim(), completed: false },
    ]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, title: editText.trim() } : t)));
    setEditingId(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Việc học của tôi</h1>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            Đăng xuất
          </Link>
        </div>

        {/* Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nhập tên công việc học tập..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Thêm công việc
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          {(['all', 'active', 'completed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                filter === type
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'active' ? 'Chưa xong' : 'Đã xong'}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Không có công việc nào trong danh sách.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="px-2 py-1 border rounded text-sm flex-1"
                    />
                  ) : (
                    <span
                      className={`text-sm ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingId === task.id ? (
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="text-xs px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium"
                    >
                      Lưu
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(task)}
                      className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded font-medium"
                    >
                      Sửa
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}