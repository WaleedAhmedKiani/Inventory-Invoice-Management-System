import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyAccessToken(token) as any;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};