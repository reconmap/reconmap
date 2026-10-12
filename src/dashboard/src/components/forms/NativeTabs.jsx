const NativeTabs = ({ labels, tabIndex, tabIndexSetter }) => {
    return (
        <div className="tabs">
            <ul>
                {labels
                    .filter((value) => value)
                    .map((label, index) => (
                        <li key={index} className={index === tabIndex ? "is-active" : ""}>
                            <button type="button" onClick={() => tabIndexSetter(index)}>
                                {label}
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default NativeTabs;
