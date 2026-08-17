"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gold-50 via-white to-gold-100 dark:from-gold-950 dark:via-gray-950 dark:to-gold-900">
      {/* Background Ornamental Circle */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold-200/20 blur-3xl dark:bg-gold-500/10" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold-300/10 blur-3xl dark:bg-gold-600/10" />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gold-100 shadow-lg dark:bg-gold-900">
          <span className="text-5xl">⛪</span>
        </div>
        <h1 className="font-serif text-5xl font-bold text-gold-700 dark:text-gold-300 md:text-6xl">
          ብርሃነ ገነት
        </h1>
        <p className="mt-3 text-xl text-muted-foreground">በዓታ ለማርያም ቤተክርስቲያን</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground/70">
          የቤተክርስቲያኒቱ አስተዳደር ሥርዓት
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href="/login">
            <Button size="lg" className="bg-gold-600 hover:bg-gold-700">
              ግባ
            </Button>
          </a>
          <a href="/register">
            <Button
              size="lg"
              variant="outline"
              className="border-gold-300 text-gold-700 hover:bg-gold-50 dark:border-gold-700 dark:text-gold-300"
            >
              ይመዝገቡ
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}
