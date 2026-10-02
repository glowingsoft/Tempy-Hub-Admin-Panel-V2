import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ColorPicker } from '../color-utils';
import { FormHelperText } from '@mui/material';

export const RHFColorPicker = ({ name, colors, limit = 4 }) => {

    const { control, formState } = useFormContext();

    const error = formState.errors?.[name]?.message;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <>
                    <ColorPicker
                        colors={colors}
                        selected={field.value}
                        onSelectColor={(color) => field.onChange(color)}
                        limit={limit}
                    />
                    {error && (
                        <FormHelperText error sx={{ px: 2,mt:-1 }}>
                            {error}
                        </FormHelperText>
                    )}
                </>
            )}
        />
    )
}
