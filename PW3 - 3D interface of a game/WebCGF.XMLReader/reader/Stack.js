/**
 * Stack
 * @constructor
 */
function Stack(elem) {
    this.elems = [];
    if (elem !== undefined)
        this.elems.push(elem);
};

Stack.prototype.push = function (elem) {
    this.elems.push(elem);
}

Stack.prototype.pop = function () {
    this.elems.pop();
}

Stack.prototype.top = function () {
    return this.elems[this.elems.length - 1];
}
