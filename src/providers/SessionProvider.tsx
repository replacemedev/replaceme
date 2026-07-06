"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NavSession, GUEST_NAV_SESSION } from "@/types/nav";
import { logOut as authLogOut } from "@/actions/auth";

interface SessionContextType {
  session: NavSession;
  loading: boolean;
  logout: () => Promise<void>;
  updateSessionState: (newSession: Partial<NavSession>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: NavSession;
}) {
  const [session, setSession] = useState<NavSession>(initialSession);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const logout = async () => {
    startTransition(async () => {
      try {
        await authLogOut();
        setSession(GUEST_NAV_SESSION);
        router.push("/");
      } catch (err) {
        console.error("Sign out failed", err);
      }
    });
  };

  const updateSessionState = (newSession: Partial<NavSession>) => {
    setSession((prev) => ({
      ...prev,
      ...newSession,
    }));
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        loading: isPending,
        logout,
        updateSessionState,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
