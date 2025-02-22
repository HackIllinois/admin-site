import "./constants.scss"

function getCSSVariable(variableName: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(
        variableName,
    )
}

export function getColors() {
    console.log(getCSSVariable("--primarycolor"))
    return {
        primaryColor: getCSSVariable("--primarycolor"),
        primaryColorLight: getCSSVariable("--primarycolorlight"),
        secondaryColor: getCSSVariable("--secondarycolor"),
        secondaryColorLight: getCSSVariable("--secondarycolorlight"),
    }
}
