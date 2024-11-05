import { Token, TokenDefinition } from "../types";

export abstract class Driver {
  tokens: TokenDefinition[] = [];
  currentToken: Token = null;
  nextToken: () => Token = () => null;

  constructor() {}

  abstract parse(): any;

  init(nextToken: () => Token) {
    this.nextToken = nextToken;
    // 初始化当前 token
    this.currentToken = nextToken();
  }

  getTokenLocation(token: Token) {
    return token?.loc;
  }

  error(message: string): never {
    throw new SyntaxError(message);
  }

  expect(type: string, value?: string) {
    if (
      this.currentToken?.type !== type ||
      (value && this.currentToken.value.toUpperCase() !== value.toUpperCase())
    ) {
      this.error(
        `Expected token ${type}${value ? `: ${value}` : ""}, but found ${this.currentToken?.type}: ${this.currentToken?.value}`,
      );
    }
  }
}
