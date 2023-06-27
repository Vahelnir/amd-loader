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

export const getModuleAsyncOr = async (
  currentId: string,
  id: string,
  or: (
    currentId: string,
    id: string
  ) => Promise<CachedModule | undefined> | CachedModule | undefined
) => {
  let definedModule = modulesCache.get(id);
  if (!definedModule) {
    definedModule = await or(currentId, id);
  }
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

export const getModuleAsync = (currentId: string, id: string) =>
  getModuleAsyncOr(currentId, id, () => undefined);

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

const fetchDependencyModule = async (
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

  const foundModule = await getModuleAsyncOr(module.id, dependency, () => {
    // TODO: try to fetch the module from the server (fetch, script, whatever)
    return undefined;
  });

  module.children.push(foundModule);
  return foundModule.exports;
};

const fetchDependencyModules = (definedModule: CachedModule) => {
  return Promise.all(
    [...definedModule.dependencies.values()].map((dep) =>
      fetchDependencyModule(definedModule, dep)
    )
  );
};

const executeModule = async (definedModule: CachedModule) => {
  const resolvedDependencies = await fetchDependencyModules(definedModule);

  definedModule.module.loaded = true;

  const result = definedModule.factory(...resolvedDependencies);
  if (result) {
    definedModule.module.exports = result;
  }
};
