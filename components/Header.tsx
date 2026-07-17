"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export function Header() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data ?? null);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data ?? null));
      } else {
        setProfile(null);
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="text-2xl">📚</span>
          NoveltyScholars
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#services" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Services
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            How It Works
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href={profile?.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {profile?.full_name || user.email}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
          <Link href="/order">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Order Now
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4 pt-2 space-y-3">
          <Link
            href="/#services"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/pricing"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/#how-it-works"
            className="block text-sm font-medium text-gray-600 hover:text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </Link>
          <div className="pt-2 border-t space-y-2">
            {user ? (
              <>
                <Link
                  href={profile?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {profile?.full_name || user.email}
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
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
            <Link href="/order" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
