import { Request, Response, NextFunction } from "express";

// Transforms query parameters like "value[gte]=10&country=ESP" into:
// { age: { gte: "10" }, country: "ESP" }
export function parseQueryOperators(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedQuery: any = {};

  Object.keys(req.query).forEach((key) => {
    // Match pattern: field[operator] (e.g., "age[gte]", "price[lt]")
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
