import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavigationStructure } from "components/layout/NavigationStructure";

const Breadcrumb = () => {
    const { pathname } = useLocation();
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);

    // Auto-generate breadcrumbs
    let breadcrumbPath = [];
    
    for (const section of navigation) {
        if (section.isRoot) continue;
        
        if (section.items) {
            for (const item of section.items) {
                if (item.type === "divider" || !item.url) continue;

                // Check item
                if (pathname.startsWith(item.url)) {
                    let currentPath = [
                        { name: section.name, url: section.url || item.url },
                        { name: item.name, url: item.url }
                    ];

                    if (item.children) {
                        for (const child of item.children) {
                            if (child.url && pathname.startsWith(child.url.split('?')[0])) {
                                currentPath.push({ name: child.name, url: child.url });
                            }
                        }
                    }
                    
                    if (currentPath.length > breadcrumbPath.length) {
                        breadcrumbPath = currentPath;
                    } else if (currentPath.length === breadcrumbPath.length) {
                         const lastA = currentPath[currentPath.length - 1].url;
                         const lastB = breadcrumbPath[breadcrumbPath.length - 1].url;
                         if (lastA.length > lastB.length) {
                             breadcrumbPath = currentPath;
                         }
                    }
                }
            }
        }
    }

    if (breadcrumbPath.length === 0) {
        breadcrumbPath = [{ name: t("Dashboard"), url: "/" }];
    }

    // De-duplicate consecutive identical names
    const uniquePath = [];
    breadcrumbPath.forEach(crumb => {
        if (uniquePath.length === 0 || uniquePath[uniquePath.length - 1].name !== crumb.name) {
            uniquePath.push(crumb);
        }
    });

    return (
        <nav className="breadcrumb has-arrow-separator" aria-label="breadcrumbs">
            <ul>
                {uniquePath.map((crumb, index) => {
                    const isLast = index === uniquePath.length - 1;
                    return (
                        <li key={`crumb_${index}`} className={isLast ? "is-active" : ""}>
                            {isLast ? (
                                <span style={{ padding: "0 0.75em", color: "#363636" }}>{crumb.name}</span>
                            ) : (
                                <Link to={crumb.url}>{crumb.name}</Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Breadcrumb;
