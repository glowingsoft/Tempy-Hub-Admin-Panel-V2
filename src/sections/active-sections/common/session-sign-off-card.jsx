import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { fDateTime, fDate } from 'src/utils/format-time';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { usePathname } from 'src/routes/hooks';
import { useSignOffSupervisionActionPointsMutation } from 'src/store/Reducer/supervision-api';
import { useSignOffAppraisalActionPointMutation } from 'src/store/Reducer/appraisals-api';

// ----------------------------------------------------------------------

export function SessionSignOffCard({
  session,
  organizationId: orgIdProp,
  type = 'supervision', // 'supervision' | 'appraisal'
  onSave,
  onCancel,
  readOnly = false,
}) {
  const pathname = usePathname();
  const { user, organizationId: currentOrgId } = useCurrentOrganization();
  const organizationId = orgIdProp || currentOrgId;

  const [signOffSupervisionActionPoints, { isLoading: isSigningOffSupervision }] =
    useSignOffSupervisionActionPointsMutation();
  const [signOffAppraisalActionPoint, { isLoading: isSigningOffAppraisal }] =
    useSignOffAppraisalActionPointMutation();
  const isSubmitting = isSigningOffSupervision || isSigningOffAppraisal;

  const [error, setError] = useState('');

  // Auto-detect default signer designation based on route or user role (Line Manager, Owner, Site Manager)
  const defaultDesignation = useMemo(() => {
    if (pathname.includes('/owner-dashboard')) return 'Owner';
    if (pathname.includes('/site-manager')) return 'Site Manager';
    if (pathname.includes('/line-manager')) return 'Line Manager';
    const roleLower = (user?.role || '').toLowerCase();
    if (roleLower.includes('owner')) return 'Owner';
    if (roleLower.includes('site')) return 'Site Manager';
    if (roleLower.includes('line')) return 'Line Manager';
    if (session?.signerRole) return session.signerRole;
    return 'Line Manager';
  }, [pathname, user, session]);

  // Signer name strictly derived from the currently logged-in user
  const signerName = useMemo(() => {
    if (user?.name) return user.name;
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    if (fullName) return fullName;
    if (session?.signedOffBy) return session.signedOffBy;
    return 'Manager';
  }, [user, session]);

  // Extract staff info robustly
  const staffObj =
    (typeof session?.staff === 'object' ? session.staff : null) ||
    (typeof session?.staffProfile === 'object' ? session.staffProfile : null) ||
    (typeof session?.staffUser === 'object' ? session.staffUser : null) ||
    (typeof session?.staffId === 'object' ? session.staffId : null) ||
    (typeof session?.user === 'object' ? session.user : null) ||
    (typeof session?.userId === 'object' ? session.userId : null) ||
    {};

  const staffUser =
    (typeof staffObj.user === 'object' ? staffObj.user : null) ||
    (typeof staffObj.userId === 'object' ? staffObj.userId : null) ||
    {};

  const isMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

  const rawStaffName =
    session?.name ||
    session?.staffName ||
    staffObj.name ||
    staffUser.name ||
    (typeof session?.userId === 'object' ? session?.userId?.name : null) ||
    (typeof session?.user === 'object' ? session?.user?.name : null);

  const staffName =
    rawStaffName && !isMongoId(rawStaffName)
      ? rawStaffName
      : staffObj.employeeCode || session?.employeeCode || 'Staff Member';

  const staffEmail =
    staffObj.email ||
    staffUser.email ||
    session?.email ||
    (typeof session?.userId === 'object' ? session?.userId?.email : null) ||
    (typeof session?.user === 'object' ? session?.user?.email : null) ||
    '';

  const employeeCode = staffObj.employeeCode || session?.employeeCode || '—';
  const branchName = session?.branch?.name || staffObj.branch?.name || '—';
  const locationLabel = session?.locationLabel || session?.location || session?.venue || 'Office';

  const reviewerName =
    session?.conductedBy ||
    session?.conductedByName ||
    session?.reviewerName ||
    session?.managerName ||
    '—';

  const topics = useMemo(
    () => session?.topics || session?.competencies || [],
    [session]
  );

  const actionPointsList = useMemo(
    () => session?.actionPoints || session?.objectives || [],
    [session]
  );

  const isExistingSigned = Boolean(session?.signedOff);

  const signedOffCount = useMemo(
    () =>
      actionPointsList.filter(
        (pt) => typeof pt === 'object' && (pt?.signedOffAt != null || pt?.signedOff === true)
      ).length,
    [actionPointsList]
  );

  const allAlreadySigned =
    actionPointsList.length > 0 && signedOffCount === actionPointsList.length;

  // Checkbox selection state for action points
  const [selectedPoints, setSelectedPoints] = useState([]);

  useEffect(() => {
    if (actionPointsList.length > 0) {
      const initialSelected = actionPointsList
        .map((ap, idx) => {
          const isSigned = typeof ap === 'object' && (ap?.signedOffAt != null || ap?.signedOff === true);
          if (isSigned) return idx;
          return null;
        })
        .filter((idx) => idx !== null);
      setSelectedPoints(initialSelected);
    } else {
      setSelectedPoints([]);
    }
  }, [actionPointsList, isExistingSigned]);

  const newlySelectedCount = useMemo(
    () =>
      selectedPoints.filter((idx) => {
        const pt = actionPointsList[idx];
        const isSigned = typeof pt === 'object' && (pt?.signedOffAt != null || pt?.signedOff === true);
        return !isSigned;
      }).length,
    [selectedPoints, actionPointsList]
  );

  const handleTogglePoint = (index) => {
    if (readOnly || isExistingSigned) return;
    const pt = actionPointsList[index];
    const isAlreadySigned = typeof pt === 'object' && (pt?.signedOffAt != null || pt?.signedOff === true);
    if (isAlreadySigned) return;

    setSelectedPoints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllPoints = () => {
    if (readOnly || isExistingSigned) return;
    const unsignedIndexes = actionPointsList
      .map((pt, idx) => {
        const isAlreadySigned = typeof pt === 'object' && (pt?.signedOffAt != null || pt?.signedOff === true);
        return isAlreadySigned ? null : idx;
      })
      .filter((idx) => idx !== null);

    const allUnsignedSelected =
      unsignedIndexes.length > 0 && unsignedIndexes.every((idx) => selectedPoints.includes(idx));

    if (allUnsignedSelected) {
      setSelectedPoints((prev) => prev.filter((idx) => !unsignedIndexes.includes(idx)));
    } else {
      setSelectedPoints((prev) => Array.from(new Set([...prev, ...unsignedIndexes])));
    }
  };

  // Submit Sign-Off
  const handleSubmitSignOff = async () => {
    const sessionId =
      session?._id ||
      session?.id ||
      session?.upcoming?._id ||
      session?.supervisionId ||
      session?.appraisalId;

    if (!sessionId) {
      setError('Session record ID not found');
      return;
    }

    try {
      setError('');
      let res;

      const selectedActionPointIds = selectedPoints
        .map((idx) => {
          const pt = actionPointsList[idx];
          if (!pt) return null;
          return typeof pt === 'object' ? (pt._id || pt.id || pt.actionPointId) : pt;
        })
        .filter(Boolean);

      if (actionPointsList.length > 0 && selectedActionPointIds.length === 0) {
        setError('Please select at least one action point to sign off.');
        return;
      }

      if (type === 'supervision') {
        res = await signOffSupervisionActionPoints({
          organizationId,
          supervisionId: sessionId,
          actionPointIds: selectedActionPointIds,
        }).unwrap();
      } else {
        const results = await Promise.all(
          selectedActionPointIds.map((actionPointId) =>
            signOffAppraisalActionPoint({
              organizationId,
              appraisalId: sessionId,
              appraisalActionPointId: actionPointId,
            }).unwrap()
          )
        );
        res = results[results.length - 1];
      }

      const msg = res?.message || res?.msg || 'Sign-off submitted successfully';
      toast.success(msg);
      await onSave?.(res);
    } catch (err) {
      console.error('Failed to sign off:', err);
      const errMsg = err?.data?.message || err?.data?.msg || err?.message || 'Failed to submit sign-off';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const headerTitle =
    type === 'supervision' ? 'STAFF SUPERVISION SIGN-OFF' : 'STAFF APPRAISAL SIGN-OFF';

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 4 },
        maxWidth: 860,
        mx: 'auto',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z16 || 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={3.5}>
        {/* Document Title Header */}
        <Box sx={{ textAlign: 'center', pb: 1, borderBottom: (theme) => `2px solid ${theme.palette.divider}` }}>
          <Typography
            variant="h5"
            fontWeight={800}
            letterSpacing={0.5}
            sx={{ textTransform: 'uppercase', color: 'text.primary' }}
          >
            {headerTitle}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Existing Signed-Off Confirmation Banner */}
        {isExistingSigned && (
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f0fdf4' : 'background.neutral'),
              borderColor: 'success.light',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'success.dark', fontWeight: 700 }}>
                  Document Formally Signed Off
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Signed on {session?.signedOffAt ? fDateTime(session.signedOffAt) : 'Recorded'} by{' '}
                  <Box component="span" fontWeight={600}>
                    {session?.signedOffBy || signerName}
                  </Box>
                </Typography>
              </Box>
            </Stack>
          </Card>
        )}

        {/* Staff & Session Details (scheduledAt/completedAt, locationLabel, conductedBy) */}
        <Box
          sx={{
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f8fafc' : 'background.neutral'),
            overflow: 'hidden',
          }}
        >
          <Grid container divider={<Divider orientation="vertical" flexItem />}>
            {/* Staff Member Column */}
            <Grid item xs={12} sm={6} sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography
                  variant="overline"
                  fontWeight={700}
                  sx={{ color: 'primary.main', letterSpacing: 1 }}
                >
                  Staff Member
                </Typography>

                <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                  {staffName}
                </Typography>

                {staffEmail && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:letter-bold" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {staffEmail}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:user-id-bold" width={16} sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Employee Code: {employeeCode}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* Session Details Column (scheduledAt/completedAt, locationLabel, conductedBy) */}
            <Grid item xs={12} sm={6} sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography
                  variant="overline"
                  fontWeight={700}
                  sx={{ color: 'primary.main', letterSpacing: 1 }}
                >
                  Review Details
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:user-check-bold" width={18} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Conducted By:
                    </Box>{' '}
                    <Box component="span" fontWeight={600}>
                      {reviewerName}
                    </Box>
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:point-on-map-bold" width={18} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Location:
                    </Box>{' '}
                    <Box component="span" fontWeight={600}>
                      {locationLabel}
                    </Box>
                  </Typography>
                </Stack>

                {branchName && branchName !== '—' && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:buildings-bold" width={18} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Branch:
                      </Box>{' '}
                      <Box component="span" fontWeight={600}>
                        {branchName}
                      </Box>
                    </Typography>
                  </Stack>
                )}

                {session?.scheduledAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:calendar-date-bold" width={18} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Scheduled At:
                      </Box>{' '}
                      <Box component="span" fontWeight={600}>
                        {fDateTime(session.scheduledAt)}
                      </Box>
                    </Typography>
                  </Stack>
                )}

                {session?.completedAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Completed At:
                      </Box>{' '}
                      <Box component="span" fontWeight={600} sx={{ color: 'success.dark' }}>
                        {fDateTime(session.completedAt)}
                      </Box>
                    </Typography>
                  </Stack>
                )}

                {!session?.scheduledAt && !session?.completedAt && session?.createdAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:calendar-date-bold" width={18} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Session Date:
                      </Box>{' '}
                      <Box component="span" fontWeight={600}>
                        {fDate(session.createdAt)}
                      </Box>
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Section: Topics (topics[]) */}
        {topics.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Topics Discussed
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {topics.map((topic, index) => (
                <Chip
                  key={index}
                  label={typeof topic === 'string' ? topic : topic?.name || topic?.title}
                  variant="soft"
                  color="info"
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Section: Notes (notes) */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {type === 'appraisal' ? 'Manager Comments / Review Notes' : 'Meeting Notes'}
          </Typography>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: session?.notes || session?.managerComments ? 'text.primary' : 'text.secondary',
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
              }}
            >
              {session?.notes || session?.managerComments || 'No meeting notes provided.'}
            </Typography>
          </Card>
        </Box>

        {/* Section for Appraisal: Goals & Training Needs */}
        {type === 'appraisal' && (session?.goals || session?.trainingNeeds) && (
          <Grid container spacing={2}>
            {session.goals && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Agreed Goals
                </Typography>
                <Card variant="outlined" sx={{ p: 2, minHeight: 80, borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {session.goals}
                  </Typography>
                </Card>
              </Grid>
            )}
            {session.trainingNeeds && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Identified Training Needs
                </Typography>
                <Card variant="outlined" sx={{ p: 2, minHeight: 80, borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {session.trainingNeeds}
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Section: Action Points (THIS is the sign-off UI) */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Action Points & Objectives ({signedOffCount}/{actionPointsList.length} Agreed & Signed)
            </Typography>

            {!readOnly && !isExistingSigned && !allAlreadySigned && actionPointsList.length > 1 && (
              <Button
                size="small"
                color="inherit"
                onClick={handleSelectAllPoints}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                {newlySelectedCount === actionPointsList.length - signedOffCount
                  ? 'Deselect All'
                  : 'Select All Unsigned'}
              </Button>
            )}
          </Stack>

          {actionPointsList.length > 0 ? (
            <Stack spacing={1.5}>
              {actionPointsList.map((point, index) => {
                const text = typeof point === 'string' ? point : (point?.text || point?.description || point?.goal);
                const signedOffAt = typeof point === 'object' ? point?.signedOffAt : null;
                const signedOffBy = typeof point === 'object' ? point?.signedOffBy : '';
                const isAlreadySigned = Boolean(
                  typeof point === 'object' && (point?.signedOffAt != null || point?.signedOff === true)
                );
                const isChecked = selectedPoints.includes(index);

                return (
                  <Card
                    key={index}
                    variant="outlined"
                    onClick={() => handleTogglePoint(index)}
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      cursor: !readOnly && !isExistingSigned && !isAlreadySigned ? 'pointer' : 'default',
                      bgcolor: isAlreadySigned
                        ? (theme) => (theme.palette.mode === 'light' ? '#f0fdf4' : 'background.neutral')
                        : isChecked
                          ? (theme) => (theme.palette.mode === 'light' ? '#eff6ff' : 'background.neutral')
                          : 'background.paper',
                      borderColor: isAlreadySigned
                        ? 'success.main'
                        : isChecked
                          ? 'primary.main'
                          : 'divider',
                      transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
                      '&:hover': {
                        borderColor:
                          !readOnly && !isExistingSigned && !isAlreadySigned ? 'primary.main' : undefined,
                      },
                    }}
                  >
                    {/* Checkbox (on = already signed or selected to sign) */}
                    <Checkbox
                      checked={isChecked}
                      disabled={readOnly || isExistingSigned || isAlreadySigned}
                      onChange={() => handleTogglePoint(index)}
                      onClick={(e) => e.stopPropagation()}
                      color={isAlreadySigned ? 'success' : 'primary'}
                      sx={{ p: 0.25, mt: -0.25 }}
                    />

                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      {/* Text */}
                      <Typography
                        variant="body2"
                        fontWeight={isAlreadySigned || isChecked ? 600 : 400}
                        sx={{
                          color: isAlreadySigned
                            ? 'text.primary'
                            : isChecked
                              ? 'text.primary'
                              : 'text.secondary',
                          lineHeight: 1.5,
                          textDecoration: isAlreadySigned ? 'none' : 'none',
                        }}
                      >
                        {text}
                      </Typography>

                      {/* signedOffBy (hide if empty) & signedOffAt (hide if null) */}
                      {(signedOffAt || signedOffBy) && (
                        <Typography variant="caption" color="text.secondary">
                          {signedOffAt ? `Signed off on ${fDateTime(signedOffAt)}` : ''}
                          {signedOffBy ? (signedOffAt ? ` by ${signedOffBy}` : `Signed off by ${signedOffBy}`) : ''}
                        </Typography>
                      )}
                    </Stack>

                    {/* Status Chip: Agreed & Signed for signed; Selected to Sign when checked; Not Signed for rest */}
                    {isAlreadySigned ? (
                      <Chip
                        size="small"
                        variant="soft"
                        color="success"
                        icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                        label="Agreed & Signed"
                        sx={{ fontWeight: 600, height: 24, fontSize: '0.72rem' }}
                      />
                    ) : isChecked ? (
                      <Chip
                        size="small"
                        variant="soft"
                        color="primary"
                        icon={<Iconify icon="solar:pen-bold" width={14} />}
                        label="Selected to Sign"
                        sx={{ fontWeight: 600, height: 24, fontSize: '0.72rem' }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        variant="soft"
                        color="default"
                        label="Not Signed"
                        sx={{ fontWeight: 500, height: 24, fontSize: '0.72rem', color: 'text.disabled' }}
                      />
                    )}
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No specific action points recorded for this review.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Formal Declaration */}
        <Card
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f8fafc' : 'background.neutral'),
            borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.7 }}>
            &ldquo;I hereby confirm that this {type === 'supervision' ? 'supervision' : 'appraisal'} session
            was conducted in full accordance with operational policies. The notes, outcomes, and agreed action points
            accurately record the proceedings and commitments agreed during this review.&rdquo;
          </Typography>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
          {onCancel && (
            <Button color="inherit" onClick={onCancel} disabled={isSubmitting}>
              {readOnly ? 'Back' : 'Cancel'}
            </Button>
          )}
          {!readOnly && !isExistingSigned && !allAlreadySigned && (
            <LoadingButton
              variant="contained"
              color="success"
              size="large"
              onClick={handleSubmitSignOff}
              loading={isSubmitting}
              disabled={actionPointsList.length > 0 && newlySelectedCount === 0}
              startIcon={<Iconify icon="solar:check-read-bold" />}
            >
              {newlySelectedCount > 0
                ? `Sign Off Selected (${newlySelectedCount})`
                : 'Confirm & Sign Off'}
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

SessionSignOffCard.propTypes = {
  session: PropTypes.object,
  organizationId: PropTypes.string,
  type: PropTypes.oneOf(['supervision', 'appraisal']),
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  readOnly: PropTypes.bool,
};