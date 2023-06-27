import { Module, ModuleFactory } from "./types";

export type CachedModule = {
  factory: ModuleFactory;
  dependencies: Set<string>;
  module: Module;
};

export const cache = new Map<string, CachedModule>();
