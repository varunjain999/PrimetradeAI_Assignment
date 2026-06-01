import { useState } from 'react';
import { request } from '../api/client';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

function AuthCard({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setFieldErrors([]);

    try {
      const payload =
        mode === 'register'
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const response = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessage(response.message);
      setForm(initialForm);
      onAuthSuccess(response.data.user);
    } catch (apiError) {
      setError(apiError.message);
      setFieldErrors(Array.isArray(apiError.details) ? apiError.details : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-header">
        <span className="eyebrow">Secure access</span>
        <h2>{mode === 'register' ? 'Create account' : 'Welcome back'}</h2>
        <p>Register, log in, and use JWT-protected task APIs from one simple screen.</p>
      </div>

      <div className="tabs">
        <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')} type="button">
          Login
        </button>
        <button
          className={mode === 'register' ? 'tab active' : 'tab'}
          onClick={() => setMode('register')}
          type="button"
        >
          Register
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {mode === 'register' ? (
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Your full name"
              required
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="name@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimum 8 characters"
            required
          />
        </label>

        {error ? <div className="alert error">{error}</div> : null}
        {fieldErrors.length > 0 ? (
          <ul className="field-error-list">
            {fieldErrors.map((fieldError) => (
              <li key={`${fieldError.field}-${fieldError.message}`}>
                <strong>{fieldError.field}:</strong> {fieldError.message}
              </li>
            ))}
          </ul>
        ) : null}
        {message ? <div className="alert success">{message}</div> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'register' ? 'Register' : 'Login'}
        </button>
      </form>
    </section>
  );
}

export default AuthCard;
