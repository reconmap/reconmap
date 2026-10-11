import RelativeDateFormatter from "components/ui/RelativeDateFormatter";

export const LastLogin = ({ user }) => {
    return (
        <>
            {user.lastLoginAt ? (
                <RelativeDateFormatter date={user.lastLoginAt} />
            ) : (
                "Never"
            )}
        </>
    );
};
