declare module "global" {
  type AMDLoader = typeof import("./amdLoader").amdLoader;

  const global: object & {
    amdLoader?: AMDLoader;
    define?: AMDLoader["define"];
    require?: AMDLoader["require"];
    import?: AMDLoader["import"];
  };
  export default global;
}
