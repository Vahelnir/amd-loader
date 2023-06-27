const importScript = (moduleId) => {
  const script = document.createElement("script");
  script.async = true;
  script.src = moduleId + ".js";
  script.setAttribute("data-module-name", moduleId);
  document.body.append(script);
};

window.addEventListener("DOMContentLoaded", () => {
  importScript("testModule");
});
