import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/features/auth/ui/components/AuthButton";
import { StudioUploadModal } from "@/features/studio/ui/components/StudioUploadModal";

export const StudioNavbar = () => {
  return (
    <nav className="studio-navbar">
      <div className="flex justify-between items-center gap-4 w-full">
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href="/studio">
            <div className="flex p-4 items-center gap-1">
              <Image src="/logo.png" alt="logo" height={32} width={32} />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/*  Auth */}
        <div className="flex-shrink-0 items-center flex gap-4">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
