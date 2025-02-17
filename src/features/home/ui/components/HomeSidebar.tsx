import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarMainSection } from "@/features/home/ui/components/SidebarMainSection";
import { SidebarPersonalSection } from "@/features/home/ui/components/SidebarPersonalSection";

export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarMainSection />
        <Separator />
        <SidebarPersonalSection />
      </SidebarContent>
    </Sidebar>
  );
};
