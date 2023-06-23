import { RequireFunc } from "./makeRequire";
import { makeResolver } from "./makeResolver";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleFactory<T extends any[] = any[]> = (...args: T) => unknown;

export type CommonJSModuleFactory = ModuleFactory<
  [RequireFunc, Record<PropertyKey, unknown>, Module]
>;

export type Module = {
  children: Module[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any;
  filename: string;
  id: string;
  isPreloading: boolean;
  loaded: boolean;
  path: string;
  paths: string[];
  require: RequireFunc;
};

export type DefinedModule = {
  factory: ModuleFactory;
  dependencies: Set<string>;
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

  if (dependency === "module") {
    return module;
  }

  const foundModule = requireModule(module.id, dependency);
  module.children.push(foundModule);
  return foundModule.exports;
};

const fetchDependencyModules = (definedModule: DefinedModule) => {
  return [...definedModule.dependencies.values()].map((dep) =>
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
