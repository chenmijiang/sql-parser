export type DriverName = "mysql";

export interface ITokenDefinition {
  regex: RegExp;
  type: string | null;
}

export type Token = {
  type: string;
  value: string;
} | null;
