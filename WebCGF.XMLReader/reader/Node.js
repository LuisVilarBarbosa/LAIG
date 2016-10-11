function Node() {
    this.material = [];
    this.texture = null;
    this.mat = null;    // transformation matrix
    this.children = [];
    this.primitive = null;
};

Node.prototype.addMaterial = function (m) {
    this.material.push(m);
}

Node.prototype.setTexture = function (t) {
    this.texture = t;
}

Node.prototype.setMatrix = function (m) {
    this.mat = mat4.clone(m);
    console.log(this.mat);
}

Node.prototype.push = function (nodeName) {
    this.children.push(nodeName);
}

Node.prototype.getSize = function () {
    return this.children.length;
}
