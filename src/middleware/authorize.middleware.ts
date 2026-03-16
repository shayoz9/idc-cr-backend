import { Request, Response, NextFunction } from "express";

export type UserRole = "admin" | "user" | "moderator";

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as UserRole;

    if (!userRole) {
      res.status(401).json({ error: "User role not found in token" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden. Required role: ${allowedRoles.join(" or ")}, but user has role: ${userRole}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin role required" });
    return;
  }
  next();
};

/**
 * Middleware to check if user is admin or moderator
 */
export const isAdminOrModerator = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const role = req.user?.role as UserRole;
  if (!["admin", "moderator"].includes(role)) {
    res.status(403).json({ error: "Admin or Moderator role required" });
    return;
  }
  next();
};
