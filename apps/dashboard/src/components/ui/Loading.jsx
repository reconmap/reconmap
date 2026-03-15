import NativeSpinner from "components/NativeSpinner";

export default function Loading() {
    return (
        <figure className="message__container">
            <NativeSpinner />
            Loading...
        </figure>
    );
}
