import { makeResolver } from "./makeResolver";
import { ModuleExports, getModule, getModuleAsync } from "./module";

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

  const asyncRequireModule = async (id: string) => {
    const resolvedId = moduleResolver(id);
    const module = await getModuleAsync(currentId, resolvedId);
    return module.exports;
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

    const modulesPromise = Promise.all(ids.map(asyncRequireModule));

    if (resolve && reject) {
      modulesPromise.then(resolve).catch(reject);
      return;
    }

    if (resolve) {
      modulesPromise.then((modules) => resolve(...modules));
      return;
    }

    throw new Error(
      "when 'paths' is an array, resolve and reject have to be defined"
    );
  }
  require.toUrl = moduleResolver;
  return require;
};
