import { beforeEach, describe, expect, it } from "vitest";
import { CommonJSModuleFactory } from "../src/module/types";
import { parseDependencies } from "../src/parseDependencies";
import { cache } from "../src/module/cache";

describe("parseDependencies()", () => {
  beforeEach(() => {
    cache.clear();
  });

  it("should create a named module with dependencies declared in the factory", () => {
    const expectedDependencies = ["imatest"];
    const method: CommonJSModuleFactory = (require) => {
      require("imatest");
    };

    const result = parseDependencies(method.toString());

    expect(result).toEqual(expectedDependencies);
  });

  it("should not extract dependencies from comments", () => {
    const expectedDependencies = ["helloworld"];
    const method: CommonJSModuleFactory = (require) => {
      // require("hello")
      require("helloworld");
    };

    const result = parseDependencies(method.toString());

    expect(result).toEqual(expectedDependencies);
  });

  it("should extract the same dependency each time it is present", () => {
    const expectedDependencies = [
      "helloworld",
      "helloworld",
      "helloworld",
      "helloworld",
    ];
    const method: CommonJSModuleFactory = (require) => {
      // require("hello")
      require("helloworld");
      require("helloworld");
      require("helloworld");
      require("helloworld");
    };

    const result = parseDependencies(method.toString());

    expect(result).toEqual(expectedDependencies);
  });
});
