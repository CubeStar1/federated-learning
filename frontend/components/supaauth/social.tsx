"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";
import { createSupabaseBrowser } from "@/lib/supabase/client";
export default function Social({ redirectTo }: { redirectTo: string }) {
  const loginWithProvider = async (provider: "github" | "google") => {
    const supbase = createSupabaseBrowser();
    await supbase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          window.location.origin + `/auth/callback?next=` + redirectTo,
      },
    });
  };
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row">
      <Button
        className="flex-1 min-w-32 justify-center gap-2 h-10 sm:h-11"
        variant="outline"
        onClick={() => loginWithProvider("github")}
      >
        <IoLogoGithub className="h-4 w-4" />
        Github
      </Button>
      <Button
        className="flex-1 min-w-32 justify-center gap-2 h-10 sm:h-11"
        variant="outline"
        onClick={() => loginWithProvider("google")}
      >
        <FcGoogle className="h-4 w-4" />
        Google
      </Button>
    </div>
  );
}
