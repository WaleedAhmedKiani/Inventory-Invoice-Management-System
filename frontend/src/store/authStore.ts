import { create } from "zustand";
import { logoutUser } from "../services/auth.service";

type User = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "STAFF";

    organization?: {
    id: string;
    plan: "FREE" | "PRO";
    stripeCustomerId?: string;

    subscription?: {
      status: string;
      currentPeriodEnd?: string | null;
      stripeSubscriptionId?: string | null;
    } | null;

     limits?: {
      products: number | null;
      customers: number | null;
      invoices: number | null;
    };

    usage?: {
      products: number;
      customers: number;
      invoices: number;
    };
  };
};

type AuthState = {
  user: User | null;
  isChecking: boolean;
  setUser: (user: User | null) => void;
  setChecking: (loading: boolean) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isChecking: true,
  setUser: (user) => set({ user }),
  setChecking: (isChecking) => set({ isChecking }),

  logout: async () => {
    try {
      await logoutUser(); //  Tell backend to clear the HttpOnly cookie
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      //  ALWAYS clear local state regardless of API success
      set({ user: null, isChecking: false });
      
      //  Force a hard redirect to the login page
      window.location.href = "/login";
    }
  },
}));