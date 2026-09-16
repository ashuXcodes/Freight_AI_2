import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

export async function requireAuth(request, response, next) {
  const token = request.cookies.authToken;

  if (!token) {
    return response.status(401).json({ error: 'Authentication is required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      return response.status(401).json({ error: 'Authentication is required.' });
    }

    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ error: 'Authentication is required.' });
  }
}
