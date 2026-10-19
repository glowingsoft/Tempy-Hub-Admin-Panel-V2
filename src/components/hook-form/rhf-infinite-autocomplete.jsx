import { Controller, useFormContext } from 'react-hook-form';

import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';

// ----------------------------------------------------------------------

export function RHFInfiniteAutocomplete({ name, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InfiniteAutocomplete
          value={field.value}
          onChange={field.onChange}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
}
