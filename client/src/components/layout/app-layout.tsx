import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { MobileActionButton } from "./mobile-action-button";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showActionButton?: boolean;
  onActionButtonClick?: () => void;
}

export function AppLayout({ 
  children, 
  title,
  showActionButton = false,
  onActionButtonClick
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 border-r border-slate-700 max-w-[280px]">
          <Sidebar className="flex" />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-6">
        {/* Top Navigation Bar */}
        <header className="glass-dark sticky top-0 z-10 p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Mobile Action Button */}
      {showActionButton && (
        <MobileActionButton onClick={onActionButtonClick} />
      )}
    </div>
  );
}
