import { drivers } from "./drivers";
import { IDriver } from "./drivers/driver";
import Lexer from "./lexer";
import Parser from "./parser";
import { DriverName } from "./types";

/**
 * 编译器
 */
class SQLCompiler {
  private lexer: Lexer;
  private parser: Parser;
  private driverInstance: IDriver;

  constructor(sql: string, driverName: DriverName = "mysql") {
    if (!drivers[driverName]) {
      throw new Error(`Unsupported driver: ${driverName}`);
    }
    this.driverInstance = new drivers[driverName]();

    this.lexer = new Lexer(sql, this.driverInstance.tokens);
    this.parser = new Parser(this.lexer, this.driverInstance);
  }

  /**
   * 编译 SQL 生成 AST
   */
  compile() {
    return this.parser.parse();
  }

  /**
   * 遍历 AST
   */
  traverse(ast: any, callback: (node: any) => void) {}

  /**
   * 生成 SQL
   */
  generate(ast: any) {}
}

export default SQLCompiler;
