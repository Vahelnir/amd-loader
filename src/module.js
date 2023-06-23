/**
 * @typedef {(...args: unknown[]) => unknown} ModuleFactory
 */

import { makeResolver } from "./makeResolver";

/**
 * @typedef {{
 *  children: Module[];
 *  exports: unknown;
 *  filename: string;
 *  id: string;
 *  isPreloading: boolean;
 *  loaded: boolean;
 *  path: string;
 *  paths: string[];
 *  require: import("./makeRequire").RequireFunc;
 * }} Module
 */

/**
 * @typedef {{
 *  execute: ModuleFactory;
 *  deps: string[];
 *  module: Module;
 * }} DefinedModule
 */

/** @type {Map<string, DefinedModule>} */
export const definedModules = new Map();

/**
 *
 * @param {string} currentId
 * @param {string} id
 */
export const requireModule = (currentId, id) => {
  const resolve = makeResolver(currentId);
  const resolvedId = resolve(id);
  const definedModule = definedModules.get(resolvedId);
  if (!definedModule) {
    throw new Error(
      `module "${id}" does not exist, resolved module name: "${resolvedId}" (imported by "${currentId}")`
    );
  }

  if (!definedModule.module.loaded) {
    executeModule(definedModule);
  }

  return definedModule.module;
};

/**
 * @param {DefinedModule} definedModule
 * @param {string} dependency
 * @returns
 */
const fetchDependencyModule = (definedModule, dependency) => {
  const { module } = definedModule;
  if (dependency === "require") {
    /**
     * @param {string | string[]} paths
     * @param {(...res: unknown[]) => void} [resolve]
     * @param {(res: unknown) => void} [reject]
     */
    return (paths, resolve, reject) => {
      if (!Array.isArray(paths)) {
        return module.require(paths);
      }

      if (resolve && reject) {
        return module.require(paths, resolve, reject);
      }

      throw new Error(
        "when 'paths' is defined, resolve and reject have to be defined"
      );
    };
  }

  if (dependency === "exports") {
    return module.exports;
  }

  const foundModule = requireModule(module.id, dependency);
  module.children.push(foundModule);
  return foundModule;
};

/**
 * @param {DefinedModule} definedModule
 * @returns
 */
const fetchDependencyModules = (definedModule) => {
  return definedModule.deps.map((dep) =>
    fetchDependencyModule(definedModule, dep)
  );
};

/**
 * @param {DefinedModule} definedModule
 */
const executeModule = (definedModule) => {
  const resolvedDependencies = fetchDependencyModules(definedModule);

  definedModule.module.loaded = true;

  const result = definedModule.execute(...resolvedDependencies);
  if (result) {
    definedModule.module.exports = result;
  }
};
