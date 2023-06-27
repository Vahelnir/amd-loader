import { makeResolver } from "./makeResolver";
import { ModuleExports, getModule } from "./module";

type ResolveFunc = (...deps: unknown[]) => void;
type RejectFunc = (rej: unknown) => void;

export type RequireFunc = ReturnType<typeof makeRequire>;

/**
 * Create a new require relative to the `currentId`
 */
export const makeRequire = (currentId = "") => {
  const moduleResolver = makeResolver(currentId);
  const requireModule = (id: string) => {
    const resolvedId = moduleResolver(id);
    return getModule(currentId, resolvedId).exports;
  };

  function require(ids: string): ModuleExports;
  function require(
    ids: string[],
    resolve: ResolveFunc,
    reject: RejectFunc
  ): undefined;
  function require(
    ids: string | string[],
    resolve?: ResolveFunc,
    reject?: RejectFunc
  ): ModuleExports | undefined {
    if (!Array.isArray(ids)) {
      return requireModule(ids);
    }

    const importedModules = ids.map(requireModule);
    const error = undefined;

    if (resolve && reject) {
      if (error) {
        reject(error);
      }
      resolve(...importedModules);
      return;
    }

    if (resolve) {
      resolve(...importedModules, error);
      return;
    }

    throw new Error(
      "when 'paths' is an array, resolve and reject have to be defined"
    );
  }
  require.toUrl = moduleResolver;
  return require;
};
