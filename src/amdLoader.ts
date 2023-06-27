import { makeRequire } from "./makeRequire";
import { modulesCache } from "./modulesCache";
import { define } from "./define";
import { ModuleExports } from "./module";

const require = makeRequire();

export const amdLoader = {
  modules: modulesCache,
  define,
  makeRequire,
  require,
  import: (id: string) =>
    new Promise<ModuleExports>((resolve, reject) =>
      require([id], ([id]) => resolve(id), reject)
    ),
};
