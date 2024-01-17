/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { getGlobal, setGlobal, createGlobal, globalExists } from "../cache/globals.js";
import { sendAction, onAction } from "../../renderer.js";
import { render, release } from "../../scripts/settings.js";
import { safeUnfoldCache } from "../cache/storage.js";

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

const hideCategories = () => {
    const hidden_class = "glyphicon glyphicon-chevron-down glyph-category"
    const visible_class = "glyphicon glyphicon-chevron-up glyph-category"

    document.querySelectorAll('[data-collapse]').forEach(el => {
        const collapse_element = el.dataset.collapse

        el.childNodes.forEach(node => {
            if (node.dataset?.glyphtoggle) {

                node.classList = hidden_class
                node.dataset.glyphtoggle = visible_class
            }
        });

        document.querySelectorAll(collapse_element).forEach(tocollapse => {
            tocollapse.style.display = "none"
        });
    });
}

document.querySelectorAll('[data-collapse]').forEach(el => {
    const collapse_element = el.dataset.collapse
    el.addEventListener('click', () => {

        el.childNodes.forEach(node => {
            if (node.dataset?.glyphtoggle) {
                const current_class = String(node.classList)
                const new_class = node.dataset.glyphtoggle

                node.classList = new_class
                node.dataset.glyphtoggle = current_class
            }
        });

        document.querySelectorAll(collapse_element).forEach(tocollapse => {
            const new_visibility = tocollapse.style.display == "none" ? 'block' : 'none'
            tocollapse.style.display = new_visibility
        });
    });
});

/**
 * initializes the settings page
 */
async function init() {
  /**
   * waits for the onAction function to be ready
   */
  await onAction;

  /**
   * listens for individual actions
   */
  onAction((actionName) => {
    switch (actionName) {
      case 'open.settings':
        render();
        {
          /**
           * if the autoCollapseActive setting is true,
           * collapses all the categories on the settings page
           */
          if (safeUnfoldCache("settings.autoCollapseActive") === true) {
            hideCategories();
          }
        }
        return true;
      case 'close.settings':
        // unloads the settings page
        return release();
    }
  });
}
init();

export { openSettings, unloadSettings }