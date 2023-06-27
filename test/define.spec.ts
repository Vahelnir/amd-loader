import { it, describe, expect, beforeEach } from "vitest";
import { define } from "../src/define";
import { modulesCache } from "../src/modulesCache";

const noop = () => () => {
  // noop
};

describe("define()", () => {
  beforeEach(() => {
    modulesCache.clear();
  });

  it("throw an error if called without any argument", () => {
    // @ts-ignore: because the signature does not exist
    expect(() => define()).toThrow();
  });

  define("when no explicit dependencies", () => {
    it("factory should have require, exports and module as dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(modulesCache.get(moduleName)).toBeDefined();
    });
  });

  // TODO: implement anonymous define & test it

  define("with name and factory", () => {
    it("should create a named module without dependencies", () => {
      const moduleName = "myModuleWithoutDependencies";

      define(moduleName, noop());

      expect(modulesCache.get(moduleName)).toBeDefined();
    });

    it("should add a DefinedModule into the module list", () => {
      const moduleName = "myModuleWithoutDependencies";
      const factory = noop();

      define(moduleName, factory);

      const definedModule = modulesCache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("with explicit dependencies and factory", () => {
    it("should create a named module with dependencies", () => {
      const moduleName = "myModuleWithDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const expectedDependencies = [...dependencies];

      define(moduleName, dependencies, noop());

      const definedModule = modulesCache.get(moduleName);
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

      const definedModule = modulesCache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect(definedModule?.factory).toBe(factory);
    });
  });

  describe("dependency extraction", () => {
    it("should create a named module with dependencies declared in the factory", () => {
      const moduleName = "myModuleWithFactoryRequire";
      const expectedDependencies = ["require", "exports", "module", "imatest"];

      define(moduleName, (require) => {
        // @ts-ignore: because the module does not exist
        require("imatest");
      });

      const definedModule = modulesCache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });

    it("should concat extracted dependencies with explicit dependencies", () => {
      const moduleName = "myModuleWithDependencies";
      const dependencies = ["./test", "require", "lodash"];
      const expectedDependencies = [...dependencies, "react", "./lambda"];

      define(moduleName, dependencies, function (_test, require) {
        // @ts-ignore: because the module does not exist
        require("react");
        // @ts-ignore: because the module does not exist
        require("./lambda");
      });

      const definedModule = modulesCache.get(moduleName);
      expect(definedModule).toBeDefined();
      expect([...definedModule!.dependencies.values()]).toEqual(
        expectedDependencies
      );
    });
  });
});
