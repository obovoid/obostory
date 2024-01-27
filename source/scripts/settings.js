/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

import { global } from "./global.js";
import { onGlobalReady } from "../components/promises/onGlobalReady.js";
import { unloadSettings } from "../components/settings/ui.js";
import { loadNewPage } from "../renderer.js";
import { getSettingsCache, storeKey } from "../components/cache/storage.js";
import { fallback } from "../components/types/fallback.js";
import { ensureType } from "../components/types/main.js";

const types = ["switch", "selection"];
// category names will be renamed soon
const categories = ["general", "timeline", "profiles", "fonts"];

let elements = categories.reduce((acc, category) => {
  acc[category] = [];
  return acc;
}, {});

function searchSettings() {
  const searchInput = document
    .querySelector(".settings-searchbar")
    .value.toLowerCase();

  if (searchInput.trim() === "") {
    const allSettingBoxes = document.querySelectorAll(".setting-box");
    allSettingBoxes.forEach((box) => {
      box.classList.remove("hidden");
    });
    return;
  }

  categories.forEach((category) => {
    const categoryBoxes = document.querySelectorAll(
      `[data-settings-category="${category}"] .setting-box`
    );

    categoryBoxes.forEach((box) => {
      const title = box
        .querySelector(".settings-title-text")
        .innerText.toLowerCase();
      const description = box
        .querySelector(".settings-descriptions-text")
        .innerText.toLowerCase();

      if (title.includes(searchInput) || description.includes(searchInput)) {
        box.classList.remove("hidden");
      } else {
        box.classList.add("hidden");
      }
    });
  });
}

document
  .querySelector(".settings-searchbar")
  .addEventListener("input", searchSettings);

function storeAlphabeticElement(object, category) {
  ensureType(object, "object");
  ensureType(category, "string");

  if (!categories.includes(category))
    throw new Error(
      `The category ${category} does not exist. Please change to a valid category ${String(
        categories
      )}`
    );

  if (elements[category].length === 0) {
    elements[category].push(object);
    return true;
  }

  elements[category].push(object);
  elements[category].sort((a, b) => a.title.localeCompare(b.title));

  return true;
}

/**
 * @param {switch | selection} setting_type
 */
class Setting {
  constructor(setting_type) {
    if (!types.includes(setting_type)) {
      throw new Error(
        `Your type does not match any of the possible types. Please choose any of the following: ${JSON.stringify(
          types
        )}`
      );
    }

    this.type = setting_type;
    this.category = "general";
    this.title = "[title is missing]";
    this.description = "[description is missing]";
    this.isChecked = null;
    this.options = null;
    this.restartRequired = false;
    this.selectionElement = null;
  }
  /**
   * @param {string} categoryName
   */
  setCategory(categoryName) {
    ensureType(categoryName, "string");
    if (!categories.includes(categoryName)) {
      throw new Error(
        `Your category name does not match any of the possible categories. Please choose any of the following: ${JSON.stringify(
          categories
        )}`
      );
    }
    this.category = categoryName;
  }
  /**
   * @param {string} optionTitle
   */
  setTitle(optionTitle) {
    ensureType(optionTitle, "string");
    if (optionTitle.length < 4)
      throw new Error(
        "Your title does not match the required length. Your title needs to be 4 characters or longer."
      );

    this.title = optionTitle;
  }
  /**
   * @param {string} optionDescription
   */
  setDescription(optionDescription) {
    ensureType(optionDescription, "string");
    if (optionDescription.length < 11)
      throw new Error(
        "Your description does not match the required length. Your description needs to be 11 characters or longer."
      );

    this.description = optionDescription;
  }
  /**
   * @param {true | false} boolean
   */
  setSwitchIsChecked(boolean) {
    ensureType(boolean, "boolean");
    this.isChecked = Boolean(boolean);
  }
  /**
   * @param {string[]} array
   */
  setOptions(array) {
    ensureType(array, "array");
    if (this.type == "switch")
      throw new Error(
        `Unable to set options on the selected setting type "${this.type}"`
      );
    if (!(array instanceof Array)) {
      throw new Error(
        `Your argument does not match the type of array! ${typeof array}`
      );
    }
    array.forEach((string, index) => {
      if (string.length > 17)
        throw new Error(
          `Your option at index ${index} is too long. Max Character limit is 18. Your length: ${string.length}`
        );
    });
    this.options = array;
  }
  setRestartRequired(bool) {
    ensureType(bool, "boolean");
    this.restartRequired = true;
  }
  selectionSetValue(value) {
    ensureType(value, "string");
    if (!this.selectionElement)
      throw new Error(
        "Before Changing the selection value, you need to create it first!"
      );
    this.selectionElement.value = value;
  }
  createAndResult(cb) {
    if (typeof cb !== "function")
      throw new Error(`Expected a callback function to listen for changes.`);

    switch (this.type) {
      case "switch":
        {
          const container = document.createElement("div");
          container.className = "setting-box";

          const title = document.createElement("p");
          title.className = "settings-title-text";
          title.innerText = this.title;

          const breakline = document.createElement("div");
          breakline.className = "breakline";

          const description = document.createElement("p");
          description.className = "settings-descriptions-text";
          description.innerText = this.description;

          let footer;
          if (this.restartRequired) {
            footer = document.createElement("footer");
            footer.className = "settings-footer";
            const small_content = document.createElement("small");
            small_content.innerText = global.translate(
              "settings.general.restartRequired"
            );
            footer.appendChild(small_content);
          }

          const interaction = document.createElement("label");
          interaction.className = "switch settings-set";

          const interaction_input = document.createElement("input");
          interaction_input.type = "checkbox";
          interaction_input.defaultChecked = false || this.isChecked;
          interaction_input.addEventListener("change", (event) => {
            cb(event.currentTarget.checked);
          });

          const interaction_slider = document.createElement("span");
          interaction_slider.className = "slider";

          interaction.appendChild(interaction_input);
          interaction.appendChild(interaction_slider);

          container.appendChild(title);
          container.appendChild(breakline);
          container.appendChild(description);
          container.appendChild(interaction);
          if (footer) {
            container.appendChild(footer);
          }

          storeAlphabeticElement(
            { container, title: this.title, category: this.category },
            this.category
          );
        }
        break;
      case "selection":
        {
          const container = document.createElement("div");
          container.className = "setting-box";

          const title = document.createElement("p");
          title.className = "settings-title-text";
          title.innerText = this.title;

          const breakline = document.createElement("div");
          breakline.className = "breakline";

          const description = document.createElement("p");
          description.className = "settings-descriptions-text";
          description.innerText = this.description;

          let footer;
          if (this.restartRequired) {
            footer = document.createElement("footer");
            footer.className = "settings-footer";
            const small_content = document.createElement("small");
            small_content.innerText = global.translate(
              "settings.general.restartRequired"
            );
            footer.appendChild(small_content);
          }

          const interaction = document.createElement("select");
          interaction.className = "settings-set top";
          interaction.id = "select";
          interaction.addEventListener("change", (event) => {
            cb(event.currentTarget.value);
          });

          this.selectionElement = interaction;

          this.options.forEach((option) => {
            const interaction_option = document.createElement("option");
            interaction_option.innerText = option;
            interaction.appendChild(interaction_option);
          });

          container.appendChild(title);
          container.appendChild(breakline);
          container.appendChild(description);
          container.appendChild(interaction);
          if (footer) {
            container.appendChild(footer);
          }

          storeAlphabeticElement(
            { container, title: this.title, category: this.category },
            this.category
          );
        }
        break;
    }
  }
}

onGlobalReady(() => {
  const settings_configuration = getSettingsCache()?.settings;

  global.listen("escape", handleEscape);

  const saveWindowBounds = new Setting("switch");
  saveWindowBounds.setCategory("general");
  saveWindowBounds.setTitle(
    global.translate("settings.general.store.windowBounds.title")
  );
  saveWindowBounds.setDescription(
    global.translate("settings.general.store.windowBounds.description")
  );
  saveWindowBounds.setSwitchIsChecked(
    fallback(settings_configuration?.storeWindowBounds, true)
  );
  saveWindowBounds.createAndResult((value) => {
    storeKey("app.settings.storeWindowBounds", Boolean(value));
  });

  const autoCollapseSettingsCategories = new Setting("switch");
  autoCollapseSettingsCategories.setCategory("general");
  autoCollapseSettingsCategories.setTitle(
    global.translate("settings.general.autocollapse.title")
  );
  autoCollapseSettingsCategories.setDescription(
    global.translate("settings.general.autocollapse.description")
  );
  autoCollapseSettingsCategories.setSwitchIsChecked(
    fallback(settings_configuration?.autoCollapseActive, false)
  );
  autoCollapseSettingsCategories.setRestartRequired(true);
  autoCollapseSettingsCategories.createAndResult((value) => {
    storeKey("app.settings.autoCollapseActive", Boolean(value));
  });

  const saveWindowPosition = new Setting("switch");
  saveWindowPosition.setCategory("general");
  saveWindowPosition.setTitle(
    global.translate("settings.general.store.windowPosition.title")
  );
  saveWindowPosition.setDescription(
    global.translate("settings.general.store.windowPosition.description")
  );
  saveWindowPosition.setSwitchIsChecked(
    fallback(settings_configuration?.storeWindowPosition, true)
  );
  saveWindowPosition.createAndResult((value) => {
    storeKey("app.settings.storeWindowPosition", Boolean(value));
  });
});

function handleEscape() {
  if (global.areSettingsActive()) {
    unloadSettings();

    setTimeout(() => {
      document.querySelectorAll("[data-glyphiconpage]").forEach((element) => {
        const dataset = element?.dataset;
        if (dataset) {
          const identifier = dataset.identify;
          const href = dataset.href;

          if (identifier === "settings") {
            loadNewPage(href);
          }
        }
      });
    }, 150);
  }
}

function getRandomSearchbarPlaceholder() {
  document.querySelectorAll("[data-placeholderlist]").forEach((element) => {
    const placeholderlist_string = element.dataset.placeholderlist;
    const placeholderlist = global.translate(placeholderlist_string);
    const placeholder =
      placeholderlist[Math.floor(Math.random() * placeholderlist.length)];
    element.placeholder = placeholder;
  });
}

// Using render and release to handle when the settings should be loaded and when not
// This gives better performance and also helps so that the settings can be sorted
// alphabeticly before rendering them.
function render() {
  categories.forEach((category) => {
    const list = document.querySelector(
      `[data-settings-category="${category}"]`
    );
    elements[category].forEach((obj) => {
      // Appending here from the sorted elements list
      list.appendChild(obj.container);
    });
  });
  getRandomSearchbarPlaceholder();
}

function release() {
  // setting a timeout so the animation can play before removing the children
  setTimeout(() => {
    categories.forEach((category) => {
      const list = document.querySelector(
        `[data-settings-category="${category}"]`
      );
      // Replace children without arguments deletes everything without inserting a new child
      list.replaceChildren();
    });
  }, 350);
}

export { Setting, render, release };
