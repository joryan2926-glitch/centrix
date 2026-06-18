"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function UpgradeRequired() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
