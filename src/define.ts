import { dirname } from "./resolve/dirname";
import { makeRequire } from "./makeRequire";
import type { CommonJSModuleFactory, ModuleFactory } from "./module/types";
import { cache } from "./module/cache";
import { parseDependencies } from "./parseDependencies";

const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === "function";

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
  // TODO: handle the case where the factory can be an object
  const id = getModuleId(rawId);
  if (!id) {
    // TODO: in this case it should simply directly executed without trying to cache it
    throw new Error(
      "Defining a top level anonymous AMD module is not yet supported"
    );
  }

  const factory = getFactory(rawId, rawDependencies, rawFactory);
  const dependencies = new Set([
    ...getDependencies(rawId, rawDependencies),
    ...parseDependencies(factory.toString()),
  ]);

  cache.set(id, {
    factory,
    dependencies,
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

const getModuleId = (rawId: unknown) => {
  if (typeof rawId === "string") return rawId;

  const dataModuleName =
    document.currentScript?.getAttribute("data-module-name");
  if (dataModuleName) {
    return dataModuleName;
  }

  return undefined;
};

const getDependencies = (rawId: unknown, rawDependencies: unknown) => {
  if (Array.isArray(rawId)) return rawId;
  if (Array.isArray(rawDependencies)) return rawDependencies;
  return ["require", "exports", "module"];
};

const getFactory = (
  rawId: unknown,
  rawDependencies: unknown,
  rawFactory: unknown
) => {
  if (isFunction(rawId)) return rawId;
  if (isFunction(rawDependencies)) return rawDependencies;
  if (isFunction(rawFactory)) return rawFactory;
  throw new Error("Providing a factory is mandatory when defining a module");
};
