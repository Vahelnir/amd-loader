/**
 * Return the path to the parent directory
 */
export const dirname = (path: string) => {
  const lastPathDelimiterIndex = path.lastIndexOf("/");
  if (lastPathDelimiterIndex < 0) {
    return "";
  }

  return path.slice(0, path.lastIndexOf("/"));
};
