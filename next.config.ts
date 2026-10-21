import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
            return [
                {
                    source: "/api/:path*",
                    destination: `${apiUrl}/:path*`,
                },
            ]
        }
        return []
    },
    async redirects() {
        return [
            {
                source: "/",
                destination: "/admissions",
                permanent: true,
            },
        ]
    },
    // Allow images from any host
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
}

export default nextConfig
