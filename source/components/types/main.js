/* 
    Copyright (c) 2024, Obovoid
    All rights reserved.

    This source code is licensed under the GPL-3.0-style license found in the
    LICENSE file in the root directory of this source tree.
*/

function getType(value) {
    let type = Object.prototype.toString.call(value).split(' ')[1].replace(']', '').toLowerCase();
    switch(type) {
        case 'function':
            {
                // This may be a poor implementation but since JS does not differ between Classes and Function the only option for now.
                const isClass = /^\s*class\s+/.test( value.toString() );
                isClass ? type = "class" : type = "function"
            }
            break
    }

    return type
}

/**
 * Returns the file name of the file that called the current function.
 * 
 * @returns {string} The file name of the file that called the current function.
 */
function _getCallerFile() {
    let traceLog;
    let debugInformation;

    let _pst = Error.prepareStackTrace
    Error.prepareStackTrace = function (err, stack) { return stack; };
    try {
        let err = new Error();
        let callerfile;
        let currentfile;
        // stack 2 usually contains the file causing the crash, as well as the line and position.
        debugInformation = err.stack[2]

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) {
                traceLog = callerfile;
                break;
            }
        }
    } catch (err) {/* Ignoring Errors */}
    Error.prepareStackTrace = _pst;
    

    return traceLog += `\n\nFailed function with line and position:\n${debugInformation}`;
}

/**
 * Checks if the received value is of the expected type. If not, throws an error.
 * 
 * @param {any} value - The value to check.
 * @param {string} expectedType - The expected type of the value.
 * @returns {boolean} Returns true if the value is of the expected type, false otherwise.
 */
function ensureType(value, expectedType) {
  const receivedType = getType(value);
  if (receivedType !== expectedType) {
    console.log('preparing to throw Error Exception...');
    window.API.newError(`Type Error. Expected ${expectedType}, but instead received "${receivedType}".\n${_getCallerFile()}`);
    return false;
  }
  return true;
}

export { getType, ensureType }