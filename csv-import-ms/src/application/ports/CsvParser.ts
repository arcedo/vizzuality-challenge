export interface CsvParser<T> {
  parse(filePath: string): Promise<T[]>;
}
