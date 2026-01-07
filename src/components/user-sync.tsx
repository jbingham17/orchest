"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdate);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return;

    const syncUser = async () => {
      try {
        await createOrUpdateUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || user.firstName || "User",
          imageUrl: user.imageUrl,
        });
        hasSynced.current = true;
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    syncUser();
  }, [isLoaded, user, createOrUpdateUser]);

  return null;
}
