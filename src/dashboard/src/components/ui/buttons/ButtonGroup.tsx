import React from 'react';

interface ButtonGroupProps {
    children: React.ReactNode;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
    children,
}) => {
    return (
        <div className="field is-grouped">
            {React.Children.map(children, (child, index) => {
                return (
                    <p key={index} className="control">
                        {child}
                    </p>
                );
            })}
        </div>
    );
};

export default ButtonGroup;