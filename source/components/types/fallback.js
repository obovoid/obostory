/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

/**
 * Returns the fallback value if the value is null or undefined.
 * @param {any} value - The value to check.
 * @param {any} fallback - The value to return if the value is null or undefined.
 * @returns {any} The fallback value.
 */
function fallback(value, fallback) {
  if (value === null) {
    return fallback;
  }
  if (value === undefined) {
    return fallback;
  }
  return value;
}

export { fallback } 