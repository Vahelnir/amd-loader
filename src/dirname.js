/**
 * Return the path to the parent directory
 * @param {string} path
 */
export const dirname = (path) => {
  const lastPathDelimiterIndex = path.lastIndexOf("/");
  if (lastPathDelimiterIndex < 0) {
    return "";
  }

  return path.slice(0, path.lastIndexOf("/"));
};
