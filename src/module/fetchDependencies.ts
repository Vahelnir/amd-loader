import { CachedModule } from "./cache";
import { getAsync } from "./get";

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

  const foundModule = await getAsync(module.id, dependency);

  module.children.push(foundModule);
  return foundModule.exports;
};

export const fetchDependencies = (cachedModule: CachedModule) => {
  return Promise.all(
    cachedModule.dependencies.map((dep) => fetchDependency(cachedModule, dep))
  );
};
