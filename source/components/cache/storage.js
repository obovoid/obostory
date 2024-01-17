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
    if (app_cache !== undefined) {
      ensureType(app_cache, 'object');
    } else {
      app_cache = {};
    }

    cache = app_cache;
    return sendAction('ready.cache');
}

function getSettingsCache() {
    return cache;
}

/**
 * Unfolds a nested object in the cache.
 * @param {string} pathToUnfold - The path to the nested object, represented as a dot-separated string.
 * @returns {any} The unfolded object.
 */
function safeUnfoldCache(pathToUnfold) {
  ensureType(pathToUnfold, 'string');

  const keys = pathToUnfold.split('.');
  if (keys.length <= 1) {
    throw new Error(`Unfolding not possible! The given path split is smaller or equals to 1. Paths are seperated by dots. "${pathToUnfold}" does not meet that standard.`)
  }

  const reduced = keys.reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, cache);
  return reduced || null
}

function getObjectProperty(obj, keys) {
    return keys.reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);
}
  
/**
 * Sets an object property at a given path.
 * @param {object} obj - The object to modify.
 * @param {string[]} keys - The path to the property, represented as an array of keys.
 * @param {any} value - The value to set at the property path.
 * @returns {boolean} Whether the property was successfully set.
 */
function setObjectProperty(obj, keys, value) {
  const lastKey = keys.pop();
  const parentObj = getObjectProperty(obj, keys);

  if (parentObj && typeof parentObj === 'object') {
    parentObj[lastKey] = value;
    return true;
  }

  return false;
}
  
/**
 * 
 * @param {string[]} readKeys - The path to the property, represented as an array of keys.
 * @param {any} [writeValue] - The value to set at the property path.
 * @returns {any} The value at the specified property path.
 */
function objectManipulate(readKeys, writeValue) {
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

/**
 * Updates a setting in the cache.
 * @param {string} updater - The setting key, e.g. "app.theme".
 * @param {any} [value] - The new value for the setting.
 * @returns {any} The new value of the setting.
 */
function updateSettingsCache(updater, value) {
    ensureType(updater, 'string');

    if (updater.startsWith('app.')) {
        // cached values do not have the app prefix and therefore we need to remove it from the updater.
        updater = updater.replace(/^(app\.)/, "");
    }

    const keys = updater.split(".")
    // basicly the same as setting an object property directly.
    // With this solution we can split the updater string into an array of keys, and update the object property with the help of each key.
    objectManipulate(keys, value);

    return value;
}

/**
 * Stores a key-value pair in the application cache.
 * @param {string} key - The key to store.
 * @param {any} value - The value to store.
 */
function storeKey(key, value) {
    ensureType(key, 'string');
    try {
        updateSettingsCache(key, value);
    } catch (e) {
        console.warn('automatic updating from settings cache has failed. This happens if the value was not existant beforehand. Restarting the Application will fix this issue.');
        window.API.requestRestart({once: true});
    }
    app(() => {
        window.API.setStorageKey(key, value);
    });
}

export { saveAppCache, getSettingsCache, safeUnfoldCache, updateSettingsCache, storeKey }