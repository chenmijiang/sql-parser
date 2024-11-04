import { ITokenDefinition } from "./types";

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
   * 词法单元定义
   */
  private tokenDefinitions: ITokenDefinition[];

  constructor(sql: string, tokens: ITokenDefinition[]) {
    this.sql = sql;
    this.position = 0;
    this.tokenDefinitions = tokens;
  }

  nextToken() {
    if (this.position >= this.sql.length) {
      return null;
    }

    for (const { regex, type } of this.tokenDefinitions) {
      const match = regex.exec(this.sql.slice(this.position));
      if (match && match.index === 0) {
        const value = match[0];
        this.position += value.length;
        if (type) {
          return { type, value };
        }
      }
    }

    return null;
  }
}

export default Lexer;
