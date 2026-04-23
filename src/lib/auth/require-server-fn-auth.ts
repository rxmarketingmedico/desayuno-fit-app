import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const requireServerFnAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    if (typeof window === "undefined") {
      return next();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      return next();
    }

    return next({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  })
  .server(async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Response(
        "Missing backend environment variables.",
        { status: 500 },
      );
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");

    if (!authHeader) {
      throw new Response("Unauthorized: No authorization header provided", {
        status: 401,
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Response("Unauthorized: Only Bearer tokens are supported", {
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      throw new Response("Unauthorized: No token provided", { status: 401 });
    }

    const serverSupabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data, error } = await serverSupabase.auth.getClaims(token);

    if (error || !data?.claims?.sub) {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }

    return next({
      context: {
        supabase: serverSupabase,
        userId: data.claims.sub,
        claims: data.claims,
      },
    });
  });
