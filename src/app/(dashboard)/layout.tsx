"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VillageProvider } from "@/components/providers/village-provider";

export interface MobileNavContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const MobileNavContext = React.createContext<MobileNavContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function useMobileNav() {
  return React.useContext(MobileNavContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const mobileNavValue = React.useMemo<MobileNavContextValue>(
    () => ({
      isOpen: isMobileNavOpen,
      open: () => setIsMobileNavOpen(true),
      close: () => setIsMobileNavOpen(false),
      toggle: () => setIsMobileNavOpen((prev) => !prev),
    }),
    [isMobileNavOpen]
  );

  return (
    <VillageProvider>
      <MobileNavContext.Provider value={mobileNavValue}>
        <div className="h-screen w-full overflow-hidden flex bg-[#F8FAFF]">
          {/* Left Sidebar: Persistent on lg+, slide-over drawer on <lg */}
          <React.Suspense
            fallback={
              <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200/80 bg-white h-full" />
            }
          >
            <Sidebar
              isOpen={isMobileNavOpen}
              onClose={() => setIsMobileNavOpen(false)}
            />
          </React.Suspense>

          {/* Main Content Area with independent scroll */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <Header onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)} />
            <main className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </div>
      </MobileNavContext.Provider>
    </VillageProvider>
  );
}
