import React from "react"
import Select, { Props as SelectProps, ThemeConfig } from "react-select"
import { useField } from "formik"

import { getColors } from "@/app/constants"
import CreatableSelect from "react-select/creatable"

export type Option<T> = { label: string; value: T }

type StyledSelectProps<T> = SelectProps<Option<T>> & {
    creatable?: boolean
}

export function StyledSelect<T>({
    creatable = false,
    ...props
}: StyledSelectProps<T>) {
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

    const Component = creatable ? CreatableSelect : Select

    return <Component theme={theme} {...props} />
}

type SelectFieldProps<T> = StyledSelectProps<T> & { name: string }

function SelectField<T>({ name, ...props }: SelectFieldProps<T>) {
    const [field, , helpers] = useField(name)

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
