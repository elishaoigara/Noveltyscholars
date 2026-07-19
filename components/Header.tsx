"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, LogOut, Menu, X, User, Phone } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const menuIcon = mobileOpen
    ? <X className="h-5 w-5" />
    : <Menu className="h-5 w-5" />;

  const WHATSAPP = "https://api.whatsapp.com/send?phone=12095600466&text=Assignment%20help";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-primary text-white text-center text-xs py-1.5 px-4">
        Order your Assignment today and save 15% with the discount code{" "}
        <strong>ESSAYHELP</strong>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <span className="text-2xl">📚</span>
          NoveltyScholars
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Our Services
          </Link>
          <Link
            href="/services/take-my-online-class"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Take My Online Class
          </Link>
          <Link
            href="/services/take-my-online-exam"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Take My Online Exam
          </Link>
          <a
            href="tel:+12095600466"
            className="flex items-center gap-1 text-sm font-semibold text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary hover:text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {"+1 (209) 560-0466"}
          </a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link href={profile?.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {profile?.full_name ?? user.email!}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          )}
          <Link href="/order">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Place Order
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {menuIcon}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 pb-4 pt-2 space-y-3">
          <Link
            href="/"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            HOME
          </Link>
          <Link
            href="/services"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            Our Services
          </Link>
          <Link
            href="/services/take-my-online-class"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            Take My Online Class
          </Link>
          <Link
            href="/services/take-my-online-exam"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            Take My Online Exam
          </Link>
          <a
            href="tel:+12095600466"
            className="block text-sm font-semibold text-primary py-2"
          >
            {"+1 (209) 560-0466"}
          </a>

          <div className="pt-2 border-t space-y-2">
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
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">
                  Login
                </Button>
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