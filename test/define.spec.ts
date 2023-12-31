import { it, describe, expect, beforeEach } from "vitest";
import { define } from "../src/define";
import { cache } from "../src/module/cache";

const noop = () => () => {
  // noop
};

describe("define()", () => {
  beforeEach(() => {
    cache.clear();
  });

  it("throw an error if called without any argument", () => {
    // @ts-ignore: because the signature does not exist
    expect(() => define()).toThrow();
  });

  describe("when no explicit dependencies", () => {
    it("factory should have require, exports and module as dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(cache.get(moduleName)).toBeDefined();
    });
  });

  // TODO: implement anonymous define & test it

  describe("with name and factory", () => {
    it("should create a named module without dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(cache.get(moduleName)).toBeDefined();
    });

    it("should add a DefinedModule into the module list", () => {
      const moduleName = "myModuleWithoutDependencies";
      const factory = noop();

      define(moduleName, factory);

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("with explicit dependencies and factory", () => {
    it("should create a named module with dependencies", () => {
      const moduleName = "myModuleWithDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const expectedDependencies = ["test", "require", "lodash"];

      define(moduleName, dependencies, noop());

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });

    it("should add a DefinedModule into the module list", () => {
      const moduleName = "myModuleWithoutDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const factory = noop();

      define(moduleName, dependencies, factory);

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("dependency extraction", () => {
    it("should create a named module with dependencies declared in the factory", () => {
      const moduleName = "myModuleWithFactoryRequire";
      const expectedDependencies = ["require", "exports", "module", "imatest"];

      define(moduleName, (require) => {
        require("imatest");
      });

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });

    it("should concat extracted dependencies with explicit dependencies", () => {
      const moduleName = "test/myModuleWithDependencies";
      const dependencies = ["../test", "require", "lodash"];
      const expectedDependencies = [
        "test",
        "require",
        "lodash",
        "react",
        "test/lambda",
      ];

      define(moduleName, dependencies, function (_test, require) {
        require("react");
        require("./lambda");
      });

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });
  });

  describe("dependency resolving", () => {
    it("should resolve the dependencies relatively to the current module", () => {
      const moduleName = "test/myModuleWithDependencies";
      const dependencies = ["../test", "require", "lodash"];
      const expectedDependencies = [
        "test",
        "require",
        "lodash",
        "react",
        "test/lambda",
      ];

      define(moduleName, dependencies, function (_test, require) {
        require("react");
        require("./lambda");
      });

      const definedModule = cache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });
  });

  describe("prefixed dependencies", () => {
    it("should resolve the proper prefixed dependency without changing it", () => {
      const prefixedModuleName = "~myPrefix/hello";
      const moduleName = "test/myModuleWithPrefixedDependencies";
      const dependencies = ["require"];
      const expectedDependencies = ["require", prefixedModuleName];

      define(prefixedModuleName, [], () => {
        // do nothing
      });

      define(moduleName, dependencies, (require) => {
        require("~myPrefix/hello");
      });

      const definedPrefixedModule = cache.get(prefixedModuleName);
      const definedModule = cache.get(moduleName);
      expect(definedPrefixedModule).toBeDefined();
      expect(definedModule).toBeDefined();

      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });
  });
});
