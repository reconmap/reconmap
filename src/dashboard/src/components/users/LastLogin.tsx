import RelativeDateFormatter from "components/ui/RelativeDateFormatter";

export const LastLogin = ({ user }: any) => {
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
