import { useEffect, useState } from 'react';
import { request } from '../api/client';

const initialTask = {
  title: '',
  description: '',
  status: 'todo',
};

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [taskForm, setTaskForm] = useState(initialTask);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadTasks() {
    const response = await request('/tasks');
    setTasks(response.data.tasks || []);
  }

  async function loadAdminUsers() {
    if (user.role !== 'admin') {
      return;
    }

    const response = await request('/admin/users');
    setAdminUsers(response.data.users || []);
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        await Promise.all([loadTasks(), loadAdminUsers()]);
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  function startEdit(task) {
    setEditingId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
    });
  }

  function resetForm() {
    setEditingId('');
    setTaskForm(initialTask);
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const endpoint = editingId ? `/tasks/${editingId}` : '/tasks';
      const method = editingId ? 'PATCH' : 'POST';

      await request(endpoint, {
        method,
        body: JSON.stringify(taskForm),
      });

      setMessage(editingId ? 'Task updated successfully' : 'Task created successfully');
      resetForm();
      await loadTasks();
      await loadAdminUsers();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await request(`/tasks/${taskId}`, { method: 'DELETE' });
      setMessage('Task deleted successfully');
      await loadTasks();
      await loadAdminUsers();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleLogout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      onLogout();
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="hero panel">
        <div>
          <span className="eyebrow">Protected dashboard</span>
          <h1>Hi, {user.name}</h1>
          <p>
            You are signed in as <strong>{user.role}</strong>. Tasks below are protected by JWT and role-aware
            access on the backend.
          </p>
        </div>

        <button className="secondary-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <span className="eyebrow">Tasks</span>
            <h2>{editingId ? 'Edit task' : 'Create task'}</h2>
          </div>

          <form className="form" onSubmit={handleTaskSubmit}>
            <label>
              Title
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                placeholder="Task title"
                required
              />
            </label>

            <label>
              Description
              <textarea
                rows="4"
                value={taskForm.description}
                onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                placeholder="Short description"
              />
            </label>

            <label>
              Status
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            {error ? <div className="alert error">{error}</div> : null}
            {message ? <div className="alert success">{message}</div> : null}

            <div className="button-row">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update task' : 'Create task'}
              </button>
              {editingId ? (
                <button className="ghost-button" type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="eyebrow">Task list</span>
            <h2>{user.role === 'admin' ? 'All tasks' : 'Your tasks'}</h2>
          </div>

          {loading ? <p className="muted">Loading dashboard...</p> : null}

          {!loading && tasks.length === 0 ? <p className="muted">No tasks yet.</p> : null}

          <div className="list">
            {tasks.map((task) => (
              <article className="list-item" key={task._id}>
                <div className="list-item-main">
                  <div className="list-item-title-row">
                    <h3>{task.title}</h3>
                    <span className={`badge ${task.status}`}>{task.status}</span>
                  </div>
                  <p>{task.description || 'No description added.'}</p>
                </div>

                <div className="button-row compact">
                  <button className="secondary-button small" type="button" onClick={() => startEdit(task)}>
                    Edit
                  </button>
                  <button className="danger-button small" type="button" onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {user.role === 'admin' ? (
        <section className="panel admin-panel">
          <div className="panel-header">
            <span className="eyebrow">Admin</span>
            <h2>Users</h2>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default Dashboard;
