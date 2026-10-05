'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

interface Task {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      throw new Error('Chưa đăng nhập');
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401) {
      router.push('/login');
      throw new Error('Phiên đăng nhập hết hạn');
    }

    return res;
  }, [supabase, router]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.data || []);
      } else {
        setError(data.error || 'Lỗi tải công việc');
      }
    } catch {
      // Đã xử lý chuyển hướng ở apiFetch
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        loadTasks();
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setTasks([]);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, loadTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length > 120) {
      setError('Tên công việc phải từ 1 đến 120 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: trimmedTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle('');
        loadTasks();
      } else {
        setError(data.error);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDone = async (task: Task) => {
    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_done: !task.is_done }),
      });
      if (res.ok) loadTasks();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle || trimmedTitle.length > 120) {
      setError('Tên công việc phải từ 1 đến 120 ký tự');
      return;
    }

    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (res.ok) {
        setEditingId(null);
        loadTasks();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;

    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) loadTasks();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.is_done;
    if (filter === 'completed') return t.is_done;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Việc học của tôi</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên công việc học tập..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Đang thêm...' : 'Thêm công việc'}
          </button>
        </form>

        <div className="flex gap-2 border-b border-gray-200 pb-3">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'active' ? 'Chưa xong' : 'Đã xong'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Đang tải công việc...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Chưa có công việc nào.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {filteredTasks.map((task) => (
              <div key={task.id} data-testid="task-item" className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.is_done}
                    onChange={() => handleToggleDone(task)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <span className={`text-sm ${task.is_done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingId === task.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(task.id);
                          setEditingTitle(task.title);
                        }}
                        className="text-xs text-gray-600 hover:text-indigo-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}