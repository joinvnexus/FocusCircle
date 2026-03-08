import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <div className="text-lg font-semibold">FocusCircle</div>
          <p className="max-w-md text-sm text-muted-foreground">
            Productivity for people who work better with shared goals, lightweight communication, and visible momentum.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium">Product</div>
          <Link href="/features" className="block text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/blog" className="block text-muted-foreground hover:text-foreground">Blog</Link>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium">Access</div>
          <Link href="/login" className="block text-muted-foreground hover:text-foreground">Login</Link>
          <Link href="/signup" className="block text-muted-foreground hover:text-foreground">Sign up</Link>
          <Link href="/reset-password" className="block text-muted-foreground hover:text-foreground">Reset password</Link>
        </div>
      </div>
    </footer>
  );
}
