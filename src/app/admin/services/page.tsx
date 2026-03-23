import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/AdminSkeletons";
import { createClient } from "@/utils/supabase/server";
import ServiceManager from "./ServiceManager";

async function getServices() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

    if (error) return [];

    return (data || []).map((s: any) => ({
        ...s,
        summary: s.description,
        image: s.image_url,
        emergency: s.is_emergency,
        included: s.included_items
    }));
}

export default async function AdminServicesPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/admin/login");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-6">Services Catalog</h1>

            <Suspense fallback={<TableSkeleton />}>
                <ServicesDataLoader />
            </Suspense>
        </div>
    );
}

async function ServicesDataLoader() {
    const services = await getServices();
    return <ServiceManager initialServices={services} />;
}
