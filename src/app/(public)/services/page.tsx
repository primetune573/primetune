import fs from "fs";
import path from "path";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

async function getServices() {
    const servicesFile = path.join(process.cwd(), 'services.json');
    if (fs.existsSync(servicesFile)) {
        return JSON.parse(fs.readFileSync(servicesFile, 'utf-8'));
    }
    return [];
}

export default async function ServicesPage() {
    const services = await getServices();
    return <ServicesClient initialServices={services} />;
}
