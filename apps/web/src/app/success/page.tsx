"use client";
import { useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function SuccessPage() {
    const router = useRouter();
    const organizations = useQuery(api.organizations.getOrganizations);

    useEffect(() => {
        if (organizations === undefined) {
            return;
        }

        if (organizations.length === 0) {
            router.push("/create-organization");
        } else {
            router.push(`/dashboard?orgId=${organizations[0]._id}`);
        }
    }, [organizations, router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <Loader />
        </div>
    );
}