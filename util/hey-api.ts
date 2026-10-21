import type { CreateClientConfig } from "../generated/client.gen.ts"

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: process.env.NEXT_PUBLIC_API_URL
        ? "/api"
        : "https://adonix.hackillinois.org",
    credentials: "include",
})
