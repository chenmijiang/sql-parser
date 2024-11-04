import Lexer from "./lexer";

/**
 * 语法分析器
 */
class Parser {
  private lexer: Lexer;
  private currentToken: any;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
  }

  parse() {
    switch (this.currentToken.type) {
      case "KEYWORD":
        switch (this.currentToken.value.toUpperCase()) {
          case "SELECT":
            return this.parseSelect();
          case "INSERT":
            return this.parseInsert();
          case "UPDATE":
            return this.parseUpdate();
          case "DELETE":
            return this.parseDelete();
          default:
            throw new SyntaxError(
              `Unsupported statement: ${this.currentToken.value}`,
            );
        }
      default:
        throw new SyntaxError("Expected a statement");
    }
  }

  parseSelect() {
    this.expect("KEYWORD", "SELECT");
    const columns = this.parseColumns();
    this.expect("KEYWORD", "FROM");
    const table = this.parseTable();
    const joins = this.parseJoins();
    const where = this.parseWhere();
    return { type: "SELECT", columns, table, joins, where };
  }

  parseInsert() {
    this.expect("KEYWORD", "INSERT");
    this.expect("KEYWORD", "INTO");
    const table = this.parseTable();
    const columns = this.parseInsertColumns();
    this.expect("KEYWORD", "VALUES");
    const values = this.parseInsertValues();
    return { type: "INSERT", table, columns, values };
  }

  parseUpdate() {
    this.expect("KEYWORD", "UPDATE");
    const table = this.parseTable();
    this.expect("KEYWORD", "SET");
    const updates = this.parseUpdates();
    const where = this.parseWhere();
    return { type: "UPDATE", table, updates, where };
  }

  parseDelete() {
    this.expect("KEYWORD", "DELETE");
    this.expect("KEYWORD", "FROM");
    const table = this.parseTable();
    const where = this.parseWhere();
    return { type: "DELETE", table, where };
  }

  parseColumns() {
    const columns = [];
    while (
      this.currentToken &&
      (this.currentToken.type === "IDENTIFIER" ||
        this.currentToken.type === "FUNCTION")
    ) {
      columns.push(this.currentToken.value);
      this.currentToken = this.lexer.nextToken();
      if (
        this.currentToken &&
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.lexer.nextToken();
      }
    }
    return columns;
  }

  parseInsertColumns() {
    this.expect("PUNCTUATION", "(");
    const columns = this.parseColumns();
    this.expect("PUNCTUATION", ")");
    return columns;
  }

  parseInsertValues() {
    this.expect("PUNCTUATION", "(");
    const values = this.parseValues();
    this.expect("PUNCTUATION", ")");
    return values;
  }

  parseValues() {
    const values = [];
    while (
      this.currentToken &&
      (this.currentToken.type === "STRING" ||
        this.currentToken.type === "NUMBER")
    ) {
      values.push(this.currentToken.value);
      this.currentToken = this.lexer.nextToken();
      if (
        this.currentToken &&
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.lexer.nextToken();
      }
    }
    return values;
  }

  parseUpdates() {
    const updates = [];
    while (this.currentToken && this.currentToken.type === "IDENTIFIER") {
      const column = this.currentToken.value;
      this.expect("IDENTIFIER");
      this.expect("OPERATOR");
      const value = this.currentToken.value;
      this.expect("STRING"); // Assuming only strings for simplicity; adjust as needed.
      updates.push({ column, value });
      if (
        this.currentToken &&
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.lexer.nextToken();
      }
    }
    return updates;
  }

  parseTable() {
    const tableName = this.currentToken.value;
    this.expect("IDENTIFIER");

    let alias = null;
    if (
      this.currentToken &&
      this.currentToken.type === "KEYWORD" &&
      this.currentToken.value.toUpperCase() === "AS"
    ) {
      this.currentToken = this.lexer.nextToken(); // 处理 AS
      alias = this.currentToken.value;
      this.expect("IDENTIFIER");
    }

    return { name: tableName, alias };
  }

  parseJoins() {
    const joins = [];
    while (
      this.currentToken &&
      this.currentToken.type === "KEYWORD" &&
      /JOIN/i.test(this.currentToken.value)
    ) {
      const joinType = this.currentToken.value.toUpperCase();
      this.currentToken = this.lexer.nextToken(); // 处理 JOIN
      const table = this.parseTable();
      this.expect("KEYWORD", "ON");
      const condition = this.parseCondition(); // 解析 JOIN 条件
      joins.push({ type: joinType, table, condition });
    }
    return joins;
  }

  parseWhere() {
    if (
      this.currentToken &&
      this.currentToken.type === "KEYWORD" &&
      this.currentToken.value.toUpperCase() === "WHERE"
    ) {
      this.currentToken = this.lexer.nextToken(); // 处理 WHERE
      return this.parseCondition(); // 解析条件
    }
    return null;
  }

  parseCondition() {
    const left = this.currentToken.value;
    this.expect("IDENTIFIER");
    const operator = this.currentToken.value;
    this.expect("OPERATOR");
    const right = this.currentToken.value;
    this.expect("IDENTIFIER"); // 可以根据需要调整

    return { left, operator, right };
  }

  expect(type: string, value?: string) {
    if (
      this.currentToken.type !== type ||
      (value && this.currentToken.value.toUpperCase() !== value.toUpperCase())
    ) {
      throw new SyntaxError(
        `Expected token ${type}${value ? `: ${value}` : ""}, but found ${this.currentToken.type}: ${this.currentToken.value}`,
      );
    }
    this.currentToken = this.lexer.nextToken();
  }
}

export default Parser;
