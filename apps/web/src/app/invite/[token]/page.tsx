"use client";

import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUp, useAuth } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "error" | "success" | "authenticating">("loading");
  const [error, setError] = useState<string | null>(null);

  const acceptInvite = useMutation(api.organizations.acceptInvite);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus("authenticating");
      return;
    }

    if (!token) {
      setStatus("error");
      setError("Invitation token is missing.");
      return;
    }

    acceptInvite({ token })
      .then(({ orgId, channelId }) => {
        setStatus("success");
        router.push(`/dashboard/${orgId}/${channelId}`);
      })
      .catch((err) => {
        setStatus("error")
        setError(err.message || "An unexpected error occurred.");
      });
  }, [token, acceptInvite, router, isSignedIn, isLoaded]);

  if (status === "loading") {
    return <Spinner />
  }

  if (status === "authenticating") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Accept Invitation</h1>
        <p className="mb-4">Please sign in or sign up to join the organization.</p>
        <SignUp
          routing="hash"
          afterSignInUrl={window.location.href}
          afterSignUpUrl={window.location.href}
          redirectUrl={window.location.href}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-red-500">Invitation Error</h1>
        <p className="mt-2">{error}</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold text-green-500">Success!</h1>
      <p className="mt-2">You have successfully joined the organization.</p>
      <p>Redirecting you now...</p>
    </div>
  );
}
