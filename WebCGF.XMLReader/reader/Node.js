function Node() {
    this.material = null;
    this.texture = null;
    this.mat = null;    // transformation matrix
    this.children = [];
};

Node.prototype.push = function (nodeName) {
    this.children.push(nodeName);
}

Node.prototype.getSize = function () {
    return this.children.length;
}

Node.prototype.setMatrix = function (m) {
    this.mat = mat4.clone(m);
    console.log(this.mat);
}
