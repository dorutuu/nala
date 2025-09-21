import { Authenticated, Unauthenticated } from "convex/react";

export default function DashboardPage() {
    return (
        <div>
            <Authenticated>
                <div>
                    {/* The dashboard content is now handled by the layout and the [channelId] page */}
                </div>
            </Authenticated>
            <Unauthenticated>
                <p>You must be signed in to see the dashboard.</p>
            </Unauthenticated>
        </div>
    );
}