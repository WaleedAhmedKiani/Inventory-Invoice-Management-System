import { Request, Response } from "express";
import { registerUser, loginUser, getUserProfile } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { logoutUser } from "./auth.service.js";

// Helper for cross-domain cookie options in production
const getCookieOptions = (maxAge: number) => ({
    httpOnly: true,
    // Must be true in production to allow HTTPS transmission
    secure: process.env.NODE_ENV === "production",
    // Must be "none" in production to allow cross-domain requests between Vercel and Render
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    maxAge,
});

// ^Register user controller logic
export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const tokens = await registerUser(data) as any; // Type-cast to any to allow optional property mapping safely

        // 1. Set cookies using cross-domain safe options
        res.cookie("accessToken", tokens.accessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie("refreshToken", tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        // 2. Return the token directly in the JSON response so the frontend can save it in localStorage!
        res.status(201).json({ 
            message: "User registered successfully", 
            token: tokens.accessToken, // matching localStorage.setItem("token")
            ...(tokens.user ? {
                user: {
                    id: tokens.user.id,
                    email: tokens.user.email,
                    name: tokens.user.name
                }
            } : {})
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ^Login controller logic
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);
        const tokens = await loginUser(data) as any; // Type-cast to any to allow optional property mapping safely

        // 1. Set cookies using cross-domain safe options
        res.cookie("accessToken", tokens.accessToken, getCookieOptions(15 * 60 * 1000));
        if (tokens.refreshToken) {
            res.cookie("refreshToken", tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        }

        // 2. Return the token directly in the JSON response so the frontend can save it in localStorage!
        res.json({ 
            message: "Login successful", 
            token: tokens.accessToken, // matching localStorage.setItem("token")
            ...(tokens.user ? {
                user: {
                    id: tokens.user.id,
                    email: tokens.user.email,
                    name: tokens.user.name
                }
            } : {})
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ^get user profile controller logic
export const getProfile = async (req: Request, res: Response) => {
  try {
    // !Get the ID from the middleware (supports decoded tokens or cookies)
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ error: "Not authorized, no user ID" });
    }

    // !Call the Service
    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // !Return the fresh database data
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ^Logout controller logic
export const logout = async (req: Request, res: Response) => {
  try {
    // !Get userId from the authMiddleware (req.user)
    const userId = req.user?.id;

    // !If user exists, clean up Redis
    if (userId) {
      await logoutUser(userId);
    }

    // !Clear the cookies from the browser
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Logout failed" });
  }
};