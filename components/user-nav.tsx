"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut } from 'lucide-react'
import { signOut } from "@/lib/auth-client"

interface UserNavProps {
  user: {
    name: string;
    email: string;
  }
}

export function UserNav({ user }: UserNavProps) {
  const getInitials = (name: string, email: string): string => {
    const safeName = (name ?? "").trim();
    const safeEmail = (email ?? "").trim();

    // If there is no usable name, fall back to email or a placeholder.
    if (!safeName) {
      if (safeEmail) {
        return safeEmail[0]!.toUpperCase();
      }
      return "?";
    }

    // Take the first character of each word, keep only alphanumerics, and limit to 2.
    const wordInitials = safeName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .filter((ch) => !!ch && /[A-Za-z0-9]/.test(ch))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (wordInitials) {
      return wordInitials;
    }

    // If that failed (e.g., name is only special characters), strip non-alphanumerics
    // from the whole name and use up to the first 2 characters.
    const alnumFromName = safeName.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 2);
    if (alnumFromName) {
      return alnumFromName;
    }

    // Final fallback: use email initial if available, otherwise a placeholder.
    if (safeEmail) {
      return safeEmail[0]!.toUpperCase();
    }

    return "?";
  };

  const initials = getInitials(user.name, user.email);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
      if (typeof window !== "undefined") {
        window.alert("Ocurrió un error al cerrar sesión. Por favor, inténtalo de nuevo.");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Panel de control</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
