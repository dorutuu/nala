"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function InviteDialog({ orgId, children }: { orgId: string; children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [isOpen, setIsOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const createInvite = useMutation(api.organizations.createInvite);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await createInvite({ orgId, email, role });
      const origin = window.location.origin;
      setGeneratedLink(`${origin}/invite/${token}`);
    } catch (error) {
      console.error("Error creating invite:", error);
      // You could add some user-facing error state here
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast("Link has been copied");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEmail("");
      setRole("member");
      setGeneratedLink(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a new member</DialogTitle>
        </DialogHeader>
        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setRole(value as "member" | "admin")} defaultValue={role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Generate Invitation Link</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p>Share this link with the person you want to invite:</p>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="flex-1" />
              <Button size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
