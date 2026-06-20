import { Request, Response } from "express";
import { registerUser, loginUser, getUserProfile } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { logoutUser } from "./auth.service.js";

// ^Register user controller logic
export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        const tokens = await registerUser(data);

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({ message: "User registered" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ^Login controller logic
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const tokens = await loginUser(data);

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ message: "Login successful" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ^get user profile controller logic
export const getProfile = async (req: Request, res: Response) => {
  try {
    //  !Get the ID from the middleware 
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ error: "Not authorized, no user ID" });
    }

    //  !Call the Service
    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //  !Return the fresh database data
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ^Logout controller logic

export const logout = async (req: Request, res: Response) => {
  try {
    //  !Get userId from the authMiddleware (req.user)
    const userId = req.user?.id;

    //  !If user exists, clean up Redis
    if (userId) {
      await logoutUser(userId);
    }

    //  !Clear the cookies from the browser
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Logout failed" });
  }
};