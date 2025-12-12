// Support svg imports
declare module "*.svg" {
    const content: string
    export default content
}

// Support CSS/SCSS module imports
declare module "*.module.scss" {
    const classes: { [key: string]: string }
    export default classes
}

declare module "*.module.css" {
    const classes: { [key: string]: string }
    export default classes
}
