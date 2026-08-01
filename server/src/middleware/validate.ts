import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({ body: req.body, query: req.query, params: req.params });
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) Object.assign(req.params, parsed.params);
    if (parsed.query) (req as Request & { validatedQuery?: unknown }).validatedQuery = parsed.query;
    next();
  };
