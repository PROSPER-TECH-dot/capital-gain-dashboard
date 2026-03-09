// supabase/functions/username-login/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

type Body = {
  identifier?: string;
  password?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { identifier, password } = (await req.json().catch(() => ({}))) as Body;

    const cleanIdentifier = (identifier ?? "").trim();
    const cleanPassword = password ?? "";

    if (!cleanIdentifier || !cleanPassword) {
      return json(400, { error: "Missing identifier or password" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return json(500, { error: "Server auth not configured" });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const auth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Resolve identifier -> email (case-insensitive for username)
    let email = cleanIdentifier;
    let banned = false;

    if (!cleanIdentifier.includes("@")) {
      const { data, error } = await admin
        .from("profiles")
        .select("email,is_banned")
        .ilike("username", cleanIdentifier)
        .maybeSingle();

      if (error) return json(500, { error: "Lookup failed" });
      if (!data?.email) return json(404, { error: "User not found" });

      email = data.email;
      banned = !!data.is_banned;
    } else {
      const { data } = await admin
        .from("profiles")
        .select("is_banned")
        .eq("email", email)
        .maybeSingle();

      banned = !!data?.is_banned;
    }

    if (banned) return json(403, { error: "Account is banned" });

    const { data: signIn, error: signInError } = await auth.auth.signInWithPassword({
      email,
      password: cleanPassword,
    });

    if (signInError || !signIn.session) {
      return json(401, { error: signInError?.message || "Invalid login credentials" });
    }

    return json(200, { session: signIn.session, user: signIn.user });
  } catch (_e) {
    return json(500, { error: "Unexpected error" });
  }
});
