import AvailabilityManagement from "./AvailabilityManagement";
import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Schedule Control | PrimeTune Admin",
};

export default async function AvailabilityPage() {
    if (!await isAdmin()) {
        redirect("/admin/login");
    }

    return <AvailabilityManagement />;
}
