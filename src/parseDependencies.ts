const COMMENT_REGEX = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm;
const REQUIRE_REGEX = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

/**
 * Extract the dependencies from a function content
 * Example:
 * ```js
 * function test() {
 *  const myModule = require("myModule");
 * }
 * parseDependencies(test.toString()) // will return ["myModule"]
 * ```
 * TODO: try to find a better solution than the one used by RequireJS
 */
export const parseDependencies = (content: string) => {
  const dependencies: string[] = [];
  content
    .replace(COMMENT_REGEX, (_, singlePrefix) => singlePrefix || "")
    .replace(REQUIRE_REGEX, (match, dep) => {
      dependencies.push(dep);
      return match;
    });
  return dependencies;
};
