import { Driver } from "./driver";

class MySQLDriver extends Driver {
  constructor() {
    super();
  }

  /**
   * 词法分析 token 定义
   */
  tokens = [
    { regex: /\s+/, type: null }, // 忽略空格
    {
      regex:
        /SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|AND|OR|NOT|LIKE|BETWEEN|IN|HAVING|GROUP BY|ORDER BY|LIMIT|OFFSET|UNION|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|AS|CASE|WHEN|THEN|ELSE|END|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|DATABASE|SCHEMA|GRANT|REVOKE|ROLLBACK|COMMIT|START TRANSACTION|SAVEPOINT/i,
      type: "KEYWORD",
    },
    {
      regex:
        /COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|DATE_FORMAT|DATE_ADD|DATE_SUB|NOW|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|IF|IFNULL|COALESCE|CAST|CONVERT|GROUP_CONCAT/i,
      type: "FUNCTION",
    },
    { regex: /`[a-zA-Z0-9_]+`/, type: "IDENTIFIER" }, // 反引号标识符
    { regex: /[a-zA-Z_][a-zA-Z0-9_]*/, type: "IDENTIFIER" }, // 普通标识符
    { regex: /'([^'\\]*(\\.)?)*'/, type: "STRING" }, // 字符串常量
    { regex: /"([^"\\]*(\\.)?)*"/, type: "STRING" }, // 双引号字符串
    { regex: /\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?/, type: "DATETIME" }, // 日期时间
    { regex: /\d*\.\d+|\d+\.\d*/, type: "DECIMAL" }, // 小数
    { regex: /\d+/, type: "NUMBER" }, // 整数
    { regex: /[=<>!]+/, type: "OPERATOR" }, // 比较运算符
    { regex: /\|\||&&/, type: "LOGICAL_OPERATOR" }, // 逻辑运算符
    { regex: /[();,]/, type: "PUNCTUATION" }, // 标点符号
    { regex: /[+*/-]/, type: "ARITHMETIC_OPERATOR" }, // 算术运算符
    { regex: /\[|\]|\{|\}/, type: "BRACKET" }, // 括号
    { regex: /\$/, type: "VARIABLE" }, // 变量标识符
  ];

  parse() {
    switch (this.currentToken?.type) {
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
      this.currentToken = this.nextToken();
      if (
        this.currentToken &&
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.nextToken();
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
      this.currentToken = this.nextToken();
      if (
        this.currentToken &&
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.nextToken();
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
        // @ts-ignore
        this.currentToken.type === "PUNCTUATION" &&
        this.currentToken.value === ","
      ) {
        this.currentToken = this.nextToken();
      }
    }
    return updates;
  }

  parseTable() {
    const tableName = this.currentToken?.value;
    this.expect("IDENTIFIER");

    let alias = null;
    if (
      this.currentToken &&
      this.currentToken.type === "KEYWORD" &&
      this.currentToken.value.toUpperCase() === "AS"
    ) {
      this.currentToken = this.nextToken(); // 处理 AS
      alias = this.currentToken?.value;
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
      this.currentToken = this.nextToken(); // 处理 JOIN
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
      this.currentToken = this.nextToken(); // 处理 WHERE
      return this.parseCondition(); // 解析条件
    }
    return null;
  }

  parseCondition() {
    const left = this.currentToken?.value;
    this.expect("IDENTIFIER");
    const operator = this.currentToken?.value;
    this.expect("OPERATOR");
    const right = this.currentToken?.value;
    this.expect("IDENTIFIER"); // 可以根据需要调整

    return { left, operator, right };
  }
}

export default MySQLDriver;
