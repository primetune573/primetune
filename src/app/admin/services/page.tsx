import fs from "fs";
import path from "path";
import ServiceManager from "./ServiceManager";

async function getServices() {
    const servicesFile = path.join(process.cwd(), 'services.json');
    if (fs.existsSync(servicesFile)) {
        return JSON.parse(fs.readFileSync(servicesFile, 'utf-8'));
    }
    return [];
}

export default async function AdminServicesPage() {
    const services = await getServices();

    return (
        <div className="animate-in fade-in duration-500">
            <ServiceManager initialServices={services} />
        </div>
    );
}
