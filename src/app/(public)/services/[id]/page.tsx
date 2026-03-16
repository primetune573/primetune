import fs from "fs";
import path from "path";
import ServiceDetailsClient from "./ServiceDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getServiceById(id: string) {
    const servicesFile = path.join(process.cwd(), 'services.json');
    if (fs.existsSync(servicesFile)) {
        const services = JSON.parse(fs.readFileSync(servicesFile, 'utf-8'));
        return services.find((s: any) => s.id === id);
    }
    return null;
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
        return notFound();
    }

    return <ServiceDetailsClient service={service} />;
}
