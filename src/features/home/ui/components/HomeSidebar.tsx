import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarMainSection } from "@/features/home/ui/components/SidebarMainSection";
import { SidebarPersonalSection } from "@/features/home/ui/components/SidebarPersonalSection";
import { SidebarSubscriptionSection } from "./SidebarSubscriptionSection";
import { SignedIn } from "@clerk/nextjs";

export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarMainSection />
        <Separator />
        <SidebarPersonalSection />
        <SignedIn>
          <Separator />
          <SidebarSubscriptionSection />
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};
