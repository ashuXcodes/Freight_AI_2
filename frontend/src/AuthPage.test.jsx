import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AuthPage from './AuthPage.jsx';

function renderAuthPage(mode = 'login') {
  const onAuthenticated = vi.fn();
  render(<MemoryRouter><AuthPage mode={mode} onAuthenticated={onAuthenticated} /></MemoryRouter>);
  return { onAuthenticated };
}

describe('AuthPage', () => {
  it('renders the login controls and the shared FreightAI logo', () => {
    renderAuthPage();

    expect(screen.getByRole('heading', { name: 'Sign in to FreightAI' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(screen.getByRole('img', { name: /FreightAI — Predict. Optimize. Charter Smarter./ })).toBeInTheDocument();
  });

  it('renders signup fields and reports a password confirmation error before calling the API', async () => {
    const { onAuthenticated } = renderAuthPage('signup');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await userEvent.type(screen.getByLabelText('Name'), 'Asha Kumar');
    await userEvent.type(screen.getByLabelText('Email address'), 'asha@example.test');
    await userEvent.type(screen.getByLabelText(/^Password/), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Password confirmation does not match.');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('submits valid login credentials and returns the safe user to the route owner', async () => {
    const { onAuthenticated } = renderAuthPage();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ user: { id: 'user-1', name: 'Asha Kumar', email: 'asha@example.test' } })
    }));

    await userEvent.type(screen.getByLabelText('Email address'), 'asha@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(onAuthenticated).toHaveBeenCalledWith({ id: 'user-1', name: 'Asha Kumar', email: 'asha@example.test' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/login$/), expect.objectContaining({ credentials: 'include' }));
  });

  it('shows an authentication error returned by the API', async () => {
    const { onAuthenticated } = renderAuthPage();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'Invalid email or password.' })
    }));

    await userEvent.type(screen.getByLabelText('Email address'), 'asha@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(onAuthenticated).not.toHaveBeenCalled();
  });
});
