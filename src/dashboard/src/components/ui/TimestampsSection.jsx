import RelativeDateFormatter from "./RelativeDateFormatter";

const TimestampsSection = ({ entity }) => {
    return (
        <div className="content">
            <h4>📅 Timestamps</h4>
            <dl>
                {entity.createdAt && (
                    <>
                        <dt>Created</dt>
                        <dd>
                            <RelativeDateFormatter date={entity.createdAt} />
                        </dd>
                    </>
                )}
                {entity.updatedAt && (
                    <>
                        <dt>Updated</dt>
                        <dd>
                            <RelativeDateFormatter date={entity.updatedAt} />
                        </dd>
                    </>
                )}
            </dl>
        </div>
    );
};

export default TimestampsSection;
