// kiosk-branding.jsx

import { useState, useEffect, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { usePathname } from 'src/routes/hooks';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetKiosksQuery } from 'src/store/Reducer/kiosks-api';
import {
  useGetKioskWidgetsQuery,
  useUpdateKioskWidgetsMutation,
} from 'src/store/Reducer/kiosk-branding-api';

import { KioskCheckoutWidget } from './kiosk-checkout-widget';
import { KioskContentDialog } from './kiosk-content-dialog';
import { KioskMobilePreview } from './kiosk-mobile-preview';
import { KioskScopeBar } from './kiosk-scope-bar';
import { KioskScreenCard } from './kiosk-screen-card';

// ----------------------------------------------------------------------

const EMPTY_CHECKOUT_WIDGET_CONFIG = {
  type: 'qr',
  title: 'Checkout survey',
  config: {
    url: '',
    caption: '',
  },
  value: '',
  caption: '',
  showToVisitors: true,
  showToEmployees: false,
};

const MAX_HOME_WIDGETS = 3;

const mapBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

function KioskBrandingSkeleton() {
  return (
    <Stack spacing={2.5} aria-busy="true" aria-label="Loading kiosk branding settings">
      <Stack spacing={1}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={320} height={20} />
      </Stack>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} variant="rounded" height={72} />
              ))}
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton
            variant="rounded"
            sx={{ width: { xs: 240, sm: 260 }, height: 480, borderRadius: '34px' }}
          />
        </Grid>
      </Grid>

      <Divider />

      <Stack spacing={1}>
        <Skeleton variant="text" width={160} height={28} />
        <Skeleton variant="text" width={360} height={20} />
      </Stack>
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={72} />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton
            variant="rounded"
            sx={{ width: { xs: 240, sm: 260 }, height: 480, borderRadius: '34px' }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

const formatHomeWidget = (screen, index) => {
  let config = {};

  if (screen.type === 'image') {
    config = {
      imageUrl: screen.config?.imageUrl || screen.value || '',
      caption: screen.config?.caption || screen.caption || '',
    };
  } else if (screen.type === 'text') {
    config = {
      textKind: screen.config?.textKind || 'quoteOfTheDay',
      body: screen.config?.body || screen.value || '',
    };
  } else if (screen.type === 'qr') {
    config = {
      url: screen.config?.url || screen.value || '',
      caption: screen.config?.caption || screen.caption || '',
    };
  } else if (screen.type === 'link') {
    const rawUrl = screen.config?.url || screen.value || '';
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      throw new Error('Please enter a valid HTTPS link URL');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new Error('Link URL must use HTTPS');
    }
    if (!screen.config?.buttonLabel?.trim()) {
      throw new Error('Please enter a button label');
    }

    config = {
      url: parsedUrl.toString(),
      buttonLabel: screen.config.buttonLabel.trim(),
    };
  }

  return {
    type: screen.type,
    title: screen.title || screen.name || `Widget ${index + 1}`,
    sortOrder: Number(screen.sortOrder) || index + 1,
    config,
  };
};

const getCheckoutWidgetValue = (widget) => {
  if (widget.type === 'image') {
    return widget.config?.imageUrl || widget.config?.url || widget.value || '';
  }
  if (widget.type === 'text') {
    return widget.config?.body || widget.value || widget.config?.url || '';
  }
  return widget.config?.url || widget.value || '';
};

const normalizeCheckoutWidget = (widget) => ({
  ...widget,
  type: widget.type || 'qr',
  title: widget.title || 'Checkout survey',
  value: getCheckoutWidgetValue(widget),
  caption: widget.config?.caption || widget.caption || '',
  showToVisitors: widget.showToVisitors ?? true,
  showToEmployees: widget.showToEmployees ?? false,
  config: { ...(widget.config || {}) },
});

const formatCheckoutWidget = (widget) => {
  const formattedWidget = formatHomeWidget(widget, 1);
  return {
    type: formattedWidget.type,
    title: formattedWidget.title,
    config: formattedWidget.config,
    showToVisitors: Boolean(widget.showToVisitors),
    showToEmployees: Boolean(widget.showToEmployees),
  };
};

// ----------------------------------------------------------------------

export default function KioskBranding({ ownerDashboard = false }) {
  const pathname = usePathname();
  const isOwner = Boolean(ownerDashboard || pathname?.startsWith('/owner-dashboard'));

  const { organizationId, user } = useCurrentOrganization();

  const assignedBranch = useMemo(
    () => (!isOwner ? getAssignedBranch(user, organizationId) : null),
    [isOwner, user, organizationId]
  );

  const {
    currentData: branchesData,
    isLoading: isLoadingBranches,
    isError: isBranchesError,
  } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !organizationId }
  );

  const branches = useMemo(() => branchesData?.data ?? [], [branchesData]);
  const defaultBranch = useMemo(
    () =>
      branches.reduce((latest, branch) => {
        if (!latest) return branch;
        const branchCreatedAt = Date.parse(branch.createdAt || '');
        const latestCreatedAt = Date.parse(latest.createdAt || '');
        return Number.isFinite(branchCreatedAt) &&
          (!Number.isFinite(latestCreatedAt) || branchCreatedAt > latestCreatedAt)
          ? branch
          : latest;
      }, null),
    [branches]
  );

  const siteManagerBranch = useMemo(() => {
    if (isOwner) return null;
    const assignedId = assignedBranch?.id;
    if (!assignedId) return null;

    const matchedBranch = branches.find((b) => b._id === assignedId);
    return {
      value: assignedId,
      label: matchedBranch?.name || assignedBranch?.name || 'Current Site',
      organizationId,
    };
  }, [isOwner, assignedBranch, branches, organizationId]);

  // Keep the selected option label available when it comes from a later page.
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (!isOwner) {
      const assigned = getAssignedBranch(user, organizationId);
      if (assigned?.id) {
        return {
          value: assigned.id,
          label: assigned.name || 'Current Site',
          organizationId,
        };
      }
    }
    return null;
  });

  // Selected Kiosk ID ('all' for site default or specific kiosk id)
  const [selectedKioskId, setSelectedKioskId] = useState('all');

  const activeBranchId = useMemo(() => {
    if (!isOwner && siteManagerBranch?.value) {
      return siteManagerBranch.value;
    }
    return selectedBranch?.organizationId === organizationId ? selectedBranch.value : '';
  }, [isOwner, siteManagerBranch, selectedBranch, organizationId]);

  // Load Kiosks for the selected branch
  const { currentData: kiosksData } = useGetKiosksQuery(
    {
      organizationId,
      branchId: activeBranchId,
      limit: 100,
    },
    { skip: !organizationId || !activeBranchId }
  );

  const kiosks = useMemo(() => {
    const list = kiosksData?.data || kiosksData?.kiosks || kiosksData || [];
    return Array.isArray(list) ? list : [];
  }, [kiosksData]);

  // Fetch Kiosk Widgets from API
  const {
    currentData: apiWidgetsData,
    isFetching: isRefetchingWidgets,
    isError: isWidgetsError,
  } = useGetKioskWidgetsQuery(
    {
      organizationId,
      branchId: activeBranchId,
      kioskId: selectedKioskId,
    },
    { skip: !organizationId || !activeBranchId }
  );

  const [updateKioskWidgets, { isLoading: isSaving }] = useUpdateKioskWidgetsMutation();
  const isLoadingKioskBranding =
    (!activeBranchId && isLoadingBranches) ||
    (branches.length > 0 && !activeBranchId) ||
    (Boolean(activeBranchId) && isRefetchingWidgets && !apiWidgetsData);
  const hasKioskLoadError = isBranchesError || isWidgetsError;

  // Local state for Home Screen Widgets and Checkout Widget
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [checkoutWidget, setCheckoutWidget] = useState(EMPTY_CHECKOUT_WIDGET_CONFIG);
  const [hasCheckoutWidget, setHasCheckoutWidget] = useState(false);

  // Select branch by default and recover if organization or context changes.
  useEffect(() => {
    if (isOwner) {
      if (isLoadingBranches || isBranchesError) return;

      if (!branches.length) {
        if (selectedBranch) {
          setSelectedBranch(null);
          setSelectedKioskId('all');
          setScreens([]);
          setSelectedScreen(0);
          setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
          setHasCheckoutWidget(false);
        }
        return;
      }

      if (selectedBranch?.organizationId !== organizationId) {
        setSelectedBranch(
          defaultBranch
            ? {
                ...mapBranchOption(defaultBranch),
                organizationId,
              }
            : null
        );
        setSelectedKioskId('all');
        setScreens([]);
        setSelectedScreen(0);
        setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
        setHasCheckoutWidget(false);
      }
    } else {
      // Site Manager flow: lock to assigned site
      if (siteManagerBranch) {
        if (
          selectedBranch?.value !== siteManagerBranch.value ||
          selectedBranch?.organizationId !== organizationId ||
          (siteManagerBranch.label !== 'Current Site' && selectedBranch?.label !== siteManagerBranch.label)
        ) {
          setSelectedBranch(siteManagerBranch);
          setSelectedKioskId('all');
        }
      } else if (!isLoadingBranches && !isBranchesError && branches.length > 0) {
        if (selectedBranch?.organizationId !== organizationId || !selectedBranch) {
          const fallback = defaultBranch || branches[0];
          setSelectedBranch({
            ...mapBranchOption(fallback),
            organizationId,
          });
          setSelectedKioskId('all');
        }
      }
    }
  }, [
    isOwner,
    siteManagerBranch,
    branches,
    defaultBranch,
    isBranchesError,
    isLoadingBranches,
    organizationId,
    selectedBranch,
  ]);

  const openModal = useBoolean();
  const [editingScreen, setEditingScreen] = useState(null);
  const [dialogMode, setDialogMode] = useState('home');

  // Sync API response to local state
  useEffect(() => {
    if (apiWidgetsData) {
      const raw = apiWidgetsData?.data || apiWidgetsData;

      if (Array.isArray(raw?.homeWidgets)) {
        const mapped = raw.homeWidgets.map((w, index) => ({
          ...w,
          id: w._id || w.sortOrder || index + 1,
          name: w.title || `Widget ${w.sortOrder || index + 1}`,
          value:
            w.type === 'image'
              ? w.config?.imageUrl || w.imageUrl || ''
              : w.type === 'text'
                ? w.config?.body || w.body || ''
                : w.type === 'qr'
                  ? w.config?.url || w.url || ''
                  : w.type === 'link'
                    ? w.config?.url || w.url || ''
                    : '',
          caption: w.config?.caption || w.caption || '',
        }));
        setScreens(mapped);
      } else {
        setScreens([]);
      }

      if (raw?.checkoutWidget) {
        setCheckoutWidget(normalizeCheckoutWidget(raw.checkoutWidget));
        setHasCheckoutWidget(true);
      } else {
        setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
        setHasCheckoutWidget(false);
      }

      setSelectedScreen(0);
    }
  }, [apiWidgetsData]);

  const visibleScreens = activeBranchId && apiWidgetsData ? screens : [];
  const currentActiveScreen = visibleScreens[selectedScreen] || visibleScreens[0];

  const resetScopeDraft = () => {
    setScreens([]);
    setSelectedScreen(0);
    setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
    setHasCheckoutWidget(false);
    setEditingScreen(null);
    openModal.onFalse();
  };

  const handleBranchChange = (branchOption) => {
    if (!isOwner) return;
    const branchId = branchOption?.value || '';
    if (branchId !== activeBranchId || selectedKioskId !== 'all') {
      resetScopeDraft();
    }
    setSelectedBranch(branchOption ? { ...branchOption, organizationId } : null);
    setSelectedKioskId('all');
  };

  const handleKioskChange = (kioskId) => {
    if (kioskId !== selectedKioskId) {
      resetScopeDraft();
    }
    setSelectedKioskId(kioskId);
  };

  // Add & Edit modal handlers
  const handleAddWidgetClick = () => {
    if (screens.length >= MAX_HOME_WIDGETS) {
      toast.error(`A maximum of ${MAX_HOME_WIDGETS} home screen widgets is allowed`);
      return;
    }

    setEditingScreen(null);
    setDialogMode('home');
    openModal.onTrue();
  };

  const handleEditScreenClick = (screen) => {
    setEditingScreen(screen);
    setDialogMode('home');
    openModal.onTrue();
  };

  const handleOpenCheckoutDialog = () => {
    setEditingScreen(hasCheckoutWidget ? checkoutWidget : null);
    setDialogMode('checkout');
    openModal.onTrue();
  };

  const handleDeleteCheckoutWidget = () => {
    setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
    setHasCheckoutWidget(false);
    toast.info(`Removed widget "${checkoutWidget.title || 'Checkout widget'}"`);
  };

  const handleDeleteScreen = (screenToDelete) => {
    const filtered = screens.filter((s) => s.id !== screenToDelete.id);
    const reindexed = filtered.map((s, i) => ({
      ...s,
      sortOrder: i + 1,
    }));
    setScreens(reindexed);
    setSelectedScreen(0);
    toast.info(`Removed widget "${screenToDelete.title || screenToDelete.name}"`);
  };

  const ensureWidgetScopeReady = () => {
    if (!organizationId) {
      throw new Error('Organization ID not found');
    }
    if (!activeBranchId) {
      throw new Error('Please select a branch first');
    }
    if (!apiWidgetsData || isRefetchingWidgets || isWidgetsError) {
      throw new Error('Wait for the selected branch settings to load before saving.');
    }
  };

  const persistKioskWidgets = async (homeScreens, checkout = checkoutWidget) => {
    ensureWidgetScopeReady();
    if (homeScreens.length > MAX_HOME_WIDGETS) {
      throw new Error(`A maximum of ${MAX_HOME_WIDGETS} home screen widgets is allowed`);
    }

    const formattedHomeWidgets = homeScreens.map(formatHomeWidget);

    return updateKioskWidgets({
      organizationId,
      branchId: activeBranchId,
      kioskId: selectedKioskId !== 'all' ? selectedKioskId : null,
      homeWidgets: formattedHomeWidgets,
      ...(hasCheckoutWidget ? { checkoutWidget: formatCheckoutWidget(checkout) } : {}),
    }).unwrap();
  };

  const handleSaveScreenFromModal = async (savedScreen) => {
    let updatedScreens;

    if (editingScreen) {
      updatedScreens = screens.map((screen) => (screen.id === savedScreen.id ? savedScreen : screen));
    } else {
      if (screens.length >= MAX_HOME_WIDGETS) {
        throw new Error(`A maximum of ${MAX_HOME_WIDGETS} home screen widgets is allowed`);
      }

      const nextSortOrder = screens.length + 1;
      const newWidget = {
        ...savedScreen,
        id: Date.now(),
        sortOrder: nextSortOrder,
      };
      updatedScreens = [...screens, newWidget];
    }

    ensureWidgetScopeReady();
    const response = await updateKioskWidgets({
      organizationId,
      branchId: activeBranchId,
      kioskId: selectedKioskId !== 'all' ? selectedKioskId : null,
      homeWidgets: updatedScreens.map(formatHomeWidget),
    }).unwrap();
    setScreens(updatedScreens);
    setSelectedScreen(editingScreen ? updatedScreens.findIndex((screen) => screen.id === savedScreen.id) : updatedScreens.length - 1);
    toast.success(response?.message || 'Kiosk widget saved successfully');
  };

  const handleSaveCheckoutWidget = async (savedWidget) => {
    ensureWidgetScopeReady();
    const formattedCheckoutWidget = formatCheckoutWidget(savedWidget);
    const response = await updateKioskWidgets({
      organizationId,
      branchId: activeBranchId,
      kioskId: selectedKioskId !== 'all' ? selectedKioskId : null,
      checkoutWidget: formattedCheckoutWidget,
    }).unwrap();

    setCheckoutWidget(normalizeCheckoutWidget(savedWidget));
    setHasCheckoutWidget(true);
    toast.success(response?.message || 'Checkout widget saved successfully');
  };

  const handleReset = () => {
    if (apiWidgetsData) {
      // Re-trigger sync with API response
      const raw = apiWidgetsData?.data || apiWidgetsData;
      if (Array.isArray(raw?.homeWidgets)) {
        setScreens(
          raw.homeWidgets.map((w, index) => ({
            ...w,
            id: w._id || w.sortOrder || index + 1,
            name: w.title || `Widget ${w.sortOrder || index + 1}`,
            value:
              w.type === 'image'
                ? w.config?.imageUrl || w.imageUrl || ''
                : w.type === 'text'
                  ? w.config?.body || w.body || ''
                  : w.type === 'qr'
                    ? w.config?.url || w.url || ''
                    : w.type === 'link'
                      ? w.config?.url || w.url || ''
                      : '',
            caption: w.config?.caption || w.caption || '',
          }))
        );
      } else {
        setScreens([]);
      }
      if (raw?.checkoutWidget) {
        setCheckoutWidget(raw.checkoutWidget);
        setHasCheckoutWidget(true);
      } else {
        setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
        setHasCheckoutWidget(false);
      }
    } else {
      setScreens([]);
      setCheckoutWidget(EMPTY_CHECKOUT_WIDGET_CONFIG);
      setHasCheckoutWidget(false);
    }
    setSelectedScreen(0);
    toast.info('Reverted unsaved changes');
  };

  // PUT /admin/organizations/:orgId/kiosk-widgets
  const handleSave = async () => {
    try {
      const response = await persistKioskWidgets(screens);
      toast.success(response?.message || 'Kiosk branding saved successfully!');
    } catch (error) {
      console.error('Failed to save kiosk branding:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to save kiosk branding');
    }
  };

  return (
    <Box>
      <Stack spacing={3.5}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <div>
            <Typography variant="h4">Kiosk Branding</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Configure the content and post-checkout experience displayed on your kiosk devices.
            </Typography>
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddWidgetClick}
            disabled={
              !activeBranchId ||
              !apiWidgetsData ||
              isRefetchingWidgets ||
              isWidgetsError ||
              isSaving ||
              screens.length >= MAX_HOME_WIDGETS
            }
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Widget
          </Button>
        </Stack>

        {/* Scope Bar */}
        <KioskScopeBar
          organizationId={organizationId}
          currentBranch={
            selectedBranch?.organizationId === organizationId ? selectedBranch : null
          }
          onChangeBranchId={handleBranchChange}
          kiosks={kiosks}
          currentKioskId={selectedKioskId}
          onChangeKioskId={handleKioskChange}
          ownerDashboard={isOwner}
          branchDisabled={!isOwner}
        />

        {!organizationId && (
          <Alert severity="error">An organization scope is required to load kiosk branding.</Alert>
        )}
        {isLoadingKioskBranding && <KioskBrandingSkeleton />}

        {organizationId && !isLoadingKioskBranding && !hasKioskLoadError && (
          <>
            {/* HOME SCREEN WIDGETS SECTION */}
            <Stack spacing={2.5}>
          <div>
            <Typography variant="h6">Home Screen Widgets</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Each widget displays one content type — shown before check-in (in order of sort order)
            </Typography>
            {visibleScreens.length >= MAX_HOME_WIDGETS && (
              <Typography variant="caption" color="text.secondary">
                Maximum of {MAX_HOME_WIDGETS} home screen widgets reached.
              </Typography>
            )}
          </div>

          <Grid container spacing={3} alignItems="flex-start">
            {/* Left Column: Home Widget List */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Home Widget List */}
                  <Stack spacing={1.5}>
                    {visibleScreens.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No home widgets added yet. Click &quot;Add Widget&quot; above to create one.
                      </Typography>
                    ) : (
                      visibleScreens.map((screen, index) => (
                        <KioskScreenCard
                          key={screen.id || index}
                          screen={screen}
                          selected={selectedScreen === index}
                          onClick={() => setSelectedScreen(index)}
                          onEdit={() => handleEditScreenClick(screen)}
                        />
                      ))
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            {/* Right Column: Home Screen Mobile Preview */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <KioskMobilePreview
                screen={currentActiveScreen}
                screenIndex={selectedScreen}
                totalScreens={visibleScreens.length}
                onPrevious={() => setSelectedScreen((curr) => Math.max(curr - 1, 0))}
                onNext={() => setSelectedScreen((curr) => Math.min(curr + 1, visibleScreens.length - 1))}
              />
            </Grid>
          </Grid>
            </Stack>

            <Divider />

            {/* CHECKOUT WIDGET SECTION */}
            <KioskCheckoutWidget
              data={checkoutWidget}
              isConfigured={hasCheckoutWidget}
              isSaving={isSaving}
              disabled={
                !activeBranchId ||
                !apiWidgetsData ||
                isRefetchingWidgets ||
                isWidgetsError
              }
              onOpenDialog={handleOpenCheckoutDialog}
            />

            {/* Bottom Actions Row */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={handleReset} disabled={isSaving}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={
                  !activeBranchId ||
                  !apiWidgetsData ||
                  isRefetchingWidgets ||
                  isWidgetsError ||
                  screens.length > MAX_HOME_WIDGETS
                }
              >
                Save changes
              </LoadingButton>
            </Stack>
          </>
        )}
      </Stack>

      {/* Modal Dialog for adding/editing widgets */}
      <KioskContentDialog
        open={openModal.value}
        screen={editingScreen}
        mode={dialogMode}
        maxReached={dialogMode === 'home' && screens.length >= MAX_HOME_WIDGETS && !editingScreen}
        saving={isSaving}
        onClose={() => {
          setEditingScreen(null);
          setDialogMode('home');
          openModal.onFalse();
        }}
        onSave={dialogMode === 'checkout' ? handleSaveCheckoutWidget : handleSaveScreenFromModal}
      />
    </Box>
  );
}
