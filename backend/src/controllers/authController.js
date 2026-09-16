import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinimumLength = 8;

function safeUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt };
}

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 24
  };
}

function setAuthCookie(response, user) {
  const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, { expiresIn: '1d' });
  response.cookie('authToken', token, authCookieOptions());
}

export async function signup(request, response, next) {
  const { name, email, password } = request.body ?? {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (trimmedName.length < 2 || trimmedName.length > 100 || !emailPattern.test(normalizedEmail) || typeof password !== 'string' || password.length < passwordMinimumLength) {
    return response.status(400).json({
      error: `Provide a name, a valid email address, and a password of at least ${passwordMinimumLength} characters.`
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: trimmedName, email: normalizedEmail, passwordHash });
    setAuthCookie(response, user);
    return response.status(201).json({ user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ error: 'An account with this email address already exists.' });
    }
    return next(error);
  }
}

export async function login(request, response, next) {
  const { email, password } = request.body ?? {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!emailPattern.test(normalizedEmail) || typeof password !== 'string' || password.length === 0) {
    return response.status(400).json({ error: 'Enter a valid email address and password.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    const isPasswordValid = user && await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return response.status(401).json({ error: 'Invalid email or password.' });
    }

    setAuthCookie(response, user);
    return response.status(200).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function logout(_request, response) {
  response.clearCookie('authToken', { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production' });
  return response.status(200).json({ message: 'Logged out successfully.' });
}

export function getCurrentUser(request, response) {
  return response.status(200).json({ user: safeUser(request.user) });
}
