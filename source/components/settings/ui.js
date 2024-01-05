/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { getGlobal, setGlobal, createGlobal, globalExists } from "../cache/globals.js";
import { sendAction, onAction } from "../../renderer.js";
import { render, release } from "../../scripts/settings.js";

createGlobal('settingsPageActive', false);

const openSettings = () => {
    let currentPage = getGlobal('activePage');
    $(`.${currentPage}`).fadeOut(150);
    $('.container-settings').css({display: 'block'})
    $('.container-settings').animate({left: "50%", opacity: 1});
    setGlobal('activePage', 'container-settings');
    sendAction('open.settings');

    if (!globalExists('settingsPageActive')) {
        createGlobal('settingsPageActive', true)
    } else {
        setGlobal('settingsPageActive', true)
    }
}

const unloadSettings = () => {
    $('.container-settings').animate({left: "150%", opacity: 0});
    setGlobal('settingsPageActive', false)
    sendAction('close.settings');
}

async function init() {
    await onAction;
    onAction((actionName) => {
        if (actionName === 'open.settings') {
            render();
        } else if (actionName === 'close.settings') {
            release();
        }
    })
}
init();

export { openSettings, unloadSettings }