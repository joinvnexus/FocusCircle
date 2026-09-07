 "use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const { user, appUser, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-sm font-bold">FC</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.24em] text-primary">FOCUSCIRCLE</div>
            <div className="text-xs text-muted-foreground">Shared accountability for modern teams</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/profile" className="flex items-center gap-2 rounded-full bg-secondary/60 px-2 py-1">
                <Avatar className="h-8 w-8">
                  {appUser?.avatar_url ? <AvatarImage src={appUser.avatar_url} alt={appUser.full_name || "User avatar"} /> : null}
                  <AvatarFallback>{getInitials(appUser?.full_name || user.email || "U")}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{appUser?.full_name || "Profile"}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Start Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
