import type { CreateClientConfig } from "../generated/client.gen.ts"

const PROD_ADONIX_BASE_URL = "https://adonix.hackillinois.org"

/** Override in `.env.local` for local Adonix, e.g. `http://localhost:3001` */
export const adonixBaseUrl =
    process.env.NEXT_PUBLIC_ADONIX_BASE_URL ?? PROD_ADONIX_BASE_URL

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: adonixBaseUrl,
    credentials: "include",
})
