import { cache } from "./cache";
import { importAsScript } from "../loading/importAsScript";
import { execute } from "./execute";

export const getAsync = async (currentId: string, id: string) => {
  let cachedModule = cache.get(id);
  if (!cachedModule) {
    await importAsScript(id);
    cachedModule = cache.get(id);
  }
  if (!cachedModule) {
    throw new Error(
      `module "${id}" does not exist, resolved module name: "${id}" (imported by "${currentId}")`
    );
  }

  if (!cachedModule.module.loaded) {
    await execute(cachedModule);
  }

  return cachedModule.module;
};

export const get = (currentId: string, id: string) => {
  const cachedModule = cache.get(id);
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
