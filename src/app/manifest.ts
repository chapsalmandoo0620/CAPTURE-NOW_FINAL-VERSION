import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CAPTURE NOW',
        short_name: 'CaptureNow',
        description: 'Premier Sports Highlight & Meetup Platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#39FF14',
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
            {
                src: '/icon-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
