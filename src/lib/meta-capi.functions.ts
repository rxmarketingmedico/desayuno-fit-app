import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { createHash } from "crypto";

const META_PIXEL_ID = "2325137881220288";
const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export const trackMetaPageView = createServerFn({ method: "POST" })
  .inputValidator((input: { eventId: string; eventSourceUrl: string; email?: string }) => {
    if (!input || typeof input.eventId !== "string" || input.eventId.length < 8 || input.eventId.length > 128) {
      throw new Error("Invalid eventId");
    }
    if (typeof input.eventSourceUrl !== "string" || input.eventSourceUrl.length > 2048) {
      throw new Error("Invalid eventSourceUrl");
    }
    if (input.email !== undefined && (typeof input.email !== "string" || input.email.length > 320)) {
      throw new Error("Invalid email");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[meta-capi] Missing META_CAPI_ACCESS_TOKEN");
      return { ok: false, error: "missing_token" };
    }

    try {
      const request = getRequest();
      const userAgent = getRequestHeader("user-agent") ?? "";
      const ip =
        getRequestIP({ xForwardedFor: true }) ??
        getRequestHeader("cf-connecting-ip") ??
        getRequestHeader("x-real-ip") ??
        "";

      // Try to read Meta's browser cookies forwarded by the client request
      const cookieHeader = getRequestHeader("cookie") ?? "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...rest] = c.trim().split("=");
          return [k, rest.join("=")];
        }),
      );
      const fbp = cookies["_fbp"];
      const fbc = cookies["_fbc"];

      const userData: Record<string, unknown> = {
        client_user_agent: userAgent,
      };
      if (ip) userData.client_ip_address = ip;
      if (fbp) userData.fbp = fbp;
      if (fbc) userData.fbc = fbc;
      if (data.email) userData.em = [sha256(data.email)];

      const payload = {
        data: [
          {
            event_name: "PageView",
            event_time: Math.floor(Date.now() / 1000),
            event_id: data.eventId,
            event_source_url: data.eventSourceUrl,
            action_source: "website",
            user_data: userData,
          },
        ],
      };

      const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[meta-capi] Meta API error", res.status, text);
        return { ok: false, error: `meta_${res.status}` };
      }

      return { ok: true };
    } catch (error) {
      console.error("[meta-capi] PageView failed", error);
      return { ok: false, error: "exception" };
    }
  });
