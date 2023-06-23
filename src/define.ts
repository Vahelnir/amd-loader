import { dirname } from "./dirname";
import { makeRequire } from "./makeRequire";
import { CommonJSModuleFactory, ModuleFactory, definedModules } from "./module";

/**
 * Define an AMD module
 */
export function define(factory: CommonJSModuleFactory): void;
export function define(id: string, factory: CommonJSModuleFactory): void;
export function define(deps: string[], factory: ModuleFactory): void;
export function define(
  id: string,
  deps: string[],
  factory: ModuleFactory
): void;
export function define(
  rawId: string | string[] | unknown,
  rawDeps?: string[] | unknown,
  rawFactory?: unknown
): void {
  // TODO: handle the case where the name should be what it as been required as
  const id = typeof rawId === "string" ? rawId : "";
  const deps = Array.isArray(rawId)
    ? rawId
    : Array.isArray(rawDeps)
    ? rawDeps
    : [];
  const factory = (
    typeof rawId === "function"
      ? rawId
      : typeof rawDeps === "function"
      ? rawDeps
      : rawFactory
  ) as ModuleFactory;
  if (!factory) {
    throw new Error("no factory defined");
  }

  const allDeps = new Set([...deps, ...parseDependencies(factory.toString())]);

  definedModules.set(id, {
    factory,
    deps:
      allDeps.size > 0 ? allDeps : new Set(["require", "exports", "module"]),
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
}
define.amd = {};

const COMMENT_REGEX = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm;
const REQUIRE_REGEX = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
/**
 * Extract the dependencies from a function content
 * Example:
 * ```js
 * function test() {
 *  const myModule = require("myModule");
 * }
 * parseDependencies(test.toString()) // will return ["myModule"]
 * ```
 * TODO: try to find a better solution than the one used by RequireJS
 */
const parseDependencies = (content: string) => {
  const dependencies: string[] = [];
  content
    .replace(COMMENT_REGEX, (_, singlePrefix) => singlePrefix || "")
    .replace(REQUIRE_REGEX, (match, dep) => {
      dependencies.push(dep);
      return match;
    });
  return dependencies;
};
