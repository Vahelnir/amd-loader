/**
 * @typedef {ReturnType<typeof makeRequire>} RequireFunc
 */

import { requireModule } from "./module";

/**
 * Create a new require relative to the `currentId`
 * @param {string} [currentId=""]
 */
export const makeRequire =
  (currentId = "") =>
  /**
   * @overload
   * @param {string} ids
   * @returns {unknown}
   */
  /**
   * @overload
   * @param {string[]} ids
   * @param {(...deps: unknown[]) => void} resolve
   * @param {(rejection: unknown) => void} reject
   * @returns {undefined}
   */
  /**
   * @param {string[] | string} ids
   * @param {(...deps: unknown[]) => void} [resolve]
   * @param {(rejection: unknown) => void} [reject]
   * @returns {unknown | undefined}
   */
  (ids, resolve, reject) => {
    if (!Array.isArray(ids)) {
      return requireModule(currentId, ids).exports;
    }
  };
