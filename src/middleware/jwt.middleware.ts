import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user data
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your_access_secret_key";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret_key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Create Access Token
export const createAccessToken = (payload: any): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// Create Refresh Token
export const createRefreshToken = (payload: any): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

// Verify Access Token Middleware
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Access token expired" });
    } else {
      res.status(403).json({ error: "Invalid access token" });
    }
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Refresh Token Route Handler
export const refreshTokenHandler = (req: Request, res: Response): void => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token is missing" });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = createAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });
    const newRefreshToken = createRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};
