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
import type { GradeNumber, User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * НЭВТРЭЛТ — Supabase Auth (имэйл + нууц үг)
 *
 * ⚠️ ЭНД БАЙГАА `role` НЬ ЗӨВХӨН UI-Д ЗОРИУЛАГДСАН.
 * Браузерын консолоос энэ утгыг өөрчилж болно. Бодит эрхийн шалгалт нь:
 *   • lib/auth-server.ts   — хуудсанд нэвтрэх эрх (сервер)
 *   • supabase/0002_rls.sql — өгөгдөл унших/бичих эрх (дата сан)
 *
 * Хэрэглэгч өөрийгөө «админ» гэж хуурсан ч дата сан түүнд юу ч өгөхгүй.
 */

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  claimRole: (
    role: "parent" | "teacher",
    teacherCode?: string,
  ) => Promise<{ error: string | null }>;
  isRole: (...roles: UserRole[]) => boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  role: "student" | "parent" | "teacher";
  grade?: GradeNumber | null;
  /** Багшийн урилгын код — сервер талд шалгагдана */
  teacherCode?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Supabase-ийн англи алдааг ойлгомжтой монгол текст болгоно. */
function translateError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Имэйл эсвэл нууц үг буруу байна.",
    "Email not confirmed":
      "Имэйлээ баталгаажуулаагүй байна. Ирсэн захидлаа шалгана уу.",
    "User already registered": "Энэ имэйл аль хэдийн бүртгэлтэй байна.",
    "Password should be at least 6 characters":
      "Нууц үг дор хаяж 6 тэмдэгт байх ёстой.",
    "Unable to validate email address: invalid format":
      "Имэйл хаяг буруу форматтай байна.",
    "For security purposes, you can only request this after 60 seconds.":
      "Аюулгүй байдлын үүднээс 60 секундын дараа дахин оролдоно уу.",
  };

  for (const [english, mongolian] of Object.entries(map)) {
    if (message.includes(english)) return mongolian;
  }

  /*
   * «Unexpected token '<'» гэдэг нь JSON хүлээж байсан газар HTML ирснийг
   * хэлнэ — өөрөөр хэлбэл NEXT_PUBLIC_SUPABASE_URL нь Supabase биш өөр
   * хуудас руу зааж байна. Түүхий алдааг харуулахын оронд шалтгааныг хэлнэ.
   */
  if (
    message.includes("is not valid JSON") ||
    message.includes("Unexpected token") ||
    message.includes("<!DOCTYPE")
  ) {
    return (
      "Серверийн тохиргоо буруу байна: NEXT_PUBLIC_SUPABASE_URL нь Supabase " +
      "рүү зааж байгаа эсэхийг шалгана уу (https://<project-ref>.supabase.co)."
    );
  }

  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return "Сүлжээнд холбогдож чадсангүй. Дахин оролдоно уу.";
  }

  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isSupabaseConfigured();

  /** auth.users → profiles хүснэгтээс дэлгэрэнгүйг татна. */
  const loadProfile = useCallback(
    async (userId: string, email: string): Promise<User> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      return {
        id: userId,
        name: data?.name ?? email.split("@")[0],
        email,
        role: (data?.role as UserRole) ?? "student",
        grade: (data?.grade as GradeNumber | null) ?? null,
        avatar: data?.avatar ?? "🧑‍🎓",
        createdAt: data?.created_at ?? "",
      };
    },
    [],
  );

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) {
        const profile = await loadProfile(data.user.id, data.user.email ?? "");
        if (active) setUser(profile);
      }
      if (active) setReady(true);
    });

    /* Нэвтрэх/гарах бүрд төлөвийг шинэчилнэ (өөр таб дээр гарсан ч мэдэрнэ) */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? "");
        if (active) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!configured) {
      return { error: "Supabase тохируулаагүй байна." };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return { error: error ? translateError(error.message) : null };
  }, [configured]);

  /**
   * Эцэг эх / багшийн эрхийг сервер талаас хүсэх.
   * Сервер нь хэрэглэгчийг session-аас тодорхойлдог тул нэвтэрсэн байх ёстой.
   */
  const claimRole = useCallback(
    async (role: "parent" | "teacher", teacherCode?: string) => {
      try {
        const response = await fetch("/api/auth/claim-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, teacherCode }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { error: String(result.error ?? "Эрх олгоход алдаа гарлаа") };
        }

        /* Профайл шинэчлэгдсэн тул дахин уншина */
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(await loadProfile(data.user.id, data.user.email ?? ""));
        }

        return { error: null };
      } catch {
        return { error: "Сүлжээний алдаа" };
      }
    },
    [loadProfile],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      if (!configured) {
        return { error: "Supabase тохируулаагүй байна.", needsEmailConfirm: false };
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          /*
           * Эдгээр нь `handle_new_user` trigger-т очиж profiles хүснэгтэд
           * бичигдэнэ. `role`-ыг ЭНД дамжуулахгүй — trigger нь бүх шинэ
           * хэрэглэгчийг «student» болгодог. Эс тэгвэл хэн ч өөрийгөө
           * админ болгож бүртгүүлэх байсан.
           */
          data: {
            name: input.name.trim(),
            grade: input.grade ? String(input.grade) : "",
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        return { error: translateError(error.message), needsEmailConfirm: false };
      }

      /*
       * Эрх олгох нь ЗААВАЛ идэвхтэй session шаарддаг (сервер тал нь
       * хэрэглэгчийг session-аас тодорхойлдог). Имэйл баталгаажуулалт
       * идэвхтэй бол энд session байхгүй — хэрэглэгч нэвтэрсний дараа
       * эрхээ авна.
       */
      if (data.session && input.role !== "student") {
        await claimRole(input.role, input.teacherCode);
      }

      return { error: null, needsEmailConfirm: !data.session };
    },
    [configured, claimRole],
  );

  const signOut = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, [configured]);

  const isRole = useCallback(
    (...roles: UserRole[]) => roles.includes(user?.role ?? "guest"),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, configured, signIn, signUp, signOut, claimRole, isRole }),
    [user, ready, configured, signIn, signUp, signOut, claimRole, isRole],
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
