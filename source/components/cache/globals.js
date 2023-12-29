/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { ensureType } from "../types/main.js";
let globals = {}

function createGlobal(id, value) {
    ensureType(id, 'string');

    if (globals[id]) throw new Error(`Unable to cache "${id}", as it already exists. Cache values need to be unique, if you are unsure if a cache value exist, then test it with globalExists(key: String).`);
    globals[id] = value
    return value
}

function deleteGlobal(id) {
    ensureType(id, 'string');

    if (globals[id]) {
        delete globals[id]
    } else {
        console.warn(`Unable to delete "${id}" from the cache. If you are unsure if your cached value exists, then test it with globalExists(id: String)`);
    }
    return null
}

function globalExists(id) {
    ensureType(id, 'string');

    return !!globals[id]
}

function getGlobal(id) {
    ensureType(id, 'string');

    return globals[id]
}

function setGlobal(id, value) {
    ensureType(id, 'string');

    if (!globals[id]) throw new Error(`Cannot set value to non existant cache value ${id}. You must create your cache value before setting its value with createGlobal(id: String, value: Any)`);
    globals[id] = value
    return value
}

export { globals, createGlobal, deleteGlobal, globalExists, getGlobal, setGlobal }