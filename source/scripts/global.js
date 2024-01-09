/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { language } from "../translations/language.js"
import { getGlobal, setGlobal } from "../components/cache/globals.js"
import { getSettingsCache } from "../components/cache/storage.js"

const global = {}
global._eventHolder = {}

global.listen = (eventName, func) => {
    if (typeof eventName !== 'string') throw new Error(`Argument 0 needs to be of type string[eventName] and not ${typeof name}`)
    if (typeof func !== 'function') throw new Error(`Argument 1 needs to be of type function[callback] and not ${typeof func}`)
    
    if (!global._eventHolder[eventName]) {
        global._eventHolder[eventName] = []
    }
    
    global._eventHolder[eventName].push(func);
}

global.call = (eventName, argumentList) => {
    if (!global._eventHolder[eventName]) return;
	global._eventHolder[eventName].forEach(func => {
        func(argumentList);
    });
}

global._setSettingsActive = (boolean) => {
    setGlobal('settingsPageActive', boolean);
}

global.areSettingsActive = () => {
    return getGlobal('settingsPageActive')
}

global.translate = (translation_id) => {
    let default_language = getSettingsCache().general.language || navigator.language.replace('-', '_');
    if (!language[default_language]) {
        default_language = 'en_US'
    }

    return language[default_language][translation_id] || `translation missing {${translation_id}}`
}

export { global }