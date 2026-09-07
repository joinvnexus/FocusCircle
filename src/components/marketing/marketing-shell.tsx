import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_32%),linear-gradient(180deg,_rgba(248,250,252,0.94),_rgba(248,250,252,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(15,23,42,1))]">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
