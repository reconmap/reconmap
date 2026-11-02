import NativeInput from "components/forms/NativeInput";
import { useCallback, useEffect, type ChangeEvent } from "react";
import isInputElement from "../../utilities/domUtils";

const PaginationV2 = ({ page, total, onPageChange }: any) => {
    const previousEnabled = page + 1 > 1;
    const nextEnabled = page + 1 < total;

    const onPreviousPageChange = useCallback(() => {
        onPageChange(page - 1);
    }, [onPageChange, page]);

    const onNextPageChange = useCallback(() => {
        onPageChange(page + 1);
    }, [onPageChange, page]);

    const onKeyDownListener = useCallback(
        (event: KeyboardEvent) => {
            if (isInputElement(document.activeElement)) {
                return;
            }

            if (previousEnabled && event.key === "p") {
                event.preventDefault();
                onPreviousPageChange();
            } else if (nextEnabled && event.key === "n") {
                event.preventDefault();
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
        return <span>(no more pages)</span>;
    }

    return (
        <nav className="pagination is-centered is-rounded" role="navigation" aria-label="pagination">
            <button
                onClick={() => onPageChange(page - 1)}
                className="pagination-previous"
                title="Previous [P]"
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
                            onInput={(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                                onPageChange(isNaN(parseInt(event.target.value)) ? 1 : parseInt(event.target.value) - 1)
                            }
                        />{" "}
                        of {total}
                    </label>
                </li>
            </ul>
            <button
                onClick={() => onPageChange(page + 1)}
                className="pagination-next"
                title="Next [N]"
                disabled={!nextEnabled}
            >
                🡢
            </button>
        </nav>
    );
};

export default PaginationV2;
