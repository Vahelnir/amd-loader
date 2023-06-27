import { describe, expect, it } from "vitest";
import { define } from "../src/define";
import { amdLoader } from "../src/amdLoader";

describe("defining-modules", () => {
  it("should import a simple module", () => {
    const p = new Promise<void>((res) =>
      define("test", () => {
        res();
      })
    );

    amdLoader.require("test");

    return p;
  });

  it("should have require, exports & module if no explicit dependencies are defined", () => {
    const moduleName = "test";

    const moduleExecutionPromise = new Promise<void>((res) =>
      define(moduleName, (require, exports, module) => {
        expect(module).toBeDefined();
        expect(module.id).toBe(moduleName);
        expect(module.require).toBe(require);
        expect(module.exports).toBe(exports);
        res();
      })
    );

    amdLoader.require(moduleName);

    return moduleExecutionPromise;
  });

  it("should require data exported with 'exports'", () => {
    const moduleName = "test";

    define(moduleName, (_require, exports) => {
      exports.hello = "world";
      exports.have = "I been exported ?";
    });

    const requiredModule = amdLoader.require(moduleName);

    expect(requiredModule.hello).toBe("world");
    expect(requiredModule.have).toBe("I been exported ?");
  });

  it("should require data exported with 'module.exports'", () => {
    const moduleName = "test";

    define(moduleName, (_require, _exports, module) => {
      module.exports = { test: "working properly!" };
      module.exports.hello = "world";
      module.exports.have = "I been exported ?";
    });

    const requiredModule = amdLoader.require(moduleName);

    expect(requiredModule.test).toBe("working properly!");
    expect(requiredModule.hello).toBe("world");
    expect(requiredModule.have).toBe("I been exported ?");
  });

  it("should require data exported with the return", () => {
    const moduleName = "test";

    define(moduleName, () => {
      return {
        test: "world",
        hello: "working correctly!",
        I: "have been exported!",
      };
    });

    const requiredModule = amdLoader.require(moduleName);

    expect(requiredModule.test).toBe("world");
    expect(requiredModule.hello).toBe("working correctly!");
    expect(requiredModule.I).toBe("have been exported!");
  });

  it("should import dependencies with require", () => {
    define("react", (_, exports) => {
      exports.h = () => "test";
    });

    const moduleExecutionPromise = new Promise<void>((res) => {
      define("main", (require) => {
        const react = require("react");

        expect(react.h).toBeTypeOf("function");
        expect(react.h()).toBe("test");
        res();
      });
    });

    amdLoader.require("main");

    return moduleExecutionPromise;
  });

  it("should import dependencies with explicit dependencies", () => {
    define("react", (_, exports) => {
      exports.h = () => "test";
    });

    const moduleExecutionPromise = new Promise<void>((res) => {
      define("main", ["react"], (react) => {
        expect(react.h).toBeTypeOf("function");
        expect(react.h()).toBe("test");
        res();
      });
    });

    amdLoader.require("main");

    return moduleExecutionPromise;
  });
});
