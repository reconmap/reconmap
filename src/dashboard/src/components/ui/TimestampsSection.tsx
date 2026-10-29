import RelativeDateFormatter from "./RelativeDateFormatter";

const TimestampsSection = ({ entity, children }: any) => {
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
                {children}
            </dl>
        </div>
    );
};

export default TimestampsSection;
