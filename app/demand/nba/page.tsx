"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NBAPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analytics/pending-review");
  }, [router]);

  return null;
}
