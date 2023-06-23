import { dirname } from "./dirname";

/**
 * Create a module resolver
 * @param {string} currentModulePath
 */
export const makeResolver =
  (currentModulePath) =>
  /**
   * Resolve a module
   * @param {string} path
   */
  (path) => {
    if (path.startsWith("~") || path.startsWith("@")) {
      return path;
    }

    const splitPath = path.split("/");
    return splitPath.reduce((acc, value) => {
      if (value === ".") {
        return dirname(acc);
      }

      if (value === "..") {
        if (currentModulePath.length === 0) {
          throw new Error(
            `Cannot import "${path}" from "${currentModulePath}"`
          );
        }
        return dirname(dirname(acc));
      }

      return (acc ? acc + "/" : "") + value;
    }, currentModulePath);
  };
