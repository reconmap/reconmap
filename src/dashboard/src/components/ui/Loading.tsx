import NativeSpinner from "components/ui/NativeSpinner";

/**
 * Loading indicator for the region that holds the data being fetched.
 * Never use it in place of a whole page; keep headings and actions rendered.
 */
export default function Loading({ label = "Loading..." }: any) {
    return (
        <output aria-live="polite" className="is-flex is-align-items-center is-justify-content-center p-5" style={{ gap: "0.75em" }}>
            <NativeSpinner />
            <span>{label}</span>
        </output>
    );
}
