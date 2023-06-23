import global from "global";
import { amdLoader } from "./amdLoader";

global.amdLoader = amdLoader;
global.define = amdLoader.define;
global.require = amdLoader.require;
