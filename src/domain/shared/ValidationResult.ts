export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationResult {
  public static success(): ValidationResult {
    return { isValid: true, errors: [] };
  }

  public static error(errorMessage: string): ValidationResult {
    return { isValid: false, errors: [errorMessage] };
  }

  public static fromErrors(errors: string[]): ValidationResult {
    return { isValid: errors.length === 0, errors };
  }

  public static merge(results: ValidationResult[]): ValidationResult {
    const isValid = results.every((result) => result.isValid);
    const errors = results.flatMap((result) => result.errors);
    return { isValid, errors };
  }
}
