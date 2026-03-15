import { requestUserPatch } from "api/requests/users.js";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeTabs from "components/form/NativeTabs";
import PrimaryButton from "components/ui/buttons/Primary";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import { useAuth } from "contexts/AuthContext";
import Widgets from "models/Widgets";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PermissionsService from "services/permissions";
import { initialiseUserPreferences } from "services/userPreferences";
import widgetIsVisible from "services/widgets";
import WelcomeWidget from "./widgets/WelcomeWidget.jsx";

const InitialiseWidgetConfig = () => {
    return Object.keys(Widgets).reduce((acc, key) => {
        acc[key] = { visible: true };
        return acc;
    }, {});
};

const filterWidgets = (user) => {
    return Object.keys(Widgets)
        .map((widgetKey) => {
            const widget = Widgets[widgetKey];
            if (
                (!widget.hasOwnProperty("permissions") ||
                    PermissionsService.isAllowed(widget.permissions, user.permissions)) &&
                widgetIsVisible(user.preferences["web-client.widgets"], widgetKey)
            ) {
                return React.cloneElement(widget.component, { key: widgetKey });
            }
            return null;
        })
        .filter((widget) => widget !== null);
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [t] = useTranslation("app");

    user.preferences = initialiseUserPreferences(user);
    const [dashboardConfig, setDashboardConfig] = useState(
        user?.preferences?.["web-client.widgets"] || InitialiseWidgetConfig(),
    );
    const [visibleWidgets, setVisibleWidgets] = useState(filterWidgets(user));

    const [tabIndex, tabIndexSetter] = useState(0);

    const [formHasChanged, setFormHasChanged] = useState(false);

    const onWidgetChange = (ev) => {
        setFormHasChanged(true);
        setDashboardConfig((prev) => ({
            ...prev,
            [ev.target.name]: { ...prev[ev.target.name], visible: ev.target.checked },
        }));
    };

    const onSave = (ev, loggedInUser) => {
        const user = loggedInUser;
        user.preferences = initialiseUserPreferences(user);

        user.preferences["web-client.widgets"] = dashboardConfig;

        requestUserPatch(user.id, { preferences: user.preferences })
            .then(() => {
                setVisibleWidgets(filterWidgets(user));

                actionCompletedToast("Your preferences have been saved.");
            })
            .catch((err) => console.error(err))
            .finally(() => {
                setFormHasChanged(false);
            });
    };

    if (dashboardConfig === null) return <Loading />;

    return (
        <div>
            <Title type={t("Home")} title={t("Dashboard")} documentTitle="single" />
            <div>
                <NativeTabs labels={[t("View"), t("Configure")]} tabIndex={tabIndex} tabIndexSetter={tabIndexSetter} />

                {0 === tabIndex && (
                    <div>
                        <div className="fixed-grid has-3-cols">
                            <div className="grid">
                                {visibleWidgets.length === 0 ? <WelcomeWidget /> : visibleWidgets}
                            </div>
                        </div>
                    </div>
                )}
                {1 === tabIndex && (
                    <div>
                        <h4>Select which widgets to present in your dashboard</h4>
                        <br />
                        <div className="field">
                            {Object.keys(Widgets).map((widgetKey) => {
                                const widget = Widgets[widgetKey];
                                if (
                                    !widget.hasOwnProperty("permissions") ||
                                    PermissionsService.isAllowed(widget.permissions, user.permissions)
                                ) {
                                    return (
                                        <NativeCheckbox
                                            key={widgetKey}
                                            name={widgetKey}
                                            checked={
                                                dashboardConfig.hasOwnProperty(widgetKey) &&
                                                dashboardConfig[widgetKey].visible
                                            }
                                            onChange={onWidgetChange}
                                        >
                                            {Widgets[widgetKey].title}. <em>{Widgets[widgetKey].description}</em>
                                        </NativeCheckbox>
                                    );
                                } else {
                                    return <></>;
                                }
                            })}
                        </div>
                        <PrimaryButton disabled={!formHasChanged} onClick={(ev) => onSave(ev, user)}>
                            {t("Save")}
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
