import { dirname } from "./dirname";
import { makeRequire } from "./makeRequire";
import { definedModules } from "./module";

/**
 * Define an AMD module
 * @param {string | string[] | import("./module").ModuleFactory} rawId
 * @param {string[] | import("./module").ModuleFactory} rawDeps
 * @param {import("./module").ModuleFactory} [rawFactory]
 */
export const define = (rawId, rawDeps, rawFactory) => {
  // TODO: handle the case where the name should be what it as been required as
  const id = typeof rawId === "string" ? rawId : "";
  const deps = Array.isArray(rawId)
    ? rawId
    : Array.isArray(rawDeps)
    ? rawDeps
    : [];
  const factory =
    typeof rawId === "function"
      ? rawId
      : typeof rawDeps === "function"
      ? rawDeps
      : rawFactory;
  if (!factory) {
    throw new Error("no factory defined");
  }

  const parsedDeps = parseDependencies(factory.toString());

  definedModules.set(id, {
    execute: factory,
    deps: [...deps, ...parsedDeps],
    module: {
      id,
      filename: id,
      path: dirname(id),
      require: makeRequire(id),
      isPreloading: false,
      loaded: false,
      children: [],
      exports: {},
      paths: [],
    },
  });
};
define.amd = {};

/**
 * Extract the dependencies from a function content
 * Example:
 * ```js
 * function test() {
 *  const myModule = require("myModule");
 * }
 * parseDependencies(test.toString()) // will return ["myModule"]
 * ```
 * @param {string} content
 */
const parseDependencies = (content) =>
  [...content.toString().matchAll(/require\("(.+?)"\)/g)].map(
    (match) => match[1]
  );
