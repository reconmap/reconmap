import NativeInput from "components/form/NativeInput";
import { useCallback, useEffect } from "react";
import isInputElement from "../../utilities/domUtils";

const PaginationV2 = ({ page, total, onPageChange }) => {
    const previousEnabled = page + 1 > 1;
    const nextEnabled = page + 1 < total;

    const onPreviousPageChange = useCallback(() => {
        onPageChange(page - 1);
    }, [onPageChange, page]);

    const onNextPageChange = useCallback(() => {
        onPageChange(page + 1);
    }, [onPageChange, page]);

    const onKeyDownListener = useCallback(
        (ev) => {
            if (isInputElement(document.activeElement)) {
                return;
            }

            if (previousEnabled && ev.key === "p") {
                ev.preventDefault();
                onPreviousPageChange();
            } else if (nextEnabled && ev.key === "n") {
                ev.preventDefault();
                onNextPageChange();
            }
        },
        [previousEnabled, nextEnabled, onPreviousPageChange, onNextPageChange],
    );

    useEffect(() => {
        document.addEventListener("keydown", onKeyDownListener);
        return () => {
            document.removeEventListener("keydown", onKeyDownListener);
        };
    }, [onKeyDownListener]);

    if (parseInt(total) === 1) {
        return <label>(no more pages)</label>;
    }

    return (
        <nav className="pagination is-centered is-rounded" role="navigation" aria-label="pagination">
            <button
                onClick={() => onPageChange(page - 1)}
                className="pagination-previous"
                tooltip="Previous [P]"
                disabled={!previousEnabled}
            >
                🡠
            </button>
            <ul className="pagination-list">
                <li>
                    <label className="is-flex is-align-items-center">
                        Page{" "}
                        <NativeInput
                            className="pagination-link ml-2 mr-2"
                            value={page + 1}
                            maxLength={4}
                            size={4}
                            max={total}
                            onInput={(ev) =>
                                onPageChange(isNaN(parseInt(ev.target.value)) ? 1 : parseInt(ev.target.value) - 1)
                            }
                        />{" "}
                        of {total}
                    </label>
                </li>
            </ul>
            <button
                onClick={() => onPageChange(page + 1)}
                className="pagination-next"
                tooltip="Next [N]"
                disabled={!nextEnabled}
            >
                🡢
            </button>
        </nav>
    );
};

export default PaginationV2;
