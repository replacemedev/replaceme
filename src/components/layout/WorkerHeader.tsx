import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserDropdown } from "./UserDropdown";
import { MobileTriggerAndMenu } from "./MobileTriggerAndMenu";

export async function WorkerHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, username, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const displayName = profile?.first_name || profile?.username || "Worker";
  const initials = profile?.first_name 
    ? profile.first_name[0].toUpperCase() 
    : (profile?.username ? profile.username[0].toUpperCase() : "W");

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto w-full h-16">
        
        {/* Left Section: Brand/Logo & Mobile Menu Trigger */}
        <div className="flex items-center gap-4">
          <MobileTriggerAndMenu />

          <Link
            className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
            href="/worker/dashboard"
          >
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logo_favicon.png"
                alt="Replace Me Logo"
                fill
                className="object-contain"
                sizes="36px"
                priority
              />
            </div>
            <span className="font-display-md text-lg font-bold text-[#0a4a29] leading-none relative top-[-1px]">
              Replace Me
            </span>
          </Link>
        </div>

        {/* Middle Section: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/worker/dashboard"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/worker/jobs"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Jobs
          </Link>
          <Link
            href="/worker/messages"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Messages
          </Link>
        </nav>

        {/* Right Section: Utilities & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="View notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* User Profile Dropdown (Client Component) */}
          <UserDropdown profile={profile} displayName={displayName} initials={initials} />
        </div>
      </div>
    </header>
  );
}
