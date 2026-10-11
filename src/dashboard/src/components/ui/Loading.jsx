import NativeSpinner from "components/ui/NativeSpinner";

export default function Loading() {
    return (
        <figure className="message__container">
            <NativeSpinner />
            Loading...
        </figure>
    );
}
