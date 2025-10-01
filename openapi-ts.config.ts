import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
    input: "https://adonix.hackillinois.org/docs/json",
    output: "generated",
    plugins: [
        {
            name: "@hey-api/client-fetch",
            runtimeConfigPath: './util/hey-api.ts'
        },
        {
            name: "@hey-api/sdk",
            asClass: true,
        },
    ],
})
