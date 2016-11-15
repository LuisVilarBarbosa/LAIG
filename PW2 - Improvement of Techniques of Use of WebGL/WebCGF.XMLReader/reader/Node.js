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
    this.animations = [];
    this.animationIndex = -1;
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

Node.prototype.pushChild = function (nodeId) {
    this.children.push(nodeId);
}

Node.prototype.pushPrimitive = function (nodeId) {
    this.primitives.push(nodeId);
}

Node.prototype.getSize = function () {
    return this.children.length;
}

Node.prototype.getAnimation = function () {
    if (this.animationIndex == -1)
        return null;
    return this.animations[this.animationIndex];
}

Node.prototype.addAnimation = function (animation) {
    this.animations.push(animation);
    if (this.animationIndex == -1)
        this.animationIndex = 0;
}

Node.prototype.nextAnimation = function () {
    if (this.animationIndex < this.animations.length - 1)
        this.animationIndex++;
}
