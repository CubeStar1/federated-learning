"use client";

import React from "react";
import SignUp from "./signup";
import Social from "./social";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function Register() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const appName = process.env.NEXT_PUBLIC_APP_NAME!;
  const appIcon = process.env.NEXT_PUBLIC_APP_ICON!;
  const redirectTo = next || "/";

  return (
    <div className="flex min-h-[550px] w-[min(100%,24rem)] sm:w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 flex-col lg:flex-row">
      {/* Left Panel - Decorative */}
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-zinc-100/60 bg-linear-to-br from-zinc-100 via-white to-zinc-200 p-4 sm:p-8 lg:p-12 dark:border-zinc-800/60 dark:from-zinc-900 dark:via-zinc-950 dark:to-black lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(161,161,170,0.15),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 space-y-4 lg:space-y-6 text-center lg:text-left">
          <Image
            src={appIcon}
            alt={appName}
            width={60}
            height={60}
            className="mx-auto rounded-2xl bg-white/80 p-2 ring-2 ring-zinc-200/60 shadow-xl transition-transform hover:scale-105 lg:mx-0 dark:bg-zinc-900/70 dark:ring-zinc-700/40"
          />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 lg:text-3xl">
            {appName}
          </h2>
          <p className="mx-auto max-w-sm text-sm text-zinc-600 dark:text-zinc-300 lg:mx-0 lg:text-base">
            Register to get started.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full p-4 sm:p-8 lg:w-1/2 lg:p-12">
        <div className="mx-auto space-y-6 lg:space-y-8 max-w-sm">
          <div className="text-center space-y-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Create Account
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Welcome! Please fill in the details to get started.
            </p>
          </div>

          <Social redirectTo={redirectTo} />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">or</div>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
          </div>

          <SignUp redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
