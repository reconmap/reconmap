export const requestReleases = (init?: RequestInit) => fetch('https://api.github.com/repos/reconmap/reconmap/releases', init);

export const requestDiscussions = (init?: RequestInit) => fetch('https://api.github.com/repos/reconmap/reconmap/discussions', init);