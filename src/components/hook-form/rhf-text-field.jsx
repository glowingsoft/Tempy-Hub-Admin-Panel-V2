import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFTextField({
  name,
  helperText,
  type,
  inputProps,
  allowNumbers = true,
  onKeyDown,
  onChange,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onKeyDown={(event) => {
            if (!allowNumbers) {
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                ((event.key >= '0' && event.key <= '9') ||
                  (event.code && event.code.startsWith('Numpad') && event.key >= '0' && event.key <= '9'))
              ) {
                event.preventDefault();
              }
            }
            onKeyDown?.(event);
          }}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else if (!allowNumbers && typeof event.target.value === 'string') {
              event.target.value = event.target.value.replace(/\d/g, '');
              field.onChange(event.target.value);
            } else {
              field.onChange(event.target.value);
            }
            onChange?.(event);
          }}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputProps={{
            autoComplete: 'off',
            ...inputProps,
          }}
          {...other}
        />
      )}
    />
  );
}
