import { Token, TokenDefinition } from "./types";

/**
 * 词法分析器
 */
class Lexer {
  /**
   * SQL 语句
   */
  private sql: string;
  /**
   * 当前位置
   */
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
  private tokenDefinitions: TokenDefinition[];

  constructor(sql: string, tokens: TokenDefinition[]) {
    this.sql = sql;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokenDefinitions = tokens;
  }

  nextToken(): Token {
    if (this.position >= this.sql.length) {
      return null;
    }

    for (const { regex, type } of this.tokenDefinitions) {
      const match = regex.exec(this.sql.slice(this.position));
      if (match && match.index === 0) {
        const value = match[0];
        const startLine = this.line;
        const startColumn = this.column;

        // 更新位置信息
        const lines = value.split("\n");
        if (lines.length > 1) {
          this.line += lines.length - 1;
          this.column = lines[lines.length - 1].length + 1;
        } else {
          this.column += value.length;
        }
        this.position += value.length;

        if (type) {
          return {
            type,
            value,
            loc: {
              start: {
                index: this.position - value.length,
                line: startLine,
                column: startColumn,
              },
              end: {
                index: this.position,
                line: this.line,
                column: this.column,
              },
            },
          };
        }
      }
    }

    return null;
  }
}

export default Lexer;
