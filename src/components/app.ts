import { Translator } from "./utils/translator";
import { Setting } from "./pages/settings/render";
import { safeUnfoldCache, storeKey } from "./utils/storage";
import { onAction } from "./startup";

const translater = new Translator({stringErrorOnMissingTranslation: true});

document.addEventListener('DOMContentLoaded', () => {
  onAction("ready.cache", () => {
    const saveWindowBounds = new Setting("switch");
    saveWindowBounds.setCategory("general");
    saveWindowBounds.setTitle(
      translater.translate("settings.general.store.windowBounds.title")
    );
    saveWindowBounds.setDescription(
      translater.translate("settings.general.store.windowBounds.description")
    );
    const storeWindowBounds = (safeUnfoldCache('settings.storeWindowBounds') ?? true) as boolean;
    saveWindowBounds.setSwitchIsChecked(
        storeWindowBounds
    );
    saveWindowBounds.createAndResult((value: boolean) => {
        storeKey("settings.storeWindowBounds", Boolean(value), "process");
    });


    const saveWindowPosition = new Setting("switch");
    saveWindowPosition.setCategory("general");
    saveWindowPosition.setTitle(
      translater.translate("settings.general.store.windowPosition.title")
    );
    saveWindowPosition.setDescription(
      translater.translate("settings.general.store.windowPosition.description")
    );
    const storeWindowPosition = (safeUnfoldCache('settings.storeWindowPosition') ?? true) as boolean;
    saveWindowPosition.setSwitchIsChecked(
      storeWindowPosition
    );
    saveWindowPosition.createAndResult((value: boolean) => {
      storeKey("settings.storeWindowPosition", Boolean(value), "process");
    });
  })
});