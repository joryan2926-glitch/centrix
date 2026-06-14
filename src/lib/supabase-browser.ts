"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel, RealtimeChannelOptions, SupabaseClient } from "@supabase/supabase-js";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getSupabaseEnv } from "@/lib/supabase-env";

let browserClient: SupabaseClient | null = null;
let realtimeChannelSequence = 0;

function createResilientRealtimeChannel(client: SupabaseClient, topic: string, options?: RealtimeChannelOptions) {
  const channel = client.realtime.channel(`${topic}:${++realtimeChannelSequence}`, options);
  const subscribe = channel.subscribe.bind(channel);

  channel.subscribe = ((callback, timeout) => {
    try {
      return subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[CENTRIX_REALTIME_UNAVAILABLE]", { error: error?.message, status, topic });
        }
        callback?.(status, error);
      }, timeout);
    } catch (error) {
      console.warn("[CENTRIX_REALTIME_SUBSCRIBE_FAILED]", {
        error: error instanceof Error ? error.message : "Unknown realtime error",
        topic
      });
      return channel;
    }
  }) as RealtimeChannel["subscribe"];

  return channel;
}

export function createBrowserSupabaseClient() {
  if (DEMO_MODE) return null;

  const { key, url } = getSupabaseEnv();

  if (!url || !key) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } }
    });
    browserClient.channel = ((topic, options) =>
      createResilientRealtimeChannel(browserClient as SupabaseClient, topic, options)) as SupabaseClient["channel"];
  }

  return browserClient;
}
