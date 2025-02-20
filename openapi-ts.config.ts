import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
    input: "https://adonix.hackillinois.org/docs/json",
    output: "generated",
    plugins: [
        "@hey-api/client-fetch",
        {
            name: "@hey-api/sdk",
            asClass: true,
        },
    ],
})
