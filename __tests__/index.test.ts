import { SQLCompiler } from "@/index";

describe("Lexer", () => {
  it("should be defined", () => {
    const compiler = new SQLCompiler(
      "   SELECT a, b, c as d, count(e) FROM students   ",
    );

    const ast = compiler.compile();

    expect(ast).toBeDefined();
  });
});
