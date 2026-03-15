import React from "react";

const Breadcrumb = (props) => {
    const childrenCount = React.Children.count(props.children);
    const children = React.Children.toArray(props.children);

    return (
        <nav className="breadcrumb has-arrow-separator" aria-label="breadcrumbs">
            <ul>
                {children.map((child, index) => (
                    <li key={`crumb_${index}`} className={index === childrenCount - 1 ? "is-active" : ""}>
                        {child}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Breadcrumb;
