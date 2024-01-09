/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from "./global.js";
/**
 * Event listener for keydown events
 * @param {KeyboardEvent} e - keyboard event object
 */
onkeydown = (e) => {
    /**
     * switch statement that handles key presses
     * @param {string} key - key pressed
     */
    switch (e.key) {
        /**
         * case statement for the Escape key
         * @param {string} 'Escape' - key value for the Escape key
         */
        case 'Escape':
            /**
             * calls the escape function in the global object
             * @param {function} global.call - function to call in the global object
             * @param {string} 'escape' - name of the escape function in the global object
             */
            global.call('escape');
            break
    }
}