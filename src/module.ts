import { RequireFunc } from "./makeRequire";
import { makeResolver } from "./makeResolver";

export type ModuleFactory<T extends unknown[] = unknown[]> = (
  ...args: T
) => unknown;

export type CommonJSModuleFactory = ModuleFactory<
  [RequireFunc, Record<PropertyKey, unknown>, Module]
>;

export type Module = {
  children: Module[];
  exports: unknown;
  filename: string;
  id: string;
  isPreloading: boolean;
  loaded: boolean;
  path: string;
  paths: string[];
  require: import("./makeRequire").RequireFunc;
};

export type DefinedModule = {
  factory: ModuleFactory;
  deps: Set<string>;
  module: Module;
};

export const definedModules = new Map<string, DefinedModule>();

export const requireModule = (currentId: string, id: string) => {
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

const fetchDependencyModule = (
  definedModule: DefinedModule,
  dependency: string
) => {
  const { module } = definedModule;

  if (dependency === "require") {
    return module.require;
  }

  if (dependency === "exports") {
    return module.exports;
  }

  const foundModule = requireModule(module.id, dependency);
  module.children.push(foundModule);
  return foundModule;
};

const fetchDependencyModules = (definedModule: DefinedModule) => {
  return [...definedModule.deps.values()].map((dep) =>
    fetchDependencyModule(definedModule, dep)
  );
};

const executeModule = (definedModule: DefinedModule) => {
  const resolvedDependencies = fetchDependencyModules(definedModule);

  definedModule.module.loaded = true;

  const result = definedModule.factory(...resolvedDependencies);
  if (result) {
    definedModule.module.exports = result;
  }
};
