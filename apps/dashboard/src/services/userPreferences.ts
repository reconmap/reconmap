const DefaultUserPreferences = {
    "dashboard.theme": "dark",
    "dashboard.language": "en",
    "dashboard.widgets": null,
};

const initialiseUserPreferences = (user: any) => {
    if (
        !Object.prototype.hasOwnProperty.call(user, "preferences") ||
        null === user.preferences ||
        undefined === user.preferences
    ) {
        return DefaultUserPreferences;
    }
    if (typeof user.preferences === "string") {
        return { ...DefaultUserPreferences, ...JSON.parse(user.preferences) };
    }

    return { ...DefaultUserPreferences, ...user.preferences };
};

export { initialiseUserPreferences };
