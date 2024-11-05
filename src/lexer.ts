import { GenerateLocParams, Token, TokenDefinition, TokenLoc } from "./types";

/**
 * 词法分析器
 */
class Lexer {
  private sql: string;
  private position: number;
  /**
   * 当前行号
   */
  private line: number;
  /**
   * 当前列号
   */
  private column: number;
  /**
   * 词法单元定义
   */
  private tokens: TokenDefinition[];

  constructor(sql: string, tokens: TokenDefinition[]) {
    this.sql = sql;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = tokens;
  }

  nextToken(): Token {
    if (this.position >= this.sql.length) {
      return null;
    }

    for (const { regex, type } of this.tokens) {
      const match = regex.exec(this.sql.slice(this.position));
      if (match && match.index === 0) {
        const value = match[0];
        const startIndex = this.position;
        const startLine = this.line;
        const startColumn = this.column;

        // 更新位置信息
        this.updatePosition(value);

        if (type) {
          return {
            type,
            value,
            upperValue: value.toUpperCase(),
            loc: this.generateLocation({
              startIndex,
              startLine,
              startColumn,
              endIndex: this.position,
              endLine: this.line,
              endColumn: this.column,
            }),
          };
        }
      }
    }

    return null;
  }

  updatePosition(value: string) {
    const lines = value.split("\n");
    if (lines.length > 1) {
      this.line += lines.length - 1;
      this.column = lines[lines.length - 1].length + 1;
    } else {
      this.column += value.length;
    }
    this.position += value.length;
  }

  generateLocation(locParams: GenerateLocParams) {
    return Object.fromEntries(
      ["start", "end"].map((key) => [
        key,
        {
          index: locParams[(key + "Index") as keyof GenerateLocParams],
          line: locParams[(key + "Line") as keyof GenerateLocParams],
          column: locParams[(key + "Column") as keyof GenerateLocParams],
        },
      ]),
    ) as unknown as TokenLoc;
  }
}

export default Lexer;
