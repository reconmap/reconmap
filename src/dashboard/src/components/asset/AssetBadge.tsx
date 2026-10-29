import { iconForKind } from "models/assetKinds";
import "./AssetBadge.css";

const AssetBadge = ({ name, kind }: any) => {
    return (
        <div className={"asset-badge"}>
            {kind !== undefined && (
                <span aria-hidden="true" style={{ marginRight: "4px" }}>
                    {iconForKind(kind)}
                </span>
            )}
            {name}
        </div>
    );
};

export default AssetBadge;
