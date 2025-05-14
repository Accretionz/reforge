"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "@/utils/supabase/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Changed:", event, session);
      if (session) {
        router.push("/home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">Reforge</h1>
        </div>

        {/* Supabase Auth Component */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#22c55e",
                  brandAccent: "#16a34a",
                },
                space: {
                  inputPadding: "12px",
                  buttonPadding: "12px 16px",
                },
              },
            },
            // style: {
            //   // Hide the built-in forgot password link
            //   anchor: {
            //     display: "none",
            //   },
            // },
          }}
          theme="dark"
          providers={["google"]}
        />
        <div className="mt-4 text-center">
          <a
            href="/forgetPassword"
            className="text-blue-400 hover:underline text-sm"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}
