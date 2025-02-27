import { useEffect, useState } from "react"

export const METADATA_REPO = "https://github.com/HackIllinois/adonix-metadata"
const CONTENT_API_ENDPOINT =
    "https://api.github.com/repos/HackIllinois/adonix-metadata/contents"
const RAW_CONTENT_PREFIXES = [
    "https://raw.githubusercontent.com/HackIllinois/adonix-metadata/refs/heads/main/",
    "https://github.com/HackIllinois/adonix-metadata/blob/main/",
]

export interface MetadataItem {
    path: string
    url: string
}

// Gets the possible options for metadata under a path
async function getMetadata(path: string): Promise<MetadataItem[]> {
    const key = `METADATA_${path}`
    const stored = sessionStorage.getItem(key)
    if (stored && JSON.parse(stored).expiry > Date.now()) {
        return JSON.parse(stored).data
    }

    const result = await fetch(`${CONTENT_API_ENDPOINT}/${path}`)
    const raw = (await result.json()) as { name: string; path: string }[]
    const metadata = raw.map(({ path }) => ({
        path,
        url: `${RAW_CONTENT_PREFIXES[0]}${path}`,
    }))

    sessionStorage.setItem(
        key,
        JSON.stringify({
            expiry: Date.now() + 60 * 1000,
            data: metadata,
        }),
    )

    return metadata
}

// Hook for getting the possible options for metadata under a path
export function useMetadata(path = "") {
    const [metadata, setMetadata] = useState<MetadataItem[]>([])

    useEffect(() => {
        const fetchMetadata = async () => {
            setMetadata(await getMetadata(path))
        }
        fetchMetadata()
    }, [path])

    return metadata
}

// Gets the suffix of a metadata url by removing adonix prefix
export function getMetadataSuffix(url: string) {
    for (const prefix of RAW_CONTENT_PREFIXES) {
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length)
        }
    }
    return url
}
