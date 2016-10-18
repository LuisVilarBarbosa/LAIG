function Node() {
    this.material = null;
    this.materials = [];
    this.texture = null;
    this.mat = null;    // transformation matrix
    this.children = [];
    this.primitives = [];
};

Node.prototype.addMaterial = function (m) {
    if (this.material == null)
        this.material = m;
    this.materials.push(m);
}

Node.prototype.nextMaterial = function () {
    for (var i = 0; i < this.materials.length; i++)
        if (this.material == this.materials[i])
            this.material = this.materials[(i + 1) % this.materials.length];
}

Node.prototype.setTexture = function (t) {
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
