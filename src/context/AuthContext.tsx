"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const NOT_CONFIGURED_MESSAGE =
  "Google sign-in isn't configured yet. Add your Firebase keys to .env.local to enable it.";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled before it finished. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for Google sign-in yet. Add it under Firebase Authentication → Settings → Authorized domains.";
    case "auth/network-request-failed":
      return "Couldn't reach Google. Check your internet connection and try again.";
    case "auth/operation-not-supported-in-this-environment":
      return "Google sign-in needs http://localhost or an https:// address. Open the app via one of those and try again.";
    case "auth/cancelled-popup-request":
      return "";
    default:
      return "Google sign-in failed. Please check your internet connection and try again.";
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    if (!auth) {
      setError(NOT_CONFIGURED_MESSAGE);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = friendlyAuthError(err);
      if (message) setError(message);
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
