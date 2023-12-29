/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from "../../scripts/global.js"

function onGlobalReady(callback) {
    const attempt_limit = 100;
    let attempt = 1
    function _() {
        try {
            if (global) {
                callback();
            }
        } catch (e) {
            setTimeout(() => {
                attempt++
                if (attempt >= attempt_limit) throw new Error(`Attempt Limit reached. Global object is not reachable!`)
                return _();
            }, 10)
        }
    }
    _();
}

export { onGlobalReady }