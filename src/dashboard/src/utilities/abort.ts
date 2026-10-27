// Checked by name rather than with instanceof, since the error can come from another realm (iframes, jsdom).
const isAbortError = (error: unknown) => (error as { name?: string } | null)?.name === "AbortError";

/** Swallows the rejection of a request cancelled through an AbortController and rethrows any other error. */
const ignoreAbortError = (error: unknown) => {
    if (!isAbortError(error)) throw error;
};

export { ignoreAbortError, isAbortError };
