const DefaultUserPreferences = {
    "web-client.theme": "dark",
    "web-client.language": "en",
    "web-client.widgets": null,
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
