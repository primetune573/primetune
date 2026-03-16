import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PrimeTune Automotive',
        short_name: 'PrimeTune',
        description: 'Premium automotive garage in Sri Lanka providing high-quality repair services.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#ef4444',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
