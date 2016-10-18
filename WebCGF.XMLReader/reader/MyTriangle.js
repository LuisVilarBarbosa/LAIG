/**
 * MyTriangle
 * @constructor
 */
function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    CGFobject.call(this, scene);

    this.x1 = x1;
    this.x2 = x2;
    this.x3 = x3;
    this.y1 = y1;
    this.y2 = y2;
    this.y3 = y3;
    this.z1 = z1;
    this.z2 = z2;
    this.z3 = z3;

    this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function () {
    this.vertices = [
        this.x1, this.y1, this.z3,
        this.x2, this.y2, this.z3,
        this.x3, this.y3, this.z3,
    ];

    this.indices = [
        0, 1, 2,
    ];

    var a = Math.sqrt(
        (this.x1 - this.x3) * (this.x1 - this.x3) +
        (this.y1 - this.y3) * (this.y1 - this.y3) +
        (this.z1 - this.z3) * (this.z1 - this.z3));

    var b = Math.sqrt(
        (this.x2 - this.x1) * (this.x2 - this.x1) +
        (this.y2 - this.y1) * (this.y2 - this.y1) +
        (this.z2 - this.z1) * (this.z2 - this.z1));

    var c = Math.sqrt(
       (this.x3 - this.x2) * (this.x3 - this.x2) +
       (this.y3 - this.y2) * (this.y3 - this.y2) +
       (this.z3 - this.z2) * (this.z3 - this.z2));

    var cosbeta = (a * a - b * b + c * c) / (2 * a * c);
    var beta = Math.acos(cosbeta);

    this.texCoords = [
        0, 0,
        1, 0,
        c - a * cosbeta, a * Math.sin(beta)
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
