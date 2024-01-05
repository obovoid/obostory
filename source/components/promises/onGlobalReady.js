/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from "../../scripts/global.js"

function onGlobalReady(callback) {
    const attempt_limit = 100;
    let attempt = 1
    async function _() {
        try {
            if (global) {
                callback();
            }
        } catch (e) {
            setTimeout(() => {
                attempt++
                if (attempt >= attempt_limit) {
                    console.warn(`Attempt Limit reached. Global object is not reachable! App continues until next error.`)
                    // we still continue, as otherwise errors can't be produced.
                    // global only ever was unreachable for me whenever an error has been produced somewhere.
                    callback();
                    return
                }
                return requestAnimationFrame(_);
            }, 10)
        }
    }
    _();
}

export { onGlobalReady }