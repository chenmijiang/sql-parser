import { Driver } from "./drivers/driver";
import Lexer from "./lexer";

/**
 * 语法分析器
 */
class Parser {
  private driver: Driver;

  constructor(lexer: Lexer, driver: Driver) {
    this.driver = driver;

    this.driver.init(lexer.nextToken.bind(lexer));
  }

  parse() {
    return this.driver.parse();
  }
}

export default Parser;
