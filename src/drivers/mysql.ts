import { Driver } from "./driver";

const TOKEN_TYPES = {
  KEYWORD: "KEYWORD",
  IDENTIFIER: "IDENTIFIER",
  STRING: "STRING",
  DATETIME: "DATETIME",
  NUMBER: "NUMBER",
  OPERATOR: "OPERATOR",
  LOGICAL_OPERATOR: "LOGICAL_OPERATOR",
  PUNCTUATION: "PUNCTUATION",
  ARITHMETIC_OPERATOR: "ARITHMETIC_OPERATOR",
  BRACKET: "BRACKET",
  VARIABLE: "VARIABLE",
  KEYWORD_SHOW_DATABASE: "KEYWORD_SHOW_DATABASE",
  KEYWORD_TABLE_MANIPULATION: "KEYWORD_TABLE_MANIPULATION",
  KEYWORD_DATA_MANIPULATION: "KEYWORD_DATA_MANIPULATION",
  KEYWORD_ALIAS: "KEYWORD_ALIAS",
  KEYWORD_LIMIT_OFFSET: "KEYWORD_LIMIT_OFFSET",
  KEYWORD_JOIN: "KEYWORD_JOIN",
  KEYWORD_INDEX: "KEYWORD_INDEX",
  SUBQUERY: "SUBQUERY",
  COMMENT: "COMMENT",
  ERROR: "ERROR",
};

const TOKENS = [
  { regex: /\s+/, type: null }, // 忽略空格
  // 关键字和操作符合并
  {
    regex:
      /CREATE|DROP|ALTER|DATABASE|SCHEMA|USE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|START TRANSACTION|SHOW|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|INSERT|UPDATE|DELETE|REPLACE|TRUNCATE|MERGE|SELECT|FROM|WHERE|HAVING|GROUP BY|ORDER BY|LIMIT|OFFSET|UNION|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|ON|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|IFNULL|COALESCE|CAST|CONVERT|IS|EXISTS|BETWEEN|IN|NOT|LIKE|ALL|ANY|COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|DATE_FORMAT|DATE_ADD|DATE_SUB|NOW|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|GROUP_CONCAT|IF|SELECT DATABASE|SELECT SCHEMA/i,
    type: TOKEN_TYPES.KEYWORD,
  },
  // 函数合并
  {
    regex:
      /COUNT|SUM|AVG|MIN|MAX|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|DATE_FORMAT|DATE_ADD|DATE_SUB|NOW|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|IF|IFNULL|COALESCE|CAST|CONVERT|GROUP_CONCAT/i,
    type: TOKEN_TYPES.KEYWORD,
  },
  // 标识符合并（表名、字段名、字段别名）
  {
    regex: /`[a-zA-Z0-9_]+`|[a-zA-Z_][a-zA-Z0-9_]*/,
    type: TOKEN_TYPES.IDENTIFIER,
  },
  // 字符串常量
  { regex: /'([^'\\]*(\\.)?)*'|"([^"\\]*(\\.)?)*"/, type: TOKEN_TYPES.STRING },
  // 日期时间
  {
    regex: /\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?/,
    type: TOKEN_TYPES.DATETIME,
  }, // 日期时间
  // 数字（整数和小数）
  { regex: /\d*\.\d+|\d+/, type: TOKEN_TYPES.NUMBER }, // 小数和整数
  // 比较运算符
  { regex: /[=<>!]+/, type: TOKEN_TYPES.OPERATOR }, // 比较运算符
  // 逻辑运算符
  { regex: /\|\||&&/, type: TOKEN_TYPES.LOGICAL_OPERATOR }, // 逻辑运算符
  // 标点符号
  { regex: /[();,]/, type: TOKEN_TYPES.PUNCTUATION }, // 标点符号
  // 算术运算符
  { regex: /[+*/-]/, type: TOKEN_TYPES.ARITHMETIC_OPERATOR }, // 算术运算符
  // 括号
  { regex: /\[|\]|\{|\}/, type: TOKEN_TYPES.BRACKET }, // 括号
  // 变量标识符
  { regex: /\$/, type: TOKEN_TYPES.VARIABLE }, // 变量标识符
  // 数据库操作：查看、切换、删除
  {
    regex: /SHOW TABLES|SHOW COLUMNS|DESCRIBE|USE/i,
    type: TOKEN_TYPES.KEYWORD_SHOW_DATABASE,
  },
  // 表操作：创建、修改、删除
  {
    regex:
      /CREATE TABLE|ALTER TABLE|DROP TABLE|RENAME TABLE|TRUNCATE TABLE|DESCRIBE TABLE/i,
    type: TOKEN_TYPES.KEYWORD_TABLE_MANIPULATION,
  },
  // 数据操作：增、删、改、查
  {
    regex: /INSERT INTO|UPDATE|DELETE FROM|SELECT FROM/i,
    type: TOKEN_TYPES.KEYWORD_DATA_MANIPULATION,
  },
  // 表/字段别名
  { regex: /AS/i, type: TOKEN_TYPES.KEYWORD_ALIAS },
  // 子查询标识符
  { regex: /\((?:[^()]*|\([^()]*\))*\)/, type: TOKEN_TYPES.SUBQUERY },
  // 限制查询：LIMIT、OFFSET
  { regex: /LIMIT|OFFSET/, type: TOKEN_TYPES.KEYWORD_LIMIT_OFFSET },
  // 连接查询：JOIN
  {
    regex: /JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|CROSS JOIN|OUTER JOIN|ON/i,
    type: TOKEN_TYPES.KEYWORD_JOIN,
  },
  // 索引相关：创建、删除、修改索引
  {
    regex: /CREATE INDEX|DROP INDEX|ALTER INDEX|ADD INDEX/i,
    type: TOKEN_TYPES.KEYWORD_INDEX,
  },
];

const STATEMENT_TYPES = {
  DML: "DML",
  DDL: "DDL",
  ADMIN: "ADMIN",
};

class MySQLDriver extends Driver {
  constructor() {
    super();
  }

  tokens = TOKENS;

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
   */
  private parseStatement() {
    const HANDLERS = {
      // 数据操作语句
      [STATEMENT_TYPES.DML]: {
        keywords: ["SELECT", "INSERT", "UPDATE", "DELETE"],
        handler: (ast: any) => this.parseDML(ast),
      },
      // 数据定义语句
      [STATEMENT_TYPES.DDL]: {
        keywords: ["CREATE", "ALTER", "DROP", "TABLE", "DATABASE"],
        handler: (ast: any) => this.parseDDL(ast),
      },
      // 数据库管理语句
      [STATEMENT_TYPES.ADMIN]: {
        keywords: ["USE", "SHOW"],
        handler: (ast: any) => this.parseDatabaseOperation(ast),
      },
    };

    if (this.currentToken?.type === TOKEN_TYPES.KEYWORD) {
      const upperValue = this.currentToken.upperValue;

      for (const [type, { keywords, handler }] of Object.entries(HANDLERS)) {
        if (keywords.includes(upperValue)) {
          let ast = {
            driver: "mysql",
            statementType: type,
            operationType: upperValue,
            body: {},
          };
          handler(ast);
          return ast;
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
  private parseDML(ast: any) {
    const HANDLERS: Record<string, (ast: any) => void> = {
      SELECT: this.parseSelect,
      INSERT: this.parseInsert,
      UPDATE: this.parseUpdate,
      DELETE: this.parseDelete,
    };

    if (HANDLERS[ast.operationType]) {
      HANDLERS[ast.operationType](ast);
    } else {
      this.error(`Unsupported query type: ${ast.operationType}`);
    }
  }

  private parseSelect(ast: any) {
    // 
  }

  private parseInsert(ast: any) {}

  private parseUpdate(ast: any) {}

  private parseDelete(ast: any) {}

  /**
   * 解析 DDL 语句 (CREATE, ALTER, DROP 等)
   */
  private parseDDL(ast: any) {}

  /**
   * 解析数据库相关操作 (USE, SHOW 等)
   */
  private parseDatabaseOperation(ast: any) {}
}

export default MySQLDriver;
