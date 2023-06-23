import { requireModule } from "./module";

type ResolveFunc = (...deps: unknown[]) => void;
type RejectFunc = (rej: unknown) => void;

export type RequireFunc = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ids: string): any;
  (ids: string[], resolve: ResolveFunc, reject: RejectFunc): undefined;
  (
    ids: string[] | string,
    resolve?: ResolveFunc,
    reject?: RejectFunc
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any | undefined;
};

/**
 * Create a new require relative to the `currentId`
 */
export const makeRequire = (currentId = "") => {
  return ((
    ids: string | string[],
    resolve?: ResolveFunc,
    reject?: RejectFunc
  ): unknown | undefined => {
    if (!Array.isArray(ids)) {
      return requireModule(currentId, ids).exports;
    }

    if (resolve && reject) {
      resolve(...ids.map((id) => requireModule(currentId, id).exports));
    }

    throw new Error(
      "when 'paths' is an array, resolve and reject have to be defined"
    );
  }) as RequireFunc;
};
