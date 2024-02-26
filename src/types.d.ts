declare type DefaultCallback = (name?: string) => void

declare interface GlobalObject {
    [key: string]: GlobalObject | any;
}

declare interface Window {
    API: {
      quit: () => void;
      openURL: (url: string) => void;
      showAppInfo: () => void;
      requestRestart: (options: { once: boolean }) => void;
      setStorageKey: (key: string, value: GeneralType, storagePoint: StoragePoint) => void;
      getStorageKey: (key: string) => Promise<GeneralValidJSON>;
      onWindowEvent: (eventName: string, callback: (data: any) => void) => void;
      updateLanguageId: (languageId: string) => void;
    };
}

declare type StoragePoint = "general" | "process"

declare type GeneralType = string | string[] | number | number[] | boolean | boolean[] | object | object[]

declare interface RequestOptions {
  once: boolean;
}

declare interface GeneralValidJSON {
  [key: string]: string | string[];
}

declare interface settingsObjectType {
  [key: string]: string;
}

declare type sendActionSelector = 0xb8667009

declare interface ActionEvent {
  selector: string;
  returnPointer: (data: any[], eventName: string) => void;
}

declare interface SettingsElements {
  container: HTMLElement;
  title: string;
  category: string;
}