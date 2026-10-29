import { iconForType } from "models/assetTypes";
import "./AssetBadge.css";

const AssetBadge = ({ name, type }: any) => {
    return (
        <div className={"asset-badge"}>
            {type !== undefined && (
                <span aria-hidden="true" style={{ marginRight: "4px" }}>
                    {iconForType(type)}
                </span>
            )}
            {name}
        </div>
    );
};

export default AssetBadge;
