import { Module, ModuleFactory } from "./types";

export type CachedModule = {
  factory: ModuleFactory;
  dependencies: string[];
  module: Module;
};

export const cache = new Map<string, CachedModule>();
