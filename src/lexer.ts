/**
 * 词法分析器
 */
class Lexer {
  private sql: string;
  private position: number;
  private tokenDefinitions: { regex: RegExp; type: string | null }[];

  constructor(sql: string) {
    this.sql = sql;
    this.position = 0;
    this.tokenDefinitions = [
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
  }

  nextToken() {
    while (this.position < this.sql.length) {
      for (let { regex, type } of this.tokenDefinitions) {
        regex.lastIndex = 0; // Reset lastIndex
        const match = this.sql
          .slice(this.position)
          .match(new RegExp(`^${regex.source}`, regex.flags));
        if (match) {
          const value = match[0];
          this.position += value.length;
          if (type) {
            return { type, value };
          }
          // 如果是空格，则继续下一个 token
          break;
        }
      }
    }

    if (this.position >= this.sql.length) {
      return null; // EOF
    }

    throw new SyntaxError(
      `Illegal character "${this.sql[this.position]}" at position ${this.position}`,
    );
  }
}

export default Lexer;
