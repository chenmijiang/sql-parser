import { IDriver } from "./drivers/driver";
import Lexer from "./lexer";
import { Token } from "./types";

/**
 * 语法分析器
 */
class Parser {
  private lexer: Lexer;
  private currentToken: Token;
  private driver: IDriver;

  constructor(lexer: Lexer, driver: IDriver) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
    this.driver = driver;

    this.driver.init(
      this.currentToken,
      this.lexer.nextToken.bind(this.lexer),
      this.expect.bind(this),
    );
  }

  parse() {
    return this.driver.parse();
  }

  expect(type: string, value?: string) {
    if (
      this.currentToken?.type !== type ||
      (value && this.currentToken.value.toUpperCase() !== value.toUpperCase())
    ) {
      throw new SyntaxError(
        `Expected token ${type}${value ? `: ${value}` : ""}, but found ${this.currentToken?.type}: ${this.currentToken?.value}`,
      );
    }
    this.currentToken = this.lexer.nextToken();
    this.driver.updateCurrentToken(this.currentToken);
  }
}

export default Parser;
