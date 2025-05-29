import { Request, Response, NextFunction } from "express";

export function parseQueryOperators(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedQuery: any = {};

  Object.keys(req.query).forEach((key) => {
    const match = key.match(/^(\w+)\[(\w+)\]$/);
    if (match) {
      const [, field, operator] = match;
      if (!parsedQuery[field]) parsedQuery[field] = {};
      parsedQuery[field][operator] = req.query[key];
    } else {
      parsedQuery[key] = req.query[key];
    }
  });

  res.locals.parsedQuery = parsedQuery;
  next();
}
