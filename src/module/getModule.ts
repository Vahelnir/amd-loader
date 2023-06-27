import { cache } from "./cache";
import { importAsScript } from "../loading/importAsScript";
import { executeModule } from "./execute";

export const getModuleAsync = async (currentId: string, id: string) => {
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
    await executeModule(cachedModule);
  }

  return cachedModule.module;
};

export const getModule = (currentId: string, id: string) => {
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
