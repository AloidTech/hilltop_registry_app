"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/clientApp";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading } },
    children
  );
};

export async function checkProfile(user: User, router: any) {
  if (!user) return;

  try {
    const params = new URLSearchParams({ user_id: user.uid });
    const res = await fetch(`/api/profile?${params}`);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return [];
  }
}

export const useAuth = () => useContext(AuthContext);
