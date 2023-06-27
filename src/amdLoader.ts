import { makeRequire } from "./makeRequire";
import { cache } from "./module/cache";
import { define } from "./define";
import { ModuleExports } from "./module/types";

const require = makeRequire();

export const amdLoader = {
  modules: cache,
  define,
  makeRequire,
  require,
  import: (id: string) =>
    new Promise<ModuleExports>((resolve, reject) =>
      require([id], ([id]) => resolve(id), reject)
    ),
};
