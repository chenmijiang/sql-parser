import { ITokenDefinition, Token } from "../types";

export class Driver {
  tokens: ITokenDefinition[] = [];
  currentToken: Token = null;

  constructor() {}

  init(nextToken: () => Token) {
    this.nextToken = nextToken;
    // 初始化当前 token
    this.currentToken = nextToken();
  }

  parse() {
    throw new Error("Method not implemented.");
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
    this.currentToken = this.nextToken();
  }
  nextToken: () => Token = () => null;
}
