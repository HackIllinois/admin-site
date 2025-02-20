import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    async redirects() {
        return [
            // {
            //     source: '/',
            //     destination: '/admissions',
            //     permanent: true,
            // },
        ]
    },
}

export default nextConfig
