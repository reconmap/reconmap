import Breadcrumb from "components/ui/Breadcrumb";
import Skeleton from "components/ui/Skeleton";

/**
 * Placeholder for pages whose title and body depend on a single entity.
 * The page chrome (breadcrumb) stays in place while the entity loads.
 */
export default function PageSkeleton({ lines = 6 }: any) {
    return (
        <div aria-busy="true">
            <div className="heading">
                <Breadcrumb />
            </div>
            <div className="mb-5">
                <Skeleton width="30%" height="2rem" />
            </div>
            {Array.from({ length: lines }, (_, index) => (
                <div key={index} className="mb-3">
                    <Skeleton width={index % 3 === 2 ? "45%" : "90%"} />
                </div>
            ))}
        </div>
    );
}
