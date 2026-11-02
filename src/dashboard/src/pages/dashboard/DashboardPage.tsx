import { type ChangeEvent, type MouseEvent } from "react";
import { requestUserPatch } from "api/requests/users";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeTabs from "components/forms/NativeTabs";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import { useAuth } from "contexts/AuthContext";
import Widgets from "models/Widgets";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PermissionsService from "services/permissions";
import { initialiseUserPreferences } from "services/userPreferences";
import widgetIsVisible from "services/widgets";
import WelcomeWidget from "components/dashboard/widgets/WelcomeWidget";

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
        widgetIsVisible(user.preferences["dashboard.widgets"], widgetKey)
      ) {
        return React.cloneElement(widget.component, { key: widgetKey });
      }
      return null;
    })
    .filter((widget) => widget !== null);
};

const DashboardPage = () => {
  const { user: authUser } = useAuth() as any;
  const [t] = useTranslation("app");

  const user = useMemo(
    () => ({ ...authUser, preferences: initialiseUserPreferences(authUser) }),
    [authUser],
  );
  const [dashboardConfig, setDashboardConfig] = useState(
    user?.preferences?.["dashboard.widgets"] || InitialiseWidgetConfig(),
  );
  const [visibleWidgets, setVisibleWidgets] = useState(filterWidgets(user));

  const [tabIndex, tabIndexSetter] = useState(0);

  const [formHasChanged, setFormHasChanged] = useState(false);

  const onWidgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormHasChanged(true);
    setDashboardConfig((prev) => ({
      ...prev,
      [event.target.name]: { ...prev[event.target.name], visible: event.target.checked },
    }));
  };

  const allowedWidgetKeys = Object.keys(Widgets).filter(
    (key) =>
      !Widgets[key].hasOwnProperty("permissions") ||
      PermissionsService.isAllowed(Widgets[key].permissions, user.permissions),
  );
  const isChecked = (key) =>
    dashboardConfig.hasOwnProperty(key) && !!dashboardConfig[key].visible;
  const allSelected = allowedWidgetKeys.every(isChecked);
  const noneSelected = !allowedWidgetKeys.some(isChecked);

  const setAllWidgets = (visible) => {
    setFormHasChanged(true);
    setDashboardConfig((prev) => {
      const next = { ...prev };
      allowedWidgetKeys.forEach((key) => {
        next[key] = { ...next[key], visible };
      });
      return next;
    });
  };

  const onSave = (event: MouseEvent<HTMLElement>, loggedInUser, closeAfterSave = false) => {
    const preferences = {
      ...initialiseUserPreferences(loggedInUser),
      "dashboard.widgets": dashboardConfig,
    };
    const updatedUser = { ...loggedInUser, preferences };

    requestUserPatch(updatedUser.id, { preferences })
      .then(() => {
        setVisibleWidgets(filterWidgets(updatedUser));

        toast.success("Your preferences have been saved.");

        if (closeAfterSave) {
          tabIndexSetter(0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setFormHasChanged(false);
      });
  };

  return (
    <div>
      <PageTitleHeader title={t("Dashboard")} />
      <div>
        <NativeTabs
          labels={[t("View"), t("Configure")]}
          tabIndex={tabIndex}
          tabIndexSetter={tabIndexSetter}
        />

        {0 === tabIndex && (
          <div>
            <div className="fixed-grid has-3-cols">
              <div className="grid">
                {visibleWidgets.length === 0 ? (
                  <WelcomeWidget />
                ) : (
                  visibleWidgets
                )}
              </div>
            </div>
          </div>
        )}
        {1 === tabIndex && (
          <div>
            <p className="mb-3">
              {t("Select which widgets to present in your dashboard")}
            </p>
            <div className="buttons mb-3">
              <SecondaryButton
                onClick={() => setAllWidgets(true)}
                disabled={allSelected}
              >
                {t("Select all")}
              </SecondaryButton>
              <SecondaryButton
                onClick={() => setAllWidgets(false)}
                disabled={noneSelected}
              >
                {t("Unselect all")}
              </SecondaryButton>
            </div>
            <div className="fixed-grid has-1-cols has-2-cols-tablet has-3-cols-desktop mb-4">
              <div className="grid is-gap-2">
                {allowedWidgetKeys.map((widgetKey) => (
                  <div key={widgetKey} className="cell box p-3 m-0">
                    <NativeCheckbox
                      name={widgetKey}
                      checked={isChecked(widgetKey)}
                      onChange={onWidgetChange}
                    >
                      <strong>{Widgets[widgetKey].title}</strong>
                      {Widgets[widgetKey].description && (
                        <span className="is-block has-text-grey is-size-7">
                          {Widgets[widgetKey].description}
                        </span>
                      )}
                    </NativeCheckbox>
                  </div>
                ))}
              </div>
            </div>
            <PrimaryButton
              disabled={!formHasChanged}
              onClick={(event: MouseEvent<HTMLElement>) => onSave(event, user)}
            >
              {t("Save")}
            </PrimaryButton>{" "}
            <SecondaryButton
              disabled={!formHasChanged}
              onClick={(event: MouseEvent<HTMLElement>) => onSave(event, user, true)}
            >
              {t("Save and close")}
            </SecondaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
