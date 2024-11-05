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
    // 关键字和操作符合并
    {
      regex:
        /CREATE|DROP|ALTER|DATABASE|SCHEMA|USE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|START TRANSACTION|SHOW|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|INSERT|UPDATE|DELETE|REPLACE|TRUNCATE|MERGE|SELECT|FROM|WHERE|HAVING|GROUP BY|ORDER BY|LIMIT|OFFSET|UNION|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|ON|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|IFNULL|COALESCE|CAST|CONVERT|IS|EXISTS|BETWEEN|IN|NOT|LIKE|ALL|ANY|COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|DATE_FORMAT|DATE_ADD|DATE_SUB|NOW|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|GROUP_CONCAT|IF|SELECT DATABASE|SELECT SCHEMA/i,
      type: "KEYWORD",
    },
    // 函数合并
    {
      regex:
        /COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|DATE_FORMAT|DATE_ADD|DATE_SUB|NOW|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|IF|IFNULL|COALESCE|CAST|CONVERT|GROUP_CONCAT/i,
      type: "FUNCTION",
    },
    // 标识符合并（表名、字段名、字段别名）
    { regex: /`[a-zA-Z0-9_]+`|[a-zA-Z_][a-zA-Z0-9_]*/, type: "IDENTIFIER" },
    // 字符串常量
    { regex: /'([^'\\]*(\\.)?)*'|"([^"\\]*(\\.)?)*"/, type: "STRING" },
    // 日期时间
    { regex: /\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?/, type: "DATETIME" }, // 日期时间
    // 数字（整数和小数）
    { regex: /\d*\.\d+|\d+/, type: "NUMBER" }, // 小数和整数
    // 比较运算符
    { regex: /[=<>!]+/, type: "OPERATOR" }, // 比较运算符
    // 逻辑运算符
    { regex: /\|\||&&/, type: "LOGICAL_OPERATOR" }, // 逻辑运算符
    // 标点符号
    { regex: /[();,]/, type: "PUNCTUATION" }, // 标点符号
    // 算术运算符
    { regex: /[+*/-]/, type: "ARITHMETIC_OPERATOR" }, // 算术运算符
    // 括号
    { regex: /\[|\]|\{|\}/, type: "BRACKET" }, // 括号
    // 变量标识符
    { regex: /\$/, type: "VARIABLE" }, // 变量标识符
    // 数据库操作：查看、切换、删除
    {
      regex: /SHOW TABLES|SHOW COLUMNS|DESCRIBE|USE/i,
      type: "KEYWORD_SHOW_DATABASE",
    },
    // 表操作：创建、修改、删除
    {
      regex:
        /CREATE TABLE|ALTER TABLE|DROP TABLE|RENAME TABLE|TRUNCATE TABLE|DESCRIBE TABLE/i,
      type: "KEYWORD_TABLE_MANIPULATION",
    },
    // 数据操作：增、删、改、查
    {
      regex: /INSERT INTO|UPDATE|DELETE FROM|SELECT FROM/i,
      type: "KEYWORD_DATA_MANIPULATION",
    },
    // 表/字段别名
    { regex: /AS/i, type: "KEYWORD_ALIAS" },
    // 子查询标识符
    { regex: /\((?:[^()]*|\([^()]*\))*\)/, type: "SUBQUERY" },
    // 限制查询：LIMIT、OFFSET
    { regex: /LIMIT|OFFSET/, type: "KEYWORD_LIMIT_OFFSET" },
    // 连接查询：JOIN
    {
      regex: /JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|OUTER JOIN|ON/i,
      type: "KEYWORD_JOIN",
    },
    // 索引相关：创建、删除、修改索引
    {
      regex: /CREATE INDEX|DROP INDEX|ALTER INDEX|ADD INDEX/i,
      type: "KEYWORD_INDEX",
    },
  ];

  /**
   * 解析 SQL 语句
   */
  parse() {
    const ast = this.parseStatement();
    if (this.currentToken) {
      this.error(
        `Unexpected token found after statement: ${this.currentToken.type} - ${this.currentToken.value}`,
      );
    }
    return ast;
  }

  /**
   * 解析 SQL 语句的不同类型
   * 这里可以根据你的 SQL 语法来扩展
   */
  private parseStatement() {
    const HANDLERS = {
      // 数据操作语句
      DML: {
        keywords: ["SELECT", "INSERT", "UPDATE", "DELETE"],
        handler: () => this.parseQuery(),
      },
      // 数据定义语句
      DDL: {
        keywords: ["CREATE", "ALTER", "DROP", "TABLE", "DATABASE"],
        handler: () => this.parseDDL(),
      },
      // 数据库管理语句
      ADMIN: {
        keywords: ["USE", "SHOW"],
        handler: () => this.parseDatabaseOperation(),
      },
    };

    if (this.currentToken?.type === "KEYWORD") {
      const currentValue = this.currentToken.value.toUpperCase();

      for (const { keywords, handler } of Object.values(HANDLERS)) {
        if (keywords.includes(currentValue)) {
          return handler();
        }
      }

      this.error(`Unsupported statement: ${this.currentToken.value}`);
    }
    this.error(
      `Unexpected statement: ${this.currentToken?.type} - ${this.currentToken?.value}`,
    );
  }

  /**
   * 解析查询语句 (SELECT, INSERT, UPDATE, DELETE)
   */
  private parseQuery() {
    const ast: any = { type: "QUERY", queryType: this.currentToken?.value };
    this.expect("KEYWORD");

    switch (ast.queryType) {
      case "SELECT":
        this.parseSelect(ast);
        break;
      default:
        this.error(`Unsupported query type: ${ast.queryType}`);
    }

    // if (ast.queryType === "SELECT") {
    //   this.parseSelect(ast);
    // } else if (ast.queryType === "INSERT") {
    //   this.parseInsert(ast);
    // } else if (ast.queryType === "UPDATE") {
    //   this.parseUpdate(ast);
    // } else if (ast.queryType === "DELETE") {
    //   this.parseDelete(ast);
    // }

    return ast;
  }

  private parseSelect(ast: any) {
    // this.expect("KEYWORD", "SELECT");

    // ast.distinct = false;
    // if (this.currentToken?.value.toUpperCase() === "DISTINCT") {
    //   ast.distinct = true;
    //   this.expect("KEYWORD", "DISTINCT");
    // }

    ast.columns = this.parseColumns();
    this.expect("KEYWORD", "FROM");
    ast.table = this.parseTable();

    if (
      this.currentToken &&
      this.currentToken.value.toUpperCase() === "WHERE"
    ) {
      this.parseWhere(ast);
    }

    // 可以继续扩展更多的 SELECT 子句：GROUP BY, HAVING, ORDER BY, LIMIT 等
  }

  private parseColumns(): string[] {
    const columns: string[] = [];
    do {
      if (
        this.currentToken?.type === "IDENTIFIER" ||
        this.currentToken?.type === "STRING"
      ) {
        columns.push(this.currentToken?.value ?? "");
        this.currentToken = this.nextToken();
      }
      if (this.currentToken?.value === ",") {
        this.currentToken = this.nextToken();
      } else {
        break;
      }
    } while (this.currentToken);
    return columns;
  }

  private parseTable(): string {
    const tableName = this.currentToken?.value;
    this.expect("IDENTIFIER");
    return tableName ?? "";
  }

  private parseWhere(ast: any) {
    this.expect("KEYWORD", "WHERE");
    ast.condition = this.parseCondition();
  }

  private parseCondition(): any {
    // 这里可以根据具体的条件格式扩展，比如支持 AND, OR, LIKE, IN 等
    const condition: any = {};
    condition.left = this.currentToken?.value;
    this.expect("IDENTIFIER");

    condition.operator = this.currentToken?.value;
    this.expect("OPERATOR");

    condition.right = this.currentToken?.value;
    this.expect("NUMBER"); // 这里只是一个简单示例

    return condition;
  }

  /**
   * 解析 DDL 语句 (CREATE, ALTER, DROP 等)
   */
  private parseDDL() {
    const ast: any = { type: "DDL", action: this.currentToken?.value };
    this.expect("KEYWORD");

    if (ast.action === "CREATE") {
      this.parseCreate(ast);
    } else if (ast.action === "DROP") {
      this.parseDrop(ast);
    }

    return ast;
  }

  private parseCreate(ast: any) {
    this.expect("KEYWORD", "TABLE");
    ast.table = this.parseTable();
    ast.columns = this.parseColumnsDefinition();
  }

  private parseColumnsDefinition(): any[] {
    const columns: any[] = [];
    this.expect("PUNCTUATION", "(");

    while (
      this.currentToken &&
      this.currentToken.type !== "PUNCTUATION" &&
      this.currentToken.value !== ")"
    ) {
      const column: any = {
        name: this.currentToken?.value,
        type: this.parseColumnType(),
      };
      columns.push(column);
      this.currentToken = this.nextToken();

      if (this.currentToken?.value === ",") {
        this.currentToken = this.nextToken();
      }
    }
    this.expect("PUNCTUATION", ")");
    return columns;
  }

  private parseColumnType(): string {
    const type = this.currentToken?.value;
    this.expect("IDENTIFIER");
    return type ?? "";
  }

  private parseDrop(ast: any) {
    this.expect("KEYWORD", "TABLE");
    ast.table = this.parseTable();
  }

  /**
   * 解析数据库相关操作 (USE, SHOW 等)
   */
  private parseDatabaseOperation() {
    const ast: any = {
      type: "DATABASE_OPERATION",
      operation: this.currentToken?.value,
    };
    this.expect("KEYWORD");

    if (ast.operation === "USE") {
      ast.database = this.currentToken?.value;
      this.expect("IDENTIFIER");
    } else if (ast.operation === "SHOW") {
      ast.showType = this.currentToken?.value;
      this.expect("KEYWORD");
    }

    return ast;
  }
}

export default MySQLDriver;
