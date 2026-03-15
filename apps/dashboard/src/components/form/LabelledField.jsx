const LabelledField = ({ htmlFor, label, control }) => {
    return (
        <div className="field">
            <label className="label" htmlFor={htmlFor}>
                {label}
            </label>
            <div className="control">{control}</div>
        </div>
    );
};

export default LabelledField;
