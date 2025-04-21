"use server";

import createClient from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface FormData {
  job_title: string;
  company_name: string;
  location: string;
  applied_date: string; // Use Date if it's a Date object
  application_url: string;
  salary: number | string; // Use number if it's always a number
  user_id: string;
}

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

export const createPost = async (formData: FormData) => {
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

export const getUserPoints = async (userEmail: string) => {
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