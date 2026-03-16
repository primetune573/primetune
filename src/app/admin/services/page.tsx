import { createClient } from "@/utils/supabase/server";
import ServiceManager from "./ServiceManager";

async function getServices() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

    if (error) return [];

    return data.map(s => ({
        ...s,
        summary: s.description,
        image: s.image_url,
        emergency: s.is_emergency,
        included: s.included_items
    }));
}

export default async function AdminServicesPage() {
    const services = await getServices();

    return (
        <div className="animate-in fade-in duration-500">
            <ServiceManager initialServices={services} />
        </div>
    );
}
