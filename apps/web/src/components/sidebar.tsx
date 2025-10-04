"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Hash, Lock, ChevronDown, Bell, User, UserPlus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { CreateChannelModal } from "./create-channel-modal";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteDialog } from "./invite-dialog";

export function Sidebar() {
  const params = useParams();
  const { user } = useUser();

  const orgId = params.orgId as string;

  const channelId = params.channelId as string;

  const organizations = useQuery(api.organizations.getOrganizations);

  const channels = useQuery(
    api.channels.getChannels,
    orgId ? { orgId } : "skip"
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        {isClient && orgId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent p-2 rounded-md -m-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-sidebar-primary-foreground">
                      {organizations?.[0]?.name[0] || "N"}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">
                    {organizations?.[0]?.name || "No org"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <InviteDialog orgId={orgId}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Invite members</span>
                </DropdownMenuItem>
              </InviteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Bell className="mr-2 h-4 w-4" />
            All unreads
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <User className="mr-2 h-4 w-4" />
            Threads
          </Button>
        </div>

        <Separator className="my-2 bg-sidebar-border" />

        <div className="py-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
              Channels
            </span>
            {isClient && orgId && <CreateChannelModal orgId={orgId} />}
          </div>
          <div className="space-y-0.5">
            {channels?.map((channel) => (
              <Button
                key={channel._id}
                variant={channelId === channel._id ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm font-normal ${
                  channelId === channel._id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                asChild
              >
                <Link href={`/dashboard/${orgId}/${channel._id}`}>
                  {channel.isPrivate ? (
                    <Lock className="mr-2 h-4 w-4" />
                  ) : (
                    <Hash className="mr-2 h-4 w-4" />
                  )}
                  <span className="truncate">{channel.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-2 bg-sidebar-border" />

        {/* Direct Messages */}
        {/* ... (Direct Messages section can be added here) ... */}
      </ScrollArea>

      <div className="p-2 border-t border-sidebar-border">
        <div className="flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.fullName?.split(" ")[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              Active
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
