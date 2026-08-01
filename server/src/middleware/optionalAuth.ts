import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';

/** Attaches req.user when a valid token is present, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // An invalid token on a public route is simply treated as anonymous.
    }
  }
  next();
}
