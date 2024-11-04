import { ITokenDefinition, Token } from "../types";

export class IDriver {
  tokens: ITokenDefinition[] = [];
  currentToken: Token = null;

  constructor() {}

  init(
    currentToken: Token,
    nextToken: () => Token,
    expect: (type: string, value?: string) => void,
  ) {
    this.currentToken = currentToken;
    this.expect = expect;
    this.nextToken = nextToken;
  }

  updateCurrentToken(token: Token) {
    this.currentToken = token;
  }

  parse() {}
  expect: (type: string, value?: string) => void = () => {};
  nextToken: () => Token = () => null;
}
