import { makeRequire } from "./makeRequire";
import { definedModules } from "./module";
import { define } from "./define";

const require = makeRequire();

export const amdLoader = {
  modules: definedModules,
  define,
  makeRequire,
  require,
  import: (id: string) =>
    new Promise((resolve, reject) => require([id], resolve, reject)),
};
