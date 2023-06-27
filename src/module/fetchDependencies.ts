import { CachedModule } from "./cache";
import { getModuleAsync } from "./getModule";

const fetchDependency = async (
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

export const fetchDependencies = (cachedModule: CachedModule) => {
  return Promise.all(
    [...cachedModule.dependencies.values()].map((dep) =>
      fetchDependency(cachedModule, dep)
    )
  );
};
