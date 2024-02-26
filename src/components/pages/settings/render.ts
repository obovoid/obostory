"use strict";
import { onAction } from "../../startup";
import { ensureType } from "../../utils/ensureType";
import { Translator } from "../../utils/translator";
import { safeUnfoldCache, storeKey } from "../../utils/storage";
import { getRandomSearchbarPlaceholder } from "./build";

const translator = new Translator({stringErrorOnMissingTranslation: true});

const types = ["switch", "selection"];
// category names will be renamed soon
const categories: string[] = ["general", "timeline", "profiles", "fonts"];

const elements = categories.reduce((acc: any, category: string): GeneralType => {
  acc[category] = [];
  return acc;
}, {});


function storeAlphabeticElement(object: SettingsElements, category: string): boolean {
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
  elements[category].sort((a: {title: string}, b: {title: string}) => a.title.localeCompare(b.title));

  return true;
}

/**
 * @param {switch | selection} setting_type
 */
class Setting {
  type: string;
  category: string;
  title: string;
  description: string;
  isChecked: boolean;
  options: string[];
  restartRequired: boolean;
  selectionElement: HTMLSelectElement;

  constructor(setting_type: string) {
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
  setCategory(categoryName: string) {
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
  setTitle(optionTitle: string) {
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
  setDescription(optionDescription: string) {
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
  setSwitchIsChecked(boolean: boolean) {
    ensureType(boolean, "boolean");
    this.isChecked = Boolean(boolean);
  }
  /**
   * @param {string[]} array
   */
  setOptions(array: string[]) {
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
  setRestartRequired(bool: boolean) {
    ensureType(bool, "boolean");
    this.restartRequired = true;
  }
  selectionSetValue(value: string) {
    ensureType(value, "string");
    if (!this.selectionElement)
      throw new Error(
        "Before Changing the selection value, you need to create it first!"
      );
    this.selectionElement.value = value;
  }
  createAndResult(cb: GeneralType) {
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
            const small_content = document.createElement("small") as HTMLElement
            small_content.innerText = translator.translate(
              "settings.general.restartRequired"
            );
            footer.appendChild(small_content);
          }

          const interaction = document.createElement("label");
          interaction.className = "switch settings-set";

          const interaction_input = document.createElement("input");
          interaction_input.type = "checkbox";
          interaction_input.defaultChecked = this.isChecked ?? false;
          interaction_input.addEventListener("change", (event) => {
              cb(Boolean((event.currentTarget as HTMLInputElement).checked));
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
            small_content.innerText = translator.translate(
              "settings.general.restartRequired"
            );
            footer.appendChild(small_content);
          }

          const interaction = document.createElement("select");
          interaction.className = "settings-set top";
          interaction.id = "select";
          interaction.addEventListener("change", (event) => {
            cb(String((event.currentTarget as HTMLInputElement).value));
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

function render() {
  categories.forEach((category) => {
    const list = document.querySelector(
      `[data-settings-category="${category}"]`
    );
    elements[category].forEach((obj: {container: HTMLElement}) => {
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

document.addEventListener("DOMContentLoaded", () => {
  onAction('ready.cache', () => {
    const autoCollapseSettingsCategories = new Setting("switch");
    autoCollapseSettingsCategories.setCategory("general");
    autoCollapseSettingsCategories.setTitle(
      translator.translate("settings.general.autocollapse.title")
    );
    autoCollapseSettingsCategories.setDescription(
      translator.translate("settings.general.autocollapse.description")
    );
    const autoCollapse = (safeUnfoldCache('settings.autoCollapseActive') ?? true) as boolean;
    autoCollapseSettingsCategories.setSwitchIsChecked(
      autoCollapse ?? false
    );
    autoCollapseSettingsCategories.setRestartRequired(true);
    autoCollapseSettingsCategories.createAndResult((value: boolean) => {
      storeKey("app.settings.autoCollapseActive", Boolean(value));
    });
  })
});

export { Setting, types, categories, elements, render, release }