import global from "global";
import { definedModules } from "./module";
import { define } from "./define";
import { makeRequire } from "./makeRequire";

const globalRequire = makeRequire();

const amdLoader = {
  modules: definedModules,
  define,
  makeRequire,
  require: (id: string) =>
    new Promise((resolve, reject) => globalRequire([id], resolve, reject)),
};

global.amdLoader = amdLoader;
global.define = amdLoader.define;
global.require = amdLoader.require;
