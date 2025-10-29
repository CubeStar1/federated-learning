"use client";

import React, { useState, useTransition } from "react";
import Social from "./social";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FormSchema = z.object({
  email: z.string().email({
    message: "Invalid Email Address",
  }),
  password: z.string().min(6, {
    message: "Password is too short",
  }),
});

export default function SignIn() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const appName = process.env.NEXT_PUBLIC_APP_NAME!;
  const appIcon = process.env.NEXT_PUBLIC_APP_ICON!;
  const redirectTo = next || "/";

  return (
    <div className="flex min-h-[550px] w-[min(100%,24rem)] sm:w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 flex-col lg:flex-row">
      {/* Left Panel - Decorative */}
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-zinc-100/60 bg-linear-to-br from-zinc-100 via-white to-zinc-200 p-4 sm:p-8 lg:p-12 dark:border-zinc-800/60 dark:from-zinc-900 dark:via-zinc-950 dark:to-black lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(161,161,170,0.15),transparent_65%)]" />
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
            Welcome back! Sign in to continue your journey with us.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12">
        <div className="max-w-sm mx-auto space-y-6 lg:space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Welcome Back
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to continue to {appName}
            </p>
          </div>

          <Social redirectTo={redirectTo} />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent"></div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">or</div>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent"></div>
          </div>

          <SignInForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [passwordReveal, setPasswordReveal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const supabase = createSupabaseBrowser();
    if (!isPending) {
      startTransition(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) {
          toast.error(error.message);
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  className="h-10 sm:h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  placeholder="example@gmail.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    className="h-10 sm:h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 pr-10"
                    type={passwordReveal ? "text" : "password"}
                    {...field}
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    onClick={() => setPasswordReveal(!passwordReveal)}
                  >
                    {passwordReveal ? (
                      <FaRegEye className="w-4 h-4" />
                    ) : (
                      <FaRegEyeSlash className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <AiOutlineLoading3Quarters
            className={cn("w-4 h-4", !isPending ? "hidden" : "animate-spin")}
          />
          Sign In
        </Button>
        <div className="text-center text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <h1>
            Don&apos;t have an account yet?{" "}
            <Link
              href={redirectTo ? `/register?next=${redirectTo}` : "/register"}
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Register
            </Link>
          </h1>
        </div>
      </form>
    </Form>
  );
}
