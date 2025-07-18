/**
 * Union type representing values that can be safely converted to strings.
 * 
 * This type includes primitive values and common objects that have meaningful
 * string representations when converted using String() or template literals.
 */
export type Printable = string | number | boolean | Date | null | undefined;

/**
 * Utility class providing type guard functions for runtime type checking.
 * 
 * This class contains static methods that perform runtime type checking
 * and provide TypeScript type narrowing capabilities.
 */
export class is {

  /**
   * Checks if a value can be safely coerced to a string.
   * 
   * This type guard determines whether a value can be converted to a string
   * using String() constructor or template literals without throwing errors
   * or producing unexpected results.
   * 
   * @param data - The value to check for string convertibility
   * @returns True if the value can be safely converted to a string, false otherwise
   * 
   * @example
   * ```typescript
   * if (is.printable(someValue)) {
   *   // TypeScript now knows someValue is Printable
   *   const str = String(someValue); // Safe to do this
   * }
   * 
   * // Examples of printable values:
   * is.printable("hello"); // true
   * is.printable(123); // true
   * is.printable(true); // true
   * is.printable(new Date()); // true
   * is.printable(null); // true
   * is.printable(undefined); // true
   * 
   * // Examples of non-printable values:
   * is.printable({}); // false
   * is.printable([]); // false
   * is.printable(() => {}); // false
   * ```
   */
  static printable(data: any): data is Printable {
    switch (typeof data) {
      case 'undefined': // can be `${undefined}`
      case 'bigint': // can be `${BigInt(123)}`
      case 'string':
      case 'number':
      case 'boolean':
        return true;

      case 'object':
        // known object that are printable
        if (data instanceof Date) {
          return true;
        }
        if (data instanceof RegExp) {
          return true;
        }
        if (data instanceof Error) {
          return true;
        }
    }
    return false;
  }

  /**
   * Checks if a value is a template strings array.
   * 
   * Template strings arrays are special arrays that contain the string parts
   * of a template literal, along with a `raw` property containing the raw
   * (unescaped) versions of those strings.
   * 
   * @param data - The value to check
   * @returns True if the value is a template strings array, false otherwise
   * 
   * @example
   * ```typescript
   * function tag(strings: TemplateStringsArray, ...values: any[]) {
   *   if (is.templateStringsArray(strings)) {
   *     // TypeScript now knows strings is TemplateStringsArray
   *     console.log(strings.raw); // Access raw strings
   *   }
   * }
   * ```
   */
  static templateStringsArray(data: any): data is TemplateStringsArray {
    return Array.isArray(data) && data.length > 0 && typeof data[0] === 'string' && 'raw' in data;
  }
}
