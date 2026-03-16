import { createClient } from "@/utils/supabase/server";
import ServiceDetailsClient from "./ServiceDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getServiceById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        ...data,
        summary: data.description,
        image: data.image_url,
        emergency: data.is_emergency,
        included: data.included_items
    };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
        return notFound();
    }

    return <ServiceDetailsClient service={service} />;
}
