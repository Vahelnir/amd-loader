import { dirname } from "./dirname";

/**
 * Create a module resolver
 */
export const makeResolver = (currentModuleId: string) => (moduleId: string) => {
  if (moduleId.startsWith("~") || moduleId.startsWith("@")) {
    return moduleId;
  }

  const splitPath = moduleId.split("/");
  return splitPath.reduce((acc, value) => {
    if (value === ".") {
      return dirname(acc);
    }

    if (value === "..") {
      if (currentModuleId.length === 0) {
        throw new Error(
          `Cannot import "${moduleId}" from "${currentModuleId}"`
        );
      }
      return dirname(dirname(acc));
    }

    return (acc ? acc + "/" : "") + value;
  }, currentModuleId);
};
