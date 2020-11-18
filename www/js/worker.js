import * as Comlink from "./comlink.js";
const testValue = 'testing complink'
class testClass {
    logSomething () {
        console.log(testValue)
    }
}

Comlink.expose(testClass);