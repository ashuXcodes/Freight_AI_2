import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FreightAILogo from './FreightAILogo.jsx';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function authRequest(path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  let payload;
  const responseText = await response.text();

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    if (response.status === 404) {
      throw new Error('Authentication is unavailable. Restart the backend so the latest FreightAI auth routes are running.');
    }

    throw new Error(`Authentication service is unavailable (HTTP ${response.status}). Confirm that the backend is running.`);
  }
  if (!response.ok) throw new Error(payload?.error || 'Authentication could not be completed.');
  if (!payload?.user) throw new Error('The FreightAI API returned an unexpected result.');
  return payload.user;
}

export default function AuthPage({ mode, onAuthenticated }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (isSignup && form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    if (isSignup && form.password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const user = await authRequest(isSignup ? '/api/auth/signup' : '/api/auth/login', isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password });
      onAuthenticated(user);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Authentication could not be completed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel"><FreightAILogo className="auth-logo" /><p className="eyebrow">Maritime Chartering Intelligence</p><h1>Make clearer chartering decisions.</h1><p>Access vessel recommendations and port compatibility assessments from the FreightAI demo catalogue.</p></section>
      <section className="auth-form-panel">
        <form className="auth-form" onSubmit={submit}>
          <p className="section-kicker">{isSignup ? 'Create account' : 'Welcome back'}</p>
          <h2>{isSignup ? 'Start your FreightAI workspace' : 'Sign in to FreightAI'}</h2>
          <p className="auth-intro">{isSignup ? 'Create an account to use the decision-support dashboard.' : 'Use your FreightAI account to continue your analysis.'}</p>
          {isSignup && <label className="field" htmlFor="name"><span>Name</span><input id="name" name="name" autoComplete="name" value={form.name} onChange={updateForm} minLength="2" maxLength="100" required /></label>}
          <label className="field" htmlFor="email"><span>Email address</span><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateForm} required /></label>
          <label className="field" htmlFor="password"><span>Password</span><input id="password" name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={updateForm} minLength="8" required />{isSignup && <small>Use at least 8 characters.</small>}</label>
          {isSignup && <label className="field" htmlFor="confirmPassword"><span>Confirm password</span><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateForm} minLength="8" required /></label>}
          {error && <div className="message error-message" role="alert">{error}</div>}
          <button className="analyze-button" type="submit" disabled={isLoading}>{isLoading ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}</button>
          <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to FreightAI?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link></p>
        </form>
      </section>
    </main>
  );
}
