/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, inner, outer, slices, loops) {
    CGFobject.call(this, scene);

    this.inner = inner;
    this.outer = outer;
    this.slices = slices;
    this.loops = loops;

    this.initBuffers();
};

MyTorus.prototype = Object.create(CGFobject.prototype);
MyTorus.prototype.constructor = MyTorus;

MyTorus.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.texCoords = [];

    var incU = 2 * Math.PI / this.slices;     // xOz
    var incV = 2 * Math.PI / this.loops;    // xOy
    var incS = 1 / this.slices;
    var incT = 1 / this.loops;

    for (var j = 0, v = 0, t = 0; j <= this.loops; j++, v += incV, t += incT) {  // v = j * incV --> xOy
        for (var i = 0, u = 0, s = 0; i <= this.slices; i++, u += incU, s += incS) {  // u = i * incU --> xOz
            this.vertices.push(
                (this.outer + this.inner * Math.cos(v)) * Math.cos(u),
                (this.outer + this.inner * Math.cos(v)) * Math.sin(u),
                this.inner * Math.sin(v));

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

            this.texCoords.push(s, t);
        }
    }

    for (var j = 0; j <= this.loops; j++) {
        for (var i = 0; i < this.slices; i++) {
            this.indices.push(j * this.slices + i, j * this.slices + i + 1, (j + 1) * this.slices + i + 1);
            this.indices.push((j + 1) * this.slices + i, j * this.slices + i, (j + 1) * this.slices + i + 1);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
