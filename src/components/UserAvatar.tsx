import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { User, LogOut, Settings } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { toast } from "sonner";

interface UserAvatarProps {
  userEmail: string;
}

export function UserAvatar({ userEmail }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out", {
          description: error.message,
        });
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      toast.error("Error signing out", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setIsOpen(false);
  };

  // Generate initials from email
  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Generate a consistent avatar color based on email
  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-white/10"
        >
          <Avatar className="h-10 w-10 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent hover:ring-white/40 transition-all">
            <AvatarImage src="" alt={userEmail} />
            <AvatarFallback
              className={`${getAvatarColor(
                userEmail
              )} text-white font-semibold`}
            >
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 bg-background/95 backdrop-blur-sm border border-white/20"
        align="end"
        forceMount
      >
        {/* User Info Section */}
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={userEmail} />
            <AvatarFallback
              className={`${getAvatarColor(userEmail)} text-white text-sm`}
            >
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">
              {userEmail.split("@")[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation Options */}
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center">
            <span className="text-sm font-medium">Theme</span>
          </div>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
