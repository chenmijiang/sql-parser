import Lexer from "./lexer";
import Parser from "./parser";

/**
 * 编译器
 */
class Compiler {
  private lexer: Lexer;
  private parser: Parser;

  constructor(sql: string) {
    this.lexer = new Lexer(sql);
    this.parser = new Parser(this.lexer);
  }

  compile() {
    return this.parser.parse();
  }
}

export default Compiler;
