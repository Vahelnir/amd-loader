import { CachedModule } from "./cache";
import { fetchDependencies } from "./fetchDependencies";

export const execute = async (cachedModule: CachedModule) => {
  const resolvedDependencies = await fetchDependencies(cachedModule);

  cachedModule.module.loaded = true;

  const result = cachedModule.factory(...resolvedDependencies);
  if (result) {
    cachedModule.module.exports = result;
  }
};
