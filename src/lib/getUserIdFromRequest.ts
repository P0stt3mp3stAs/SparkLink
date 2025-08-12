// src/lib/getUserIdFromRequest.ts
import jwt from 'jsonwebtoken';

export function getUserIdFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) throw new Error("Missing token");

  const decoded = jwt.decode(token) as { sub?: string };

  if (!decoded?.sub) throw new Error("Invalid token, no sub");

  return decoded.sub;
}