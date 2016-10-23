/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, inner, outer, slices, loops, lengthS, lengthT) {
    CGFobject.call(this, scene);

    this.r = (outer - inner) / 2;
    this.R = inner + this.r;
    this.slices = slices;
    this.loops = loops;
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.initBuffers();
};

MyTorus.prototype = Object.create(CGFobject.prototype);
MyTorus.prototype.constructor = MyTorus;

MyTorus.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    var incU = 2 * Math.PI / this.slices;     // xOz
    var incV = 2 * Math.PI / this.loops;    // xOy

    for (var j = 0, v = 0; j <= this.loops; j++, v += incV) {  // v = j * incV --> xOy
        for (var i = 0, u = 0; i <= this.slices; i++, u += incU) {  // u = i * incU --> xOz
            this.vertices.push(
                (this.R + this.r * Math.cos(v)) * Math.cos(u),
                (this.R + this.r * Math.cos(v)) * Math.sin(u),
                this.r * Math.sin(v));

            /* tangent vector of the big circle */
            var tbcx = -Math.sin(u);
            var tbcy = Math.cos(u);
            var tbcz = 0;
            /* tangent vector of the little circle */
            var tlcx = Math.cos(u) * (-Math.sin(v));
            var tlcy = Math.sin(u) * (-Math.sin(v));
            var tlcz = Math.cos(v);
            /* normal: cross-product of tangents */
            var nx = tbcy * tlcz - tbcz * tlcy;
            var ny = tbcz * tlcx - tbcx * tlcz;
            var nz = tbcx * tlcy - tbcy * tlcx;            this.normals.push(nx, ny, nz);
        }
    }

    this.setTextureCoordinates(this.lengthS, this.lengthT);

    for (var j = 0; j < this.loops; j++) {
        for (var i = 0; i < this.slices; i++) {
            var a = j * this.slices + j + i;
            var b = j * this.slices + j + 1 + i;
            var c = (j + 1) * this.slices + j + 1 + i + 1;
            var d = (j + 1) * this.slices + j + 1 + i;
            this.indices.push(a, b, c);
            this.indices.push(c, d, a);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTorus.prototype.setTextureCoordinates = function (lengthS, lengthT) {
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.texCoords = [];

    var decS = this.lengthS / this.slices;
    var decT = this.lengthT / this.loops;

    for (var j = 0, t = this.lengthT; j <= this.loops; j++, t -= decT)
        for (var i = 0, s = this.lengthS; i <= this.slices; i++, s -= decS)
            this.texCoords.push(s, t);

    this.updateTexCoordsGLBuffers();
}
