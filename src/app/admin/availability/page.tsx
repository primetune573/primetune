import AvailabilityManagement from "./AvailabilityManagement";
import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/AdminSkeletons";
import { getAvailabilityBlocks } from "@/app/actions/admin";

export const metadata = {
    title: "Schedule Control | PrimeTune Admin",
};

export default async function AvailabilityPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/admin/login");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-6">Schedule Control</h1>

            <Suspense fallback={<TableSkeleton />}>
                <AvailabilityDataLoader />
            </Suspense>
        </div>
    );
}

async function AvailabilityDataLoader() {
    const data = await getAvailabilityBlocks();
    return <AvailabilityManagement initialData={data} />;
}
