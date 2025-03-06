import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchInput } from "@/features/home/ui/components/SearchInput";
import { AuthButton } from "@/features/auth/ui/components/AuthButton";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const HomeNavbar = () => {
  return (
    <nav className="home-navbar">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href="/">
            <div className="flex p-4 items-center gap-1">
              <Image src="/logo.png" alt="logo" height={32} width={32} />
              <p className="text-xl font-semibold tracking-tight">YoungTube</p>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
          <Suspense fallback={<Skeleton className="max-w-[720px]" />}>
            <SearchInput />
          </Suspense>
        </div>

        {/*  Auth */}
        <div className="flex-shrink-0 items-center flex gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
