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
  let cachedModule = modulesCache.get(id);
  if (!cachedModule) {
    cachedModule = await or(currentId, id);
  }
  if (!cachedModule) {
    throw new Error(
      `module "${id}" does not exist, resolved module name: "${id}" (imported by "${currentId}")`
    );
  }

  if (!cachedModule.module.loaded) {
    await executeModule(cachedModule);
  }

  return cachedModule.module;
};

export const getModuleAsync = (currentId: string, id: string) =>
  getModuleAsyncOr(currentId, id, () => undefined);

export const getModule = (currentId: string, id: string) => {
  const cachedModule = modulesCache.get(id);
  if (!cachedModule) {
    throw new Error(
      `module "${id}" does not exist, resolved module name: "${id}" (imported by "${currentId}")`
    );
  }
  if (!cachedModule.module.loaded) {
    throw new Error(
      "The module you are trying to load has not yet been loaded"
    );
  }

  return cachedModule.module;
};

const fetchDependencyModule = async (
  cachedModule: CachedModule,
  dependency: string
) => {
  const { module } = cachedModule;

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

const fetchDependencyModules = (cachedModule: CachedModule) => {
  return Promise.all(
    [...cachedModule.dependencies.values()].map((dep) =>
      fetchDependencyModule(cachedModule, dep)
    )
  );
};

const executeModule = async (cachedModule: CachedModule) => {
  const resolvedDependencies = await fetchDependencyModules(cachedModule);

  cachedModule.module.loaded = true;

  const result = cachedModule.factory(...resolvedDependencies);
  if (result) {
    cachedModule.module.exports = result;
  }
};
