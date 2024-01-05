/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { ensureType } from "../types/main.js";
import {app} from '../../renderer.js'

let cache;

function saveAppCache(app_cache) {
    ensureType(app_cache, 'object');
    cache = app_cache;
}

function getSettingsCache() {
    return cache;
}

function updateSettingsCache(updater, value) {
    ensureType(updater, 'string');
    cache[updater] = value;
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