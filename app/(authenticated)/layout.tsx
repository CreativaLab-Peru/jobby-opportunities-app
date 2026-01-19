"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {SidebarProvider, SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";
import {Separator} from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full"> {/* Contenedor raíz para asegurar estabilidad */}
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          {/* Header Superior */}
          {/* Contenido Principal */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 sm:pl-64 lg:pl-60">
            <div className="flex items-end justify-between sm:justify-between mb-6 w-full">
              <div className="flex sm:hidden">
                <SidebarTrigger className="-ml-1" />
              </div>
              <div className="text-sm text-muted-foreground hidden sm:block">
                Levely v.1.0.0
              </div>
              <UserNav user={{ name: session.user.name, email: session.user.email }} />
            </div>

            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
