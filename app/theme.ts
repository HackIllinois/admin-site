import { createTheme } from "@mui/material/styles"

// MUI mirror of the SCSS tokens in app/constants.scss
export const theme = createTheme({
    palette: {
        primary: { main: "#b4481a", dark: "#8e3611", contrastText: "#ffffff" },
        text: { primary: "#1a1714", secondary: "#5e5852" },
        background: { default: "#fbfaf7", paper: "#ffffff" },
        divider: "#ece7e0",
    },
    shape: { borderRadius: 8 },
    typography: {
        fontFamily:
            'var(--font-ui), "Plus Jakarta Sans", system-ui, sans-serif',
    },
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    "&.Mui-focusVisible": {
                        outline: "2px solid #b4481a",
                        outlineOffset: 2,
                    },
                },
            },
        },
    },
})
