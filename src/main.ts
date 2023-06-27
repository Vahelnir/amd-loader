import { amdLoader } from "./amdLoader";

appContext.amdLoader = amdLoader;
appContext.define = amdLoader.define;
appContext.require = amdLoader.require;
appContext.importModule = amdLoader.import;
