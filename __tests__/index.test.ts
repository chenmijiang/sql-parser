import { Compiler } from "@/index";

describe("Lexer", () => {
  it("should be defined", () => {
    const compiler = new Compiler("   SELECT a, b FROM table");

    const ast = compiler.compile();

    expect(ast).toEqual({
      type: "SELECT",
      columns: ["a", "b"],
    });
  });
});
