"use client";

import supabase from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from "react";

export default function Shop() {
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserPoints = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (user) {
        console.log("Fetched user:", user);

        const { data: profile, error: profileError } = await supabase
          .from("profile")
          .select("points")
          .eq("email", user.email)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          console.log("Fetched profile:", profile);
          setPoints(profile?.points || 0);
        }
      }
    };

    fetchUserPoints();
  }, []);

  return (
    <div>
      <h1>Welcome to the shop</h1>
      {points !== null ? (
        <p>Your points: {points}</p>
      ) : (
        <p>Loading your points...</p>
      )}
    </div>
  );
}
