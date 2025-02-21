import React from "react"
import Select, { Props as SelectProps, ThemeConfig } from "react-select"
import { Field, FieldProps, useField } from "formik"

import { getColors } from "@/app/constants"

type StyledSelectProps = SelectProps<{ label: string; value: string | number }>

export const StyledSelect = (props: StyledSelectProps) => {
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

type SelectFieldProps = StyledSelectProps & { name: string }

const SelectField: React.FC<SelectFieldProps> = ({ name, ...props }) => {
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
