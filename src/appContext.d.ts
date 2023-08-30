type AMDLoader = typeof import("./amdLoader").amdLoader;

declare module "appContext" {
  const appContext: object & {
    amdLoader?: AMDLoader;
    define?: AMDLoader["define"];
    require?: AMDLoader["require"];
    importModule?: AMDLoader["import"];
  };
  export default appContext;
}
