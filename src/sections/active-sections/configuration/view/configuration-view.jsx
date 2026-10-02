import { useState } from 'react';
import { Tab } from '@mui/material';
import React from 'react'
import PropTypes from 'prop-types';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify';
import { useTabs } from 'src/hooks/use-tabs'
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import Categories from '../categories';
import ClockInSettins from '../clock-in-settings';
import KioskBranding from '../kiosk-branding';
import VisitorSurveySettings from '../visitor-survey-settings';
import ExternalWidgetsSettings from '../external-widgets-settings';
import {
    DEFAULT_EXTERNAL_WIDGET_SETTINGS,
    DEFAULT_KIOSK_SCREENS,
    DEFAULT_VISITOR_SURVEY_SETTINGS,
    saveMockExternalWidgetSettings,
    saveMockVisitorSurveySettings,
} from '../mocks/data';

const CONFIGURATION_TABS_OPTIONS = [
    { value: "categories", label: "Categories", icon: "iconamoon:category-bold" },
    { value: "kioskBranding", label: "Kiosk Branding", icon: "solar:monitor-bold" },
    { value: "clockInSettings", label: "Clock In Settings", icon: "solar:settings-bold-duotone" },
    { value: "visitorSurvey", label: "Visitor Survey", icon: "solar:chat-square-like-bold-duotone" },
    // { value: "externalWidgets", label: "External Widgets", icon: "solar:widget-5-bold-duotone" },
]

const ConfigurationView = ({ ownerDashboard = false }) => {

    const rootPath = ownerDashboard ? paths.owner.root : paths.siteManager.root;
    const rootLabel = ownerDashboard ? 'Owner Dashboard' : 'Dashboard';
    const { value, onChange } = useTabs("categories");

    const [visitorSurveySettings, setVisitorSurveySettings] = useState(DEFAULT_VISITOR_SURVEY_SETTINGS);

    const [externalWidgetSettings, setExternalWidgetSettings] = useState(DEFAULT_EXTERNAL_WIDGET_SETTINGS);

    const handleSaveVisitorSurveySettings = (next) => {
        setVisitorSurveySettings(saveMockVisitorSurveySettings(next));
    };

    const handleSaveExternalWidgetSettings = (next) => {
        setExternalWidgetSettings(saveMockExternalWidgetSettings(next));
    };

    return (
        <DashboardContent>

            <CustomBreadcrumbs
                heading="Configuration"
                links={[
                    { name: rootLabel, href: rootPath },
                    { name: 'Configuration' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <CustomTabs
                value={value}
                onChange={onChange}
                variant="scrollable"
                sx={{
                    mb: 2,
                    borderRadius: 1,
                    width: 'fit-content',
                    maxWidth: '100%',
                }}
            >
                {CONFIGURATION_TABS_OPTIONS.map((tab) => {
                    return (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={tab.label}
                            icon={<Iconify icon={tab.icon} width={18} />}
                            iconPosition="start"
                        />
                    );
                })}
            </CustomTabs>

            {value === "categories" && <Categories title="Staff Categories" />}

            {value === "kioskBranding" && <KioskBranding title="Kiosk Pages" page={DEFAULT_KIOSK_SCREENS} />}

            {value === "clockInSettings" && <ClockInSettins title="Automatic staff clock-out" subHeader="Clock out staff automatically at shift end" />}

            {value === "visitorSurvey" && (
                <VisitorSurveySettings settings={visitorSurveySettings} onSave={handleSaveVisitorSurveySettings} />
            )}

            {/* {value === "externalWidgets" && (
                <ExternalWidgetsSettings settings={externalWidgetSettings} onSave={handleSaveExternalWidgetSettings} />
            )} */}

        </DashboardContent>
    )
}

export default ConfigurationView

ConfigurationView.propTypes = {
    ownerDashboard: PropTypes.bool,
};