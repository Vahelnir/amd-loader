import { CachedModule, modulesCache } from "./modulesCache";
import { RequireFunc } from "./makeRequire";
import { importAsScript } from "./loading/importAsScript";

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

export const getModuleAsync = async (currentId: string, id: string) => {
  let cachedModule = modulesCache.get(id);
  if (!cachedModule) {
    await importAsScript(id);
    cachedModule = modulesCache.get(id);
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

  const foundModule = await getModuleAsync(module.id, dependency);

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
