import chalk from "chalk";
import { logger } from "./logger.js";

/**
 * Used with assert statements (See common.ts)
 */
export class AssertionError extends Error {
  constructor(msg = "Assertion failed") {
    super(msg);
  }
}

export class NoRepoError extends Error {}

/**
 * Something is `null` or `undefined` when we don't expect it
 */
export class NullOrUndefinedValueError extends Error {}

/**
 * Some value is out of an expected bound
 */
export class OutOfBoundsError extends Error {}

/**
 * Data is malformed
 */
export class InvalidDataError extends Error {}

/**
 * Invalid inputs to a function
 */
export class InvalidInputError extends Error {}

/**
 * Data is malformed
 */
export class MalformedDataError extends Error {}

/**
 * Represents an error that doesn't need to be forwarded to Sentry.
 * These are usually errors that are the user's fault
 */
export class HandledError extends Error {}

/**
 * Catches HandledErrors and just exits
 * Forwards all other errors along.
 * @param p
 * @returns
 */
export const handleError = <T>(p: Promise<T>) => {
  return p.catch((e) => {
    if (e.message) {
      logger.error(chalk.bold(chalk.redBright("\nError: ")) + e.message);
    }
    if (e instanceof HandledError) {
      process.exit(1);
    } else {
      throw e;
    }
  });
};
