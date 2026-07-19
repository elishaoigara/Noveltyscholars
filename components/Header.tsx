"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, LogOut, Menu, X, User, Phone } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Our Services" },
  { href: "/services/take-my-online-class", label: "Take My Online Class" },
  { href: "/services/take-my-online-exam", label: "Take My Online Exam" },
];

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      {/* Announcement bar */}
      <div className="bg-primary text-white text-center text-[11px] sm:text-xs py-1.5 px-3 leading-snug">
        Order your Assignment today and save 15% with code{" "}
        <strong>ESSAYHELP</strong>
      </div>

      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg sm:text-xl text-primary shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-2xl">☁️</span>
          <span>NoveltyScholars</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+12095600466"
            className="flex items-center gap-1 text-sm font-semibold text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5" />
            +1 (209) 560-0466
          </a>
        </nav>

        {/* Desktop Auth + Theme Toggle */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Link href={profile?.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <Button variant="ghost" size="sm" className="gap-2 max-w-[160px]">
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile?.full_name ?? user.email!}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          )}
          <Link href="/order">
            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm">
              Place Order
            </Button>
          </Link>
        </div>

        {/* Mobile: Theme Toggle + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pb-4 pt-2 space-y-1 max-h-[80vh] overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary py-2.5 border-b border-border/50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+12095600466"
            className="flex items-center gap-2 text-sm font-semibold text-primary py-2.5"
          >
            <Phone className="h-4 w-4" />
            +1 (209) 560-0466
          </a>

          <div className="pt-3 border-t border-border space-y-2">
            {user ? (
              <>
                <Link
                  href={profile?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {profile?.full_name ?? user.email!}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-sm font-medium text-red-500 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">Login</Button>
              </Link>
            )}
            <Link href="/order" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                Place Order
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}