"use client";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateOrganizationPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const createOrg = useMutation(api.organizations.createOrg);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { orgId, channelId } = await createOrg({ name });
        router.push(`/dashboard/${orgId}/${channelId}`);
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Create an Organization</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium ">
                            Organization Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Organization
                    </button>
                </form>
            </div>
        </div>
    );
}
