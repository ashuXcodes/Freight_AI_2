import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Dashboard } from './App.jsx';
import AuthPage from './AuthPage.jsx';
import VoyageResults from './VoyageResults.jsx';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function getCurrentUser() {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Unable to restore your session.');
  const payload = await response.json();
  return payload.user ?? null;
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [voyageDraft, setVoyageDraft] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (isCheckingSession) return <main className="auth-loading">Restoring your FreightAI session…</main>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" onAuthenticated={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="signup" onAuthenticated={setUser} />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={logout} initialForm={voyageDraft} onDraftChange={setVoyageDraft} onAnalysisReady={(result) => { setAnalysis(result); setVoyageDraft(result.form); navigate('/voyage-analysis'); }} /> : <Navigate to="/login" replace />} />
      <Route path="/voyage-analysis" element={user ? (analysis ? <VoyageResults user={user} onLogout={logout} analysis={analysis} onBack={() => navigate('/dashboard')} /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function RootApp() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
