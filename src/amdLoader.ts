import { makeRequire } from "./makeRequire";
import { definedModules } from "./module";
import { define } from "./define";

const requireSync = makeRequire();

export const amdLoader = {
  modules: definedModules,
  define,
  makeRequire,
  requireSync,
  require: (id: string) =>
    new Promise((resolve, reject) => requireSync([id], resolve, reject)),
};
