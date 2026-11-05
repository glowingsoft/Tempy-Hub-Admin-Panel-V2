import { useMemo, useState } from 'react';
import { Tab } from '@mui/material';
import React from 'react'
import PropTypes from 'prop-types';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify';
import { useTabs } from 'src/hooks/use-tabs'
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import {
    useGetVisitorSurveyQuestionsQuery,
    useGetVisitorSurveySettingsQuery,
    useUpdateVisitorSurveyQuestionsMutation,
    useUpdateVisitorSurveySettingsMutation,
} from 'src/store/Reducer/visitor-survey-api';
import Categories from '../categories';
import ClockInSettins from '../clock-in-settings';
import KioskBranding from '../kiosk-branding';
import VisitorSurveySettings from '../visitor-survey-settings';
import ExternalWidgetsSettings from '../external-widgets-settings';
import {
    DEFAULT_EXTERNAL_WIDGET_SETTINGS,
    DEFAULT_KIOSK_SCREENS,
    saveMockExternalWidgetSettings,
} from '../mocks/data';
import {
    isForbiddenError,
    mapQuestionsFromApi,
    mapQuestionsToApi,
    mapSettingsFromApi,
    mapSettingsToApi,
    mutationErrorMessage,
} from '../visitor-survey-mappers';

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
    const { organizationId, isOwner } = useCurrentOrganization();
    const canEditSurvey = Boolean(ownerDashboard || isOwner);

    const skipSurvey = value !== 'visitorSurvey' || !organizationId;

    const {
        data: settingsData,
        isLoading: settingsLoading,
        error: settingsError,
        refetch: refetchSettings,
    } = useGetVisitorSurveySettingsQuery({ organizationId }, { skip: skipSurvey });

    const {
        data: questionsData,
        isLoading: questionsLoading,
        error: questionsError,
        refetch: refetchQuestions,
    } = useGetVisitorSurveyQuestionsQuery(
        { organizationId, includeInactive: true },
        { skip: skipSurvey }
    );

    const [updateVisitorSurveySettings, { isLoading: savingSettings }] =
        useUpdateVisitorSurveySettingsMutation();
    const [updateVisitorSurveyQuestions, { isLoading: savingQuestions }] =
        useUpdateVisitorSurveyQuestionsMutation();

    const [surveyWriteBlocked, setSurveyWriteBlocked] = useState(false);

    const [externalWidgetSettings, setExternalWidgetSettings] = useState(DEFAULT_EXTERNAL_WIDGET_SETTINGS);

    const visitorSurveySettings = useMemo(
        () => mapSettingsFromApi(settingsData),
        [settingsData]
    );

    const visitorSurveyQuestions = useMemo(
        () => mapQuestionsFromApi(questionsData),
        [questionsData]
    );

    const handleSaveVisitorSurveySettings = async (next) => {
        if (!organizationId) {
            toast.error('No organization selected');
            return false;
        }
        try {
            await updateVisitorSurveySettings({
                organizationId,
                ...mapSettingsToApi(next),
            }).unwrap();
            toast.success('Visitor survey settings saved!');
            return true;
        } catch (error) {
            if (isForbiddenError(error)) {
                setSurveyWriteBlocked(true);
            }
            toast.error(mutationErrorMessage(error, 'Failed to save visitor survey settings'));
            return false;
        }
    };

    const handleSaveVisitorSurveyQuestions = async (nextQuestions) => {
        if (!organizationId) {
            toast.error('No organization selected');
            return false;
        }
        try {
            await updateVisitorSurveyQuestions({
                organizationId,
                questions: mapQuestionsToApi(nextQuestions),
            }).unwrap();
            return true;
        } catch (error) {
            if (isForbiddenError(error)) {
                setSurveyWriteBlocked(true);
            }
            toast.error(mutationErrorMessage(error, 'Failed to save survey questions'));
            return false;
        }
    };

    const handleSaveExternalWidgetSettings = (next) => {
        setExternalWidgetSettings(saveMockExternalWidgetSettings(next));
    };

    const surveyLoadError = settingsError || questionsError;
    const surveyErrorMessage = surveyLoadError
        ? mutationErrorMessage(surveyLoadError, 'Failed to load visitor survey')
        : null;

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

            {value === "kioskBranding" && (
                <KioskBranding
                    title="Kiosk Pages"
                    page={DEFAULT_KIOSK_SCREENS}
                    ownerDashboard={ownerDashboard}
                />
            )}

            {value === "clockInSettings" && <ClockInSettins title="Automatic staff clock-out" subHeader="Clock out staff automatically at shift end" />}

            {value === "visitorSurvey" && (
                <VisitorSurveySettings
                    settings={visitorSurveySettings}
                    questions={visitorSurveyQuestions}
                    loading={Boolean(organizationId) && (settingsLoading || questionsLoading)}
                    errorMessage={!organizationId ? 'No organization selected' : surveyErrorMessage}
                    canEdit={canEditSurvey && !surveyWriteBlocked}
                    saving={savingSettings}
                    savingQuestions={savingQuestions}
                    onSave={handleSaveVisitorSurveySettings}
                    onSaveQuestions={handleSaveVisitorSurveyQuestions}
                    onRetry={() => {
                        refetchSettings();
                        refetchQuestions();
                    }}
                />
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
