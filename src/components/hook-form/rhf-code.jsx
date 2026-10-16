import { MuiOtpInput } from 'mui-one-time-password-input';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export function RHFCode({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <MuiOtpInput
            {...field}
            autoFocus
            gap={1.5}
            length={6}
            value={field.value || ''}
            onChange={(value) => field.onChange(String(value || '').replace(/\D/g, '').slice(0, 6))}
            validateChar={(character) => /^\d$/.test(character)}
            TextFieldsProps={{
              error: !!error,
              placeholder: '-',
              type: 'tel',
              inputMode: 'numeric',
              inputProps: {
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 1,
                autoComplete: 'one-time-code',
              },
            }}
            {...other}
          />

          {error && (
            <FormHelperText sx={{ px: 2 }} error>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}
