/**
 * Node
 * @constructor
 */
function Node() {
    this.materials = [];
    this.materialIndex = 0;
    this.texture = null;
    this.mat = null;    // transformation matrix
    this.children = [];
    this.primitives = [];
};

Node.prototype.addMaterialId = function (m) {
    this.materials.push(m);
}

Node.prototype.nextMaterialId = function () {
    this.materialIndex = (this.materialIndex + 1) % this.materials.length;
}

Node.prototype.getMaterialId = function () {
    return this.materials[this.materialIndex];
}

Node.prototype.setTextureId = function (t) {
    this.texture = t;
}

Node.prototype.setMatrix = function (m) {
    this.mat = mat4.clone(m);
    console.log(this.mat);
}

Node.prototype.pushChild = function (nodeName) {
    this.children.push(nodeName);
}

Node.prototype.pushPrimitive = function (nodeName) {
    this.primitives.push(nodeName);
}

Node.prototype.getSize = function () {
    return this.children.length;
}
