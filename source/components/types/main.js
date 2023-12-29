/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

function getType(value) {
    let type = Object.prototype.toString.call(value).split(' ')[1].replace(']', '').toLowerCase();
    switch(type) {
        case 'function':
            // This may be a poor implementation but since JS does not differ between Classes and Function the only option for now.
                const isClass = /^\s*class\s+/.test(value.toString());
                isClass ? type = "class" : type = "function"
            break
    }

    return type
}

function ensureType(value, expectedType) {
    if (getType(value) !== expectedType) throw new Error(`Type Error. Expected ${expectedType}, but instead received "${getType(value)}".`);
    return true
}

export { getType, ensureType }