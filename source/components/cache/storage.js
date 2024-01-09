/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { ensureType } from "../types/main.js";
import { app, sendAction } from '../../renderer.js'

let cache;

function saveAppCache(app_cache) {
    ensureType(app_cache, 'object');
    cache = app_cache;
    return sendAction('ready.cache');
}

function getSettingsCache() {
    return cache;
}

function getObjectProperty(obj, keys) {
    return keys.reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);
}
  
function setObjectProperty(obj, keys, value) {
    const lastKey = keys.pop();
    const parentObj = getObjectProperty(obj, keys);

    if (parentObj && typeof parentObj === 'object') {
        parentObj[lastKey] = value;
        return true;
    }

    return false;
}
  
function objectManipulate(readKeys, writeValue = undefined) {
    if (!Array.isArray(readKeys) || readKeys.some(key => typeof key !== 'string')) {
        throw new Error('readKeys argument must be an array of strings.');
    }

    const accessedValue = getObjectProperty(cache, readKeys);

    if (typeof writeValue === 'undefined') {
        return accessedValue;
    } else {
        if (setObjectProperty(cache, readKeys, writeValue)) {
            return cache;
        } else {
            throw new Error('Failed to set object property. Make sure the specified keys are valid.');
        }
    }
}

function updateSettingsCache(updater, value) {
    ensureType(updater, 'string');

    if (updater.startsWith('app.')) {
        updater = updater.replace(/^(app\.)/, "");
    }

    const keys = updater.split(".")
    objectManipulate(keys, value);

    return value;
}

function storeKey(key, value) {
    ensureType(key, 'string');
    try {
        updateSettingsCache(key, value);
    } catch (e) {
        console.warn('automatic updating from settings cache has failed. This happens if the value was not existant beforehand.')
    }
    app(() => {
        window.API.setStorageKey(key, value);
    })
}

export { saveAppCache, getSettingsCache, updateSettingsCache, storeKey }