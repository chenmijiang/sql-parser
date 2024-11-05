export type DriverName = "mysql";

export interface TokenDefinition {
  regex: RegExp;
  type: string | null;
}

export type TokenLocParams = {
  line: number;
  index: number;
  column: number;
};

export interface GenerateLocParams {
  startIndex: number;
  startLine: number;
  startColumn: number;
  endIndex: number;
  endLine: number;
  endColumn: number;
}

export interface TokenLoc {
  start: TokenLocParams;
  end: TokenLocParams;
}

export type Token = {
  type: string;
  value: string;
  upperValue: string;
  loc: TokenLoc;
} | null;

export interface AST {
  type: string;
  value: string;
  loc: TokenLoc;
  children: AST[];
}
