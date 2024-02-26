/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { ensureType } from './ensureType';
import { app, sendAction } from '../startup';

const savedSettings: settingsObjectType = {}; 

function saveUserSettings(parsedJSONData: GeneralValidJSON): sendActionSelector { 
    if (!!parsedJSONData) { 
        ensureType(parsedJSONData, 'object');
    }
    Object.assign(savedSettings, parsedJSONData);

    return sendAction('ready.cache', [savedSettings]);
}

function loadUserSettings(): settingsObjectType {
    return savedSettings;
}

/**
 * Unfolds a nested object in the cache.
 * @param {string} pathToUnfold - The path to the nested object, represented as a dot-separated string.
 * @returns { object | null } The unfolded object or null if not existant to entered path.
 */
function safeUnfoldCache(pathToUnfold: string) {
    ensureType(pathToUnfold, 'string');

    const keys = pathToUnfold.split('.');
    if (keys.length <= 1) {
      throw new Error(`Unfolding not possible! The given path split is smaller or equals to 1. Paths are seperated by dots. "${pathToUnfold}" does not meet that standard.`)
    }
  
    const reduced = keys.reduce((acc, key): GeneralType => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, savedSettings);
    return reduced
}

function getObjectProperty(obj: Record<string, string>, keys: string[]) {
    return keys.reduce((acc, key): GeneralType => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);
}

/**
 * Sets an object property at a given path.
 * @param {object} obj - The object to modify.
 * @param {string[]} keys - The path to the property, represented as an array of keys.
 * @param {any} value - The value to set at the property path.
 * @returns {boolean} Whether the property was successfully set.
 */
function setObjectProperty(obj: settingsObjectType, keys: string[], value: GeneralType): boolean {
    const lastKey = keys.pop();
    // No way for me to get the types to work in my favor.
    // Won't fix, unless someone else wants to do it.
    const parentObj: any = getObjectProperty(obj, keys);
  
    if (parentObj) {
        if (parentObj.hasOwnProperty(lastKey) && typeof lastKey === "string") {
            parentObj[lastKey] = value;
            return true;
        }
    }
  
    return false;
}

/**
 * 
 * @param {string[]} readKeys - The path to the property, represented as an array of keys.
 * @param {any} [writeValue] - The value to set at the property path.
 * @returns {any} The value at the specified property path.
 */
function objectManipulate(readKeys: string[], writeValue : GeneralType) {
    if (!Array.isArray(readKeys) || readKeys.some(key => typeof key !== 'string')) {
      throw new Error('readKeys argument must be an array of strings.');
    }
  
    const accessedValue = getObjectProperty(savedSettings, readKeys);
  
    if (typeof writeValue === 'undefined') {
      return accessedValue;
    } else {
      if (setObjectProperty(savedSettings, readKeys, writeValue)) {
        console.log(savedSettings);
        return savedSettings;
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
function updateSettingsCache(updater: string, value: GeneralType) {
    ensureType(updater, 'string');
    console.log(updater, value);

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
function storeKey(key: string, value: GeneralType, storagePoint: StoragePoint = "general"): sendActionSelector {
    ensureType(key, 'string');
    try {
        // deepcode ignore MissingArgument: False positive
        updateSettingsCache(key, value);
    } catch (e) {
        console.warn('automatic updating from settings cache has failed. This happens if the value was not existant beforehand. Restarting the Application will fix this issue.');
        window.API.requestRestart({once: true});
    }
    app(() => {
        window.API.setStorageKey(key, value, storagePoint);
    });

    return sendAction(`new.key.stored.${key}`);
}

export { saveUserSettings, loadUserSettings, safeUnfoldCache, updateSettingsCache, storeKey }