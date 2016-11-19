/**
 * MyBoard
 * @constructor
 */
function MyBoard(scene, du, dv, textureref, su, sv, colors) {
    CGFobject.call(this, scene);

    if (colors.length != 3)
      throw this.constructor.name + ": Invalid number of colors, expected 3.";

    this.du = du;
    this.dv = dv;
    this.textureref = textureref;
    this.su = su;
    this.sv = sv;
    this.c1 = colors[0];
    this.c2 = colors[1];
    this.cs = colors[2];

    this.plane = new MyNurbsPlane(scene, 1, 1, this.du, this.dv);

    this.texture = this.scene.textures[this.textureref];
    if (this.texture === undefined)
        throw this.constructor.name + ": The texture '" + this.textureref + "' isn't declared in the 'textures' element.";
    this.setTextureCoordinates(this.texture.length_s, this.texture.length_t);

    this.shader = new CGFshader(this.scene.gl, "shaders/board-vertex.glsl", "shaders/board-fragment.glsl");
    this.shader.setUniformsValues({ dim: [this.du, this.dv], vSampler: 1,
      sel: [this.su, this.sv], c1: this.c1, c2: this.c2, cs: this.cs });
};

MyBoard.prototype.setTextureCoordinates = function (lengthS, lengthT) {
    this.plane.setTextureCoordinates(lengthS, lengthT);
}

MyBoard.prototype.display = function () {
    var originalActiveShader = this.scene.activeShader;
    this.scene.setActiveShader(this.shader);
    this.texture.bind();
    this.texture.bind(1);
    this.plane.display();
    this.scene.setActiveShader(originalActiveShader);
}
