import { RequireFunc } from "@/makeRequire";
import { ResolverFunc } from "@/resolve/makeResolver";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleExports = any;

export type ModuleFactory<T extends ModuleExports[] = ModuleExports[]> = (
  ...args: T
) => unknown;

export type CommonJSModuleFactory = ModuleFactory<
  [RequireFunc, Record<PropertyKey, unknown>, Module]
>;

export type Module = {
  children: Module[];
  exports: ModuleExports;
  filename: string;
  id: string;
  isPreloading: boolean;
  loaded: boolean;
  path: string;
  paths: string[];
  require: RequireFunc;
  resolver: ResolverFunc;
};
