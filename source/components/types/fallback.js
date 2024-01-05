/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

function fallback(value, fallback) {
    if (value == null) return fallback
    if (value == undefined) return fallback
    return value;
}

export { fallback } 