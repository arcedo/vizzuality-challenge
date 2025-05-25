import fs from "fs";
import { parse } from "@fast-csv/parse";
import { CsvParser } from "../../application/ports/CsvParser";
import { CsvParseError } from "../../domain/errors/CsvParseError";

export class FastCsvParser<T> implements CsvParser<T> {
  public async parse(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];

      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on("data", (row) => {
          results.push(row as T);
        })
        .on("end", () => {
          if (results.length === 0) {
            reject(
              new CsvParseError("CSV file is empty or has invalid headers."),
            );
          } else {
            resolve(results);
          }
        })
        .on("error", (err) => {
          reject(new CsvParseError("Failed to parse CSV: " + err.message));
        });
    });
  }
}
