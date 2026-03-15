const NativeTabs = ({ labels, tabIndex, tabIndexSetter }) => {
    return (
        <div className="tabs">
            <ul>
                {labels
                    .filter((value) => value)
                    .map((label, index) => (
                        <li key={index} className={index === tabIndex ? "is-active" : ""}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    tabIndexSetter(index);
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default NativeTabs;
