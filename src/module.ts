import { CachedModule, modulesCache } from "./modulesCache";
import { RequireFunc } from "./makeRequire";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleExports = any;

export type ModuleFactory<T extends ModuleExports[] = ModuleExports[]> = (
  ...args: T
) => unknown;

export type CommonJSModuleFactory = ModuleFactory<
  [RequireFunc, Record<PropertyKey, unknown>, Module]
>;

export type Module = {
  children: Module[];
  exports: ModuleExports;
  filename: string;
  id: string;
  isPreloading: boolean;
  loaded: boolean;
  path: string;
  paths: string[];
  require: RequireFunc;
};

export const getModule = (currentId: string, id: string) => {
  const definedModule = modulesCache.get(id);
  if (!definedModule) {
    throw new Error(
      `module "${id}" does not exist, resolved module name: "${id}" (imported by "${currentId}")`
    );
  }

  if (!definedModule.module.loaded) {
    executeModule(definedModule);
  }

  return definedModule.module;
};

const fetchDependencyModule = (
  definedModule: CachedModule,
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

  const foundModule = getModule(module.id, dependency);
  module.children.push(foundModule);
  return foundModule.exports;
};

const fetchDependencyModules = (definedModule: CachedModule) => {
  return [...definedModule.dependencies.values()].map((dep) =>
    fetchDependencyModule(definedModule, dep)
  );
};

const executeModule = (definedModule: CachedModule) => {
  const resolvedDependencies = fetchDependencyModules(definedModule);

  definedModule.module.loaded = true;

  const result = definedModule.factory(...resolvedDependencies);
  if (result) {
    definedModule.module.exports = result;
  }
};
