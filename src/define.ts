import { dirname } from "./dirname";
import { makeRequire } from "./makeRequire";
import { CommonJSModuleFactory, ModuleFactory } from "./module";
import { modulesCache } from "./modulesCache";
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
  const id = typeof rawId === "string" ? rawId : "";
  if (!id) {
    // TODO: handle the case where the name should be what it as been required as
    throw new Error(
      "Defining an AMD module without a name is not yet supported"
    );
  }

  const factory = getFactory(rawId, rawDependencies, rawFactory);
  const dependencies = new Set([
    ...getDependencies(rawId, rawDependencies),
    ...parseDependencies(factory.toString()),
  ]);

  modulesCache.set(id, {
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
