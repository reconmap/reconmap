export const requestReleases = () => fetch('https://api.github.com/repos/reconmap/reconmap/releases');

export const requestDiscussions = () => fetch('https://api.github.com/repos/reconmap/reconmap/discussions');