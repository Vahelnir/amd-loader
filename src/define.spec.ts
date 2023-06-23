import { it, describe, expect, beforeEach } from "vitest";
import { define } from "./define";
import { definedModules } from "./module";

const noop = () => () => {
  // noop
};

describe("define()", () => {
  beforeEach(() => {
    definedModules.clear();
  });

  it("throw an error if called without any argument", () => {
    // @ts-ignore: because the signature does not exist
    expect(() => define()).toThrow();
  });

  define("when no explicit dependencies", () => {
    it("factory should have require, exports and module as dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(definedModules.get(moduleName)).toBeDefined();
    });
  });

  // TODO: implement anonymous define & test it

  define("with name and factory", () => {
    it("should create a named module without dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(definedModules.get(moduleName)).toBeDefined();
    });

    it("should add a DefinedModule into the module list", () => {
      const moduleName = "myModuleWithoutDependencies";
      const factory = noop();

      define(moduleName, factory);

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("with explicit dependencies and factory", () => {
    it("should create a named module with dependencies", () => {
      const moduleName = "myModuleWithDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const expectedDependencies = new Set(dependencies);

      define(moduleName, dependencies, noop());

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.deps).toEqual(expectedDependencies);
    });

    it("should add a DefinedModule into the module list", () => {
      const moduleName = "myModuleWithoutDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const factory = noop();

      define(moduleName, dependencies, factory);

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("dependency extraction", () => {
    it("should create a named module with dependencies declared in the factory", () => {
      const moduleName = "myModuleWithFactoryRequire";
      const expectedDependencies = new Set(["imatest"]);

      define(moduleName, (require) => {
        // @ts-ignore: because the module does not exist
        require("imatest");
      });

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.deps).toEqual(expectedDependencies);
    });

    it("should not extract dependencies from comments", () => {
      const moduleName = "myModuleWithFactoryRequire";
      const expectedDependencies = new Set(["helloworld"]);

      define(moduleName, (require) => {
        // require("hello")
        // @ts-ignore: because the module does not exist
        require("helloworld");
      });

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.deps).toEqual(expectedDependencies);
    });

    it("should concat extracted dependencies with explicit dependencies", () => {
      const moduleName = "myModuleWithDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const expectedDependencies = new Set([
        ...dependencies,
        "react",
        "./lambda",
      ]);

      define(moduleName, dependencies, function (_test, require) {
        // @ts-ignore: because the module does not exist
        require("react");
        // @ts-ignore: because the module does not exist
        require("./lambda");
      });

      const definedModule = definedModules.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.deps).toEqual(expectedDependencies);
    });
  });
});
