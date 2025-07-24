// src/utils/errors.ts
export class ValidationError extends Error {
    constructor(public errors: Record<string, string | null>) {
      super("Validation failed");
      this.name = "ValidationError";
    }
  }