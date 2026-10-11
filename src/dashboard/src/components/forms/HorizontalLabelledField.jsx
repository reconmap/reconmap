const HorizontalLabelledField = ({ htmlFor = undefined, label = "", control }) => {
    return (
        <div className="field is-horizontal">
            <div className="field-label">
                {label != "" && (
                    <label className="label" htmlFor={htmlFor}>
                        {label}
                    </label>
                )}
            </div>
            <div className="field-body">
                <div className="field">
                    <div className="control">{control}</div>
                </div>
            </div>
        </div>
    );
};

export default HorizontalLabelledField;
