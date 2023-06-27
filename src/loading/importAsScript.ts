export const importAsScript = (moduleId: string) => {
  const scriptUrl = moduleId + ".js";

  const script = document.createElement("script");
  script.async = true;
  script.src = scriptUrl;
  script.setAttribute("data-module-name", moduleId);
  document.body.append(script);

  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      resolve(moduleId);
      cleanup();
    };
    const handleError = () => {
      reject(
        `Error while loading module "${moduleId}", trying to load "${scriptUrl}"`
      );
      cleanup();
    };
    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
  });
};
