"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useState } from "react";
import { Plus } from "lucide-react";

export function CreateChannelModal({ orgId }: { orgId: string }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const createChannel = useMutation(api.channels.createChannel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChannel({ orgId, name, isPrivate });
    setIsOpen(false);
    setName("");
    setIsPrivate(false);
  };

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPrivate"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="isPrivate">Private Channel</Label>
            </div>
            <Button type="submit">Create Channel</Button>
          </form>
        </DialogContent>
      </Dialog>
  );
}
