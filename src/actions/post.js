"use server";

import createClient from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { startOfWeek, isBefore } from "date-fns";

export const getAllPost = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, job_title, company_name, location, applied_date, application_url, salary, status"
    );

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data;
};

export const createPost = async (formData) => {
  const supabase = await createClient();

  const formFields = {
    job_title: formData.job_title,
    company_name: formData.company_name,
    location: formData.location,
    applied_date: formData.applied_date,
    application_url: formData.application_url,
    salary: Number(formData.salary),
    user_id: formData.user_id,
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(formFields)
    .select()
    .single();

  console.log(data, error);

  if (error) {
    return {
      error: error.message,
      formFields,
    };
  }

  redirect("/");
};

export const getUserPoints = async (userEmail) => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profile")
    .select("points")
    .eq("email", userEmail)
    .single();

  if (error) {
    console.error("Error fetching user points:", error);
    return null;
  }

  return profile?.points || 0;
};

export const getUserEmail = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user email:", error);
    return null;
  }

  return user?.email || null;
};

export const getUserMissions = async (userEmail) => {
  const supabase = await createClient();

  // Select both id and last_reset
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, last_reset")
    .eq("email", userEmail)
    .single();

  if (profileError || !profile?.id) {
    console.error("Error fetching user id for missions:", profileError);
    return [];
  }

  const now = new Date();
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday

  // If last_reset is before this Monday, reset missions
  if (!profile.last_reset || isBefore(new Date(profile.last_reset), thisMonday)) {
    // Reset user missions here (set progress to 0, completed to false, etc.)
    await supabase
      .from("user_missions")
      .update({ progress: 0, completed: false, completed_at: null })
      .eq("user_id", profile.id);

    // Update last_reset to this Monday
    await supabase
      .from("profile")
      .update({ last_reset: thisMonday.toISOString() })
      .eq("id", profile.id);
  }

  // Now, fetch user missions joined with missions table
  const { data, error } = await supabase
    .from("user_missions")
    .select(`
      id,
      mission_id,
      progress,
      completed,
      completed_at,
      missions (
        description,
        target,
        reward_points,
        reward_item
      )
    `)
    .eq("user_id", profile.id);

  if (error) {
    console.error("Error fetching user missions:", error);
    return [];
  }

  console.log("getUserMissions result:", data);

  // Flatten the missions data for easier use in the frontend
  return data.map((um) => ({
    id: um.id,
    mission_id: um.mission_id,
    progress: um.progress,
    completed: um.completed,
    completed_at: um.completed_at,
    description: um.missions?.description,
    target: um.missions?.target,
    reward_points: um.missions?.reward_points,
    reward_item: um.missions?.reward_item,
  }));
};

export const getUserDiamonds = async (userEmail) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profile")
    .select("diamond")
    .eq("email", userEmail)
    .single();

  if (error) {
    console.error("Error fetching user diamonds:", error);
    return 0;
  }
  return profile?.diamond || 0;
};

export const getUserSapphire = async (userEmail) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile")
    .select("sapphire")
    .eq("email", userEmail)
    .single();
  if (error) {
    console.error("Error fetching sapphire:", error);
    return 0;
  }
  return data?.sapphire || 0;
};