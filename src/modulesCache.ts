import { Module, ModuleFactory } from "./module";

export type CachedModule = {
  factory: ModuleFactory;
  dependencies: Set<string>;
  module: Module;
};

export const modulesCache = new Map<string, CachedModule>();
