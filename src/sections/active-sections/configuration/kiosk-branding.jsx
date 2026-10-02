// kiosk-branding.jsx

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';

import { KioskCheckoutWidget } from './kiosk-checkout-widget';
import { KioskContentDialog } from './kiosk-content-dialog';
import { KioskMobilePreview } from './kiosk-mobile-preview';
import { KioskScopeBar } from './kiosk-scope-bar';
import { KioskScreenCard } from './kiosk-screen-card';
import { KioskTypeSelector } from './kiosk-type-selector';
import { DEFAULT_CHECKOUT_WIDGET, DEFAULT_KIOSK_SCREENS } from './mocks/data';

// ----------------------------------------------------------------------

export default function KioskBranding() {
  const [site, setSite] = useState('agnes');
  const [kioskScope, setKioskScope] = useState('all');

  const [screens, setScreens] = useState(DEFAULT_KIOSK_SCREENS);
  const [selectedScreen, setSelectedScreen] = useState(0);

  const [checkoutWidget, setCheckoutWidget] = useState(DEFAULT_CHECKOUT_WIDGET);

  const openModal = useBoolean();
  const [editingScreen, setEditingScreen] = useState(null);

  const currentActiveScreen = screens[selectedScreen] || screens[0];

  const handleUpdateCurrentScreenType = (newType) => {
    setScreens((prev) =>
      prev.map((s, idx) => (idx === selectedScreen ? { ...s, type: newType } : s))
    );
  };

  const handleUpdateCurrentScreenValue = (newValue) => {
    setScreens((prev) =>
      prev.map((s, idx) => (idx === selectedScreen ? { ...s, value: newValue } : s))
    );
  };

  const handleUpdateCurrentScreenLabel = (newLabel) => {
    setScreens((prev) =>
      prev.map((s, idx) => (idx === selectedScreen ? { ...s, label: newLabel } : s))
    );
  };

  const handleUpdateScreenFromModal = (updatedScreen) => {
    setScreens((currentScreens) =>
      currentScreens.map((screen) => (screen.id === updatedScreen.id ? updatedScreen : screen))
    );
  };

  const handleAddWidget = () => {
    const nextId = screens.length + 1;
    const newWidget = {
      id: nextId,
      name: `Widget ${nextId}`,
      type: 'text',
      value: 'Welcome to our facility',
    };
    setScreens([...screens, newWidget]);
    setSelectedScreen(screens.length);
    toast.info(`Added Widget ${nextId}`);
  };

  const handleReset = () => {
    setScreens(DEFAULT_KIOSK_SCREENS);
    setSelectedScreen(0);
    setCheckoutWidget(DEFAULT_CHECKOUT_WIDGET);
    toast.info('Reverted changes to default');
  };

  const handleSave = () => {
    console.log('Kiosk branding configuration saved:', {
      site,
      kioskScope,
      homeWidgets: screens,
      checkoutWidget,
    });
    toast.success('Kiosk branding saved successfully!');
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
            onClick={handleAddWidget}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Widget
          </Button>
        </Stack>

        {/* Scope Bar */}
        <KioskScopeBar
          currentSite={site}
          onChangeSite={setSite}
          currentKiosk={kioskScope}
          onChangeKiosk={setKioskScope}
        />

        {/* HOME SCREEN WIDGETS SECTION */}
        <Stack spacing={2.5}>
          <div>
            <Typography variant="h6">Home Screen Widgets</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Each widget displays one content type — shown before check-in
            </Typography>
          </div>

          <Grid container spacing={3} alignItems="flex-start">
            {/* Left Column: List + Selected Widget Editor */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Widget List */}
                  <Stack spacing={1.5}>
                    {screens.map((screen, index) => (
                      <KioskScreenCard
                        key={screen.id}
                        screen={screen}
                        selected={selectedScreen === index}
                        onClick={() => setSelectedScreen(index)}
                        onEdit={() => {
                          setEditingScreen(screen);
                          openModal.onTrue();
                        }}
                      />
                    ))}
                  </Stack>

                  {/* Selected Widget Inline Editor */}
                  {currentActiveScreen && (
                    <Box sx={{ pt: 1 }}>
                      <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                        {currentActiveScreen.name || `Widget ${selectedScreen + 1}`} — content type
                      </Typography>

                      <KioskTypeSelector
                        value={currentActiveScreen.type}
                        onChange={handleUpdateCurrentScreenType}
                        sx={{ mb: 2.5 }}
                      />

                      {/* Content Input Fields */}
                      {currentActiveScreen.type === 'text' && (
                        <TextField
                          fullWidth
                          label="Text content"
                          value={currentActiveScreen.value || ''}
                          onChange={(e) => handleUpdateCurrentScreenValue(e.target.value)}
                          placeholder="Welcome to Agnes and Arthur"
                          multiline
                          rows={2}
                        />
                      )}

                      {currentActiveScreen.type === 'image' && (
                        <TextField
                          fullWidth
                          label="Image URL"
                          value={currentActiveScreen.value || ''}
                          onChange={(e) => handleUpdateCurrentScreenValue(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                        />
                      )}

                      {currentActiveScreen.type === 'qr' && (
                        <TextField
                          fullWidth
                          label="QR Code destination URL"
                          value={currentActiveScreen.value || ''}
                          onChange={(e) => handleUpdateCurrentScreenValue(e.target.value)}
                          placeholder="https://..."
                        />
                      )}

                      {currentActiveScreen.type === 'link' && (
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Link Label"
                            value={currentActiveScreen.label || ''}
                            onChange={(e) => handleUpdateCurrentScreenLabel(e.target.value)}
                            placeholder="Visit Website"
                          />
                          <TextField
                            fullWidth
                            label="Target URL"
                            value={currentActiveScreen.value || ''}
                            onChange={(e) => handleUpdateCurrentScreenValue(e.target.value)}
                            placeholder="https://..."
                          />
                        </Stack>
                      )}
                    </Box>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Right Column: Home Screen Mobile Preview */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <KioskMobilePreview
                screen={currentActiveScreen}
                screenIndex={selectedScreen}
                totalScreens={screens.length}
                onPrevious={() => setSelectedScreen((curr) => Math.max(curr - 1, 0))}
                onNext={() => setSelectedScreen((curr) => Math.min(curr + 1, screens.length - 1))}
              />
            </Grid>
          </Grid>
        </Stack>

        <Divider />

        {/* CHECKOUT WIDGET SECTION */}
        <KioskCheckoutWidget data={checkoutWidget} onChange={setCheckoutWidget} />

        {/* Bottom Actions Row */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleReset}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save changes
          </Button>
        </Stack>
      </Stack>

      {/* Optional Modal Dialog for deep editing */}
      <KioskContentDialog
        open={openModal.value}
        screen={editingScreen}
        onClose={() => {
          setEditingScreen(null);
          openModal.onFalse();
        }}
        onSave={handleUpdateScreenFromModal}
      />
    </Box>
  );
}