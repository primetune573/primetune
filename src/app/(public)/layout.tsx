import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="flex-grow flex flex-col pt-20">
                {children}
            </main>
            <Footer />
        </>
    );
}
