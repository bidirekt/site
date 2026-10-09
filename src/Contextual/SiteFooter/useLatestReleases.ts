import { useEffect, useState } from 'react'

export type Repo = 'cli' | 'broker'

export type LatestRelease = { repo: Repo; tag: string; url: string }

export const REPOS: Array<Repo> = ['cli', 'broker']

type GitHubRelease = { tag_name?: unknown; html_url?: unknown }

export function useLatestReleases(): Array<LatestRelease> {
  const [releases, setReleases] = useState<
    Partial<Record<Repo, LatestRelease>>
  >({})

  useEffect(() => {
    let unmounted = false
    for (const repo of REPOS) {
      void fetchLatestRelease(repo).then((release) => {
        if (unmounted || release === null) return
        setReleases((found) => ({ ...found, [repo]: release }))
      })
    }
    return () => {
      unmounted = true
    }
  }, [])

  return REPOS.flatMap((repo) => releases[repo] ?? [])
}

async function fetchLatestRelease(repo: Repo): Promise<LatestRelease | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/bidirekt/${repo}/releases/latest`,
    )
    if (!response.ok) return null
    const release = (await response.json()) as GitHubRelease
    if (
      typeof release.tag_name !== 'string' ||
      typeof release.html_url !== 'string'
    ) {
      return null
    }
    return { repo, tag: release.tag_name, url: release.html_url }
  } catch {
    return null
  }
}
