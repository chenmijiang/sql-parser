import { IDriver } from "./drivers/driver";
import Lexer from "./lexer";
import { Token } from "./types";

/**
 * 语法分析器
 */
class Parser {
  private driver: IDriver;

  constructor(lexer: Lexer, driver: IDriver) {
    this.driver = driver;

    this.driver.init(lexer.nextToken.bind(lexer));
  }

  parse() {
    return this.driver.parse();
  }
}

export default Parser;
