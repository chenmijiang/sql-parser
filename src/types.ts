export type DriverName = "mysql";

export interface TokenDefinition {
  regex: RegExp;
  type: string | null;
}

export type TokenLoc = {
  line: number;
  index: number;
  column: number;
};

export type Token = {
  type: string;
  value: string;
  loc: {
    start: TokenLoc;
    end: TokenLoc;
  };
} | null;

export interface AST {
  type: string;
  value: string;
  loc: {
    start: TokenLoc;
    end: TokenLoc;
  };
  children: AST[];
}
