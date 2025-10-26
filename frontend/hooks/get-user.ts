import { createSupabaseServer } from "@/lib/supabase/server";

export const getUser = async () => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export type ServerUser = Awaited<ReturnType<typeof getUser>>;
