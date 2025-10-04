import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { nanoid } from "nanoid";

export const createOrg = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const orgId = await ctx.db.insert("organizations", {
      name: name,
      ownerId: identity.subject,
      createdAt: Date.now()
    })
    await ctx.db.insert("users", {
      name: identity.name!,
      clerkId: identity.subject,
      email: identity.email!,
      avatarUrl: identity.pictureUrl!
    })

    await ctx.db.insert("orgMemberships", {
      orgId,
      userId: identity.subject,
      role: "owner",
      joinedAt: Date.now(),
    });

    const channelId = await ctx.db.insert("channels", {
      orgId,
      name: "general",
      isPrivate: false,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    return { orgId, channelId };
  },
});

export const getOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (membership) => {
        const org = (await ctx.db.get(membership.orgId as any)) as Doc<"organizations">;
        if (!org) {
          throw new Error("Organization not found");
        }
        return org;
      })
    );

    return orgs;
  },
});

export const createInvite = mutation({
  args: {
    orgId: v.string(),
    email: v.string(),
    role: v.string(), // "admin" | "member"
  },
  handler: async (ctx, { orgId, email, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if the user has permission to invite
    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", identity.subject).eq("orgId", orgId)
      )
      .first();

    if (!membership || !["admin", "owner"].includes(membership.role)) {
      throw new Error("You do not have permission to invite members");
    }

    // Generate a unique token
    const token = nanoid(32);

    // Create the invite
    await ctx.db.insert("invites", {
      orgId,
      inviterId: identity.subject,
      email,
      role,
      token,
      status: "pending",
    });

    // For now, we return the token. The frontend will construct the URL.
    return token;
  },
});

export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists, if not, create them
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: identity.name!,
        email: identity.email!,
        avatarUrl: identity.pictureUrl!,
      });
    }

    // Find the invitation
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invite) {
      throw new Error("Invitation not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invitation has already been accepted or is expired");
    }

    if (invite.email !== identity.email) {
      throw new Error("This invitation is for a different email address");
    }

    // Add the user to the organization
    await ctx.db.insert("orgMemberships", {
      orgId: invite.orgId,
      userId: identity.subject,
      role: invite.role,
      joinedAt: Date.now(),
    });

    // Update the invite status
    await ctx.db.patch(invite._id, { status: "accepted" });

    const generalChannel = await ctx.db
      .query("channels")
      .withIndex("by_org", (q) => q.eq("orgId", invite.orgId))
      .filter((q) => q.eq(q.field("name"), "general"))
      .first();

    // Return the orgId so the frontend can redirect
    return { orgId: invite.orgId, channelId: generalChannel?._id };
  },
});