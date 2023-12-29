/* 
    Copyright (c) 2023, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from "./global.js";
onkeydown = (e) => {
    switch (e.key) {
        case 'Escape':
            global.call('escape');
            break
    }
}
