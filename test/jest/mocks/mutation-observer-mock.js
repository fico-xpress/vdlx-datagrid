global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback;
        this.disconnect = global.MutationObserver.disconnect;
        this.observe = global.MutationObserver.observe;
    }
};
global.MutationObserver.disconnect = jest.fn();
global.MutationObserver.observe = jest.fn();