"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="p-10">
      <button
        onClick={() => signIn("strava")}
        className="bg-orange-500 text-white px-4 py-2"
      >
        Connect Strava
      </button>
    </div>
  );
}