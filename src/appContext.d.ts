type AMDLoader = typeof import("./amdLoader").amdLoader;

declare const appContext: object & {
  amdLoader?: AMDLoader;
  define?: AMDLoader["define"];
  require?: AMDLoader["require"];
  importModule?: AMDLoader["import"];
};
