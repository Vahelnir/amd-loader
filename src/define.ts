import { dirname } from "./dirname";
import { makeRequire } from "./makeRequire";
import { CommonJSModuleFactory, ModuleFactory, definedModules } from "./module";
import { parseDependencies } from "./parseDependencies";

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
  rawId: unknown,
  rawDependencies?: unknown,
  rawFactory?: unknown
): void {
  const getDependencies = () => {
    if (Array.isArray(rawId)) return rawId;
    if (Array.isArray(rawDependencies)) return rawDependencies;
    return [];
  };
  const getFactory = () => {
    if (typeof rawId === "function") return rawId;
    if (typeof rawDependencies === "function") return rawDependencies;
    return rawFactory;
  };

  // TODO: handle the case where the name should be what it as been required as
  const id = typeof rawId === "string" ? rawId : "";
  const dependencies = getDependencies();
  const factory = getFactory() as ModuleFactory;
  if (!factory) {
    throw new Error("no factory defined");
  }

  const allDependencies = new Set([
    ...dependencies,
    ...parseDependencies(factory.toString()),
  ]);

  definedModules.set(id, {
    factory,
    deps:
      allDependencies.size > 0
        ? allDependencies
        : new Set(["require", "exports", "module"]),
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
