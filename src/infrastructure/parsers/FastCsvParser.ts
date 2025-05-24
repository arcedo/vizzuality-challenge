import fs from "fs";
import { parse } from "@fast-csv/parse";
import { CsvParser } from "../../application/ports/CsvParser";

export class FastCsvParser<T> implements CsvParser<T> {
  public async parse(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on("data", (row) => {
          results.push(row as T);
        })
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }
}
