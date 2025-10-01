import type { CreateClientConfig } from "../generated/client.gen.ts"

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    credentials: "include",
})
