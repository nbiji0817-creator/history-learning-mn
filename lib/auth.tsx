"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types";
import { demoUsers } from "@/data/community";

/**
 * ДЕМО НЭВТРЭЛТ (Phase 1)
 *
 * Энэ нь зөвхөн UI-г бүрэн үзүүлэх зорилготой түр шийдэл. Нууц үг шалгахгүй,
 * бүх зүйл браузерт хадгалагдана. Production-д ЭНЭ ФАЙЛЫГ Supabase Auth-аар
 * бүрэн солино — `lib/supabase/` доторх client-ыг ашиглана.
 *
 * ЧУХАЛ: эрхийн бодит шалгалт нь сервер тал дээр Supabase RLS-ээр хийгдэнэ.
 * Client дээрх role бол зөвхөн харагдах байдлыг тохируулах зориулалттай.
 */

const STORAGE_KEY = "tuuhee-medye:session:v1";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  signInAs: (role: Exclude<UserRole, "guest">) => void;
  signOut: () => void;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { userId: string };
        const found = demoUsers.find((item) => item.id === parsed.userId);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage нь зөвхөн браузерт байдаг тул mount-ийн дараа уншина
        if (found) setUser(found);
      }
    } catch {
      // Хадгалсан сесс эвдэрсэн бол зочин хэвээр үлдэнэ.
    }
    setReady(true);
  }, []);

  const signInAs = useCallback((role: Exclude<UserRole, "guest">) => {
    const found = demoUsers.find((item) => item.role === role);
    if (!found) return;
    setUser(found);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: found.id }));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const isRole = useCallback(
    (...roles: UserRole[]) => {
      const current = user?.role ?? "guest";
      return roles.includes(current);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signInAs, signOut, isRole }),
    [user, ready, signInAs, signOut, isRole],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth-ыг AuthProvider дотор ашиглана уу.");
  }
  return context;
}

export const roleLabels: Record<UserRole, string> = {
  guest: "Зочин",
  student: "Сурагч",
  parent: "Эцэг эх",
  teacher: "Багш",
  admin: "Админ",
};
