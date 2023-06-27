type AMDLoader = typeof import("./amdLoader").amdLoader;

declare const appContext: object & {
  amdLoader?: AMDLoader;
  define?: AMDLoader["define"];
  require?: AMDLoader["require"];
  import?: AMDLoader["import"];
};
