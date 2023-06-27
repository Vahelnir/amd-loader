import { makeRequire } from "./makeRequire";
import { modulesCache } from "./modulesCache";
import { define } from "./define";

const require = makeRequire();

export const amdLoader = {
  modules: modulesCache,
  define,
  makeRequire,
  require,
  import: (id: string) =>
    new Promise((resolve, reject) => require([id], resolve, reject)),
};
