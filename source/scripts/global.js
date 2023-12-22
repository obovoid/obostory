const global = {}
global._eventHolder = {}

global.listen = (...arguments) => {
    const name = arguments[0]
    if (typeof name !== 'string') throw new Error(`Argument 0 needs to be of type string[eventName] and not ${typeof name}`)
    const func = arguments[1]
    if (typeof func !== 'function') throw new Error(`Argument 1 needs to be of type function[callback] and not ${typeof func}`)
    
    if (!global._eventHolder[name]) {
    	global._eventHolder[name] = []
    }
    
    global._eventHolder[name].push(func);
}

global.call = (eventName, ...arguments) => {
    if (!global._eventHolder[eventName]) return;
	global._eventHolder[eventName].forEach(func => {
    	func(...arguments);
    });
}

global._setSettingsActive = (boolean) => {
    global._settingsActive = boolean
}

global.areSettingsActive = () => {
    return global._settingsActive || false
}

global.translate = (translation_id) => {
    let default_language = navigator.language
    if (!language[default_language]) {
        default_language = 'en-US'
    }

    return language[default_language][translation_id]
}