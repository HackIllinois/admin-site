import React from "react"
import Select, {
    MultiValue,
    Props as SelectProps,
    SingleValue,
    ThemeConfig,
} from "react-select"
import { Field, FieldProps, useField } from "formik"

import { getColors } from "@/app/constants"

type StyledSelectProps<T> = SelectProps<{ label: string; value: T }>

export function StyledSelect<T>(props: SelectProps<T>) {
    const { primaryColor, primaryColorLight } = getColors()
    const theme: ThemeConfig = (defaultTheme) => ({
        ...defaultTheme,
        colors: {
            ...defaultTheme.colors,
            primary: primaryColor,
            primary25: primaryColorLight,
            primary50: primaryColorLight,
        },
    })

    return <Select theme={theme} {...props} />
}

type SelectFieldProps<T> = StyledSelectProps<T> & { name: string }

function SelectField<T>({ name, ...props }: SelectFieldProps<T>) {
    const [field, meta, helpers] = useField(name)

    return (
        <StyledSelect
            name={field.name}
            onChange={(option) => helpers.setValue(option)}
            value={field.value}
            {...props}
        />
    )
}

export default SelectField
