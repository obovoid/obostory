/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { ensureType } from "../types/main.js";
let globals = {}

/**
 * Creates a new global variable in the globals cache.
 * @param {string} id - The id of the global variable.
 * @param {any} value - The value of the global variable.
 * @returns {any} The value of the global variable.
 * @throws {Error} If the global variable already exists.
 */
// when to use? If you need a local global variable, that you do not need after restarting the app.
function createGlobal(id, value) {
  ensureType(id, "string");

  if (globals[id]) {
    throw new Error(`Unable to cache "${id}", as it already exists. Cache values need to be unique, if you are unsure if a cache value exist, then test it with globalExists(key: String).`);
  }
  globals[id] = value;
  return value;
}

/**
 * Deletes a global variable from the cache.
 * @param {string} id - The id of the global variable.
 * @returns {null}
 */
function deleteGlobal(id) {
    ensureType(id, 'string');

    if (globals[id]) {
        delete globals[id];
    } else {
        console.warn(`Unable to delete "${id}" from the cache. If you are unsure if your cached value exists, then test it with globalExists(id: String)`);
    }
    return null;
}

/**
 * Checks if a global variable exists in the cache.
 * @param {string} id - The id of the global variable.
 * @returns {boolean} Whether or not the global variable exists in the cache.
 */
function globalExists(id) {
    ensureType(id, 'string');

    return !!globals[id];
}

/**
 * Returns the value of a global variable from the cache.
 * @param {string} id - The id of the global variable.
 * @returns {any} The value of the global variable.
 */
function getGlobal(id) {
  ensureType(id, 'string');

  return globals[id];
}

/**
 * Sets a global variable in the cache.
 * @param {string} id - The id of the global variable.
 * @param {any} value - The value of the global variable.
 * @returns {any} The value of the global variable.
 * @throws {Error} If the global variable does not exist and cannot be created.
 */
function setGlobal(id, value) {
    ensureType(id, 'string');

    if (!globals[id]) throw new Error(`Cannot set value to non existant cache value ${id}. You must create your cache value before setting its value with createGlobal(id: String, value: Any)`);
    globals[id] = value
    return value
}

export { globals, createGlobal, deleteGlobal, globalExists, getGlobal, setGlobal }