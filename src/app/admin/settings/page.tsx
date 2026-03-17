import SettingsClient from "./SettingsClient";
import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Settings | PrimeTune Admin",
};

export default async function AdminSettingsPage() {
    if (!await isAdmin()) {
        redirect("/admin/login");
    }

    return <SettingsClient />;
}
