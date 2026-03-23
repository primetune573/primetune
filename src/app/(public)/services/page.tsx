import { createClient } from "@/utils/supabase/server";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

async function getServices() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        return [];
    }

    return data.map(s => ({
        ...s,
        summary: s.description, // Map description back to summary
        image: s.image_url,
        emergency: s.is_emergency,
        included: s.included_items
    }));
}

export default async function ServicesPage() {
    const services = await getServices();
    return <ServicesClient initialServices={services} />;
}
