
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { mockEmployees } from 'src/sections/user/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

import { FOLDER_OPTIONS, addUploadedDocument, updateDocument } from './mocks/data';

// ----------------------------------------------------------------------
// Option lists exported so the bulk-upload modal (bulk-upload-document-modal.jsx)
// can reuse them rather than redefining the same lists.
// ----------------------------------------------------------------------

export const CATEGORY_OPTIONS = [
  { value: 'health_safety', label: 'Health & Safety' },
  { value: 'fire_safety', label: 'Fire & Safety' },
  { value: 'contractor', label: 'Contractor' },
];

const toDepartmentOption = (department) => ({
  value: department.name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, ''),
  label: department.name,
});

export const DEPARTMENT_OPTIONS = [
  ...new Map(mockDepartments.map((department) => {
    const option = toDepartmentOption(department);
    return [option.value, option];
  })).values(),
];

const ACTION_TYPE_OPTIONS = [
  { value: 'sign', label: 'Sign' },
  { value: 'continue', label: 'Continue' },
];

export const SCOPE_TYPE_OPTIONS = [
  { value: 'all_staff', label: 'All Staff' },
  { value: 'department', label: 'Department' },
  { value: 'role', label: 'Role' },
  { value: 'specific_staff', label: 'Specific Staff' },
  { value: 'personal', label: 'Personal' },
];

export const ROLE_OPTIONS = [
  { value: 'care_assistant', label: 'Care Assistant' },
  { value: 'senior_care', label: 'Senior Care' },
  { value: 'lead_care_assistant', label: 'Lead Care Assistant' },
  { value: 'cook', label: 'Cook' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'domestic_assistant', label: 'Domestic Assistant' },
];

export const STAFF_OPTIONS = mockEmployees.map((employee) => ({
  value: employee.id,
  name: employee.name,
  designation: employee.role || '—',
}));

// ----------------------------------------------------------------------

export const UploadDocumentSchema = zod
  .object({
    name: zod.string().min(1, {
      message: 'Document name is required!',
    }),

    category: zod.string().min(1, {
      message: 'Category is required!',
    }),

    folder: zod.string().optional(),

    actionType: zod.string().min(1, {
      message: 'Action type is required!',
    }),

    scopeType: zod.string().min(1, {
      message: 'Scope type is required!',
    }),

    scopeValue: zod.string().optional(),

    file: zod.custom((val) => val !== null, {
      message: 'File is required!',
    }),
  })
  .superRefine((data, ctx) => {
    if (
      ['department', 'role', 'specific_staff', 'personal'].includes(
        data.scopeType
      ) &&
      !data.scopeValue
    ) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        path: ['scopeValue'],
        message: 'Please select a scope!',
      });
    }
  });

// ----------------------------------------------------------------------

export default function UploadDocumentModal({
  open,
  onClose,
  currentDocument,
}) {
  const defaultValues = useMemo(
    () => ({
      name: currentDocument?.name || '',
      category: currentDocument?.category || '',
      folder: currentDocument?.folder || '',
      actionType: currentDocument?.actionType || '',
      scopeType: currentDocument?.scopeType || '',
      scopeValue: currentDocument?.scopeValue || '',
      file: currentDocument?.file || null,
    }),
    [currentDocument]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UploadDocumentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const scopeType = watch('scopeType');

  // ----------------------------------------------------------------------

  const handleDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];

    if (newFile) {
      setValue('file', newFile, {
        shouldValidate: true,
      });

      if (!methods.getValues('name')) {
        setValue('name', newFile.name, {
          shouldValidate: true,
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setValue('file', null, {
      shouldValidate: true,
    });
  };

  const handleScopeTypeChange = (event) => {
    const value = event.target.value;

    setValue('scopeType', value, {
      shouldValidate: true,
    });

    // Clear previous scope selection
    setValue('scopeValue', '', {
      shouldValidate: true,
    });
  };

  // ----------------------------------------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await promise;

      console.info('DOCUMENT DATA', data);

      // Determine file type from the actual file, fall back to the form value
      const file = data.file;
      const rawType = file?.type || '';
      const fileExt = file?.name?.split('.').pop()?.toLowerCase() || '';
      const fileType = rawType.includes('pdf') || fileExt === 'pdf'
        ? 'pdf'
        : rawType.startsWith('image/')
          ? fileExt || 'image'
          : fileExt || 'file';

      // Build an object-URL so the detail page can render it immediately
      const fileUrl = file ? URL.createObjectURL(file) : null;

      const selectedStaff =
        data.scopeType === 'specific_staff' || data.scopeType === 'personal'
          ? STAFF_OPTIONS.find((s) => String(s.value) === String(data.scopeValue))
          : null;
      const selectedDept =
        data.scopeType === 'department'
          ? DEPARTMENT_OPTIONS.find((d) => d.value === data.scopeValue)
          : null;
      const selectedRole =
        data.scopeType === 'role'
          ? ROLE_OPTIONS.find((r) => r.value === data.scopeValue)
          : null;

      const scopeLabel =
        selectedStaff?.name ||
        selectedDept?.label ||
        selectedRole?.label ||
        (data.scopeType === 'all_staff' ? 'All staff' : data.scopeType?.replace(/_/g, ' '));

      if (currentDocument?._id) {
        updateDocument(currentDocument._id, {
          name: data.name,
          fileType,
          fileUrl: fileUrl || currentDocument.fileUrl,
          category: data.category,
          folder: data.folder || null,
          actionType: data.actionType,
          scopeType: data.scopeType,
          scopeValue: data.scopeValue,
          scopeLabel,
          assignedTo: selectedStaff?.name || currentDocument.assignedTo || null,
          assignedToId: selectedStaff?.value || currentDocument.assignedToId || null,
          updatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        });
      } else {
        addUploadedDocument({
          _id: `uploaded-${Date.now()}`,
          name: data.name,
          fileType,
          fileUrl,
          category: data.category,
          folder: data.folder || null,
          actionType: data.actionType,
          scopeType: data.scopeType,
          scopeValue: data.scopeValue,
          scopeLabel,
          assignedTo: selectedStaff?.name || null,
          assignedToId: selectedStaff?.value || null,
          version: 'v1',
          updatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          uploadedBy: 'You',
          description: '',
        });
      }

      reset();
      onClose();

      toast.success(currentDocument?._id ? 'Document updated!' : 'Document uploaded!');
    } catch (error) {
      console.error(error);

      toast.error('Upload failed!');
    }
  });

  // ----------------------------------------------------------------------

  const renderScopeValue = () => {
    switch (scopeType) {
      case 'department':
        return (
          <Field.Select name="scopeValue" label="Department">
            {DEPARTMENT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Field.Select>
        );

      case 'role':
        return (
          <Field.Select name="scopeValue" label="Role">
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Field.Select>
        );

      case 'specific_staff':
        return (
          <Field.Select name="scopeValue" label="Staff Member">
            {STAFF_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: 1 }}>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.designation}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Field.Select>
        );

      case 'personal':
        return (
          <Field.Select name="scopeValue" label="Staff Member">
            {STAFF_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: 1 }}>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.designation}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Field.Select>
        );

      default:
        return null;
    }
  };

  // ----------------------------------------------------------------------

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: 560,
        },
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Upload document</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Field.Upload
              name="file"
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
              }}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />

            <Field.Text name="name" label="Document name" />

            <Field.Select name="category" label="Category">
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="folder" label="Folder (optional)">
              <MenuItem value="">None</MenuItem>
              {FOLDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="actionType" label="Action Type">
              {ACTION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              name="scopeType"
              label="Scope Type"
              onChange={handleScopeTypeChange}
            >
              {SCOPE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {renderScopeValue()}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Upload
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}