// Support svg imports (https://stackoverflow.com/a/45887328)
declare module "*.svg" {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
    export default content
}
