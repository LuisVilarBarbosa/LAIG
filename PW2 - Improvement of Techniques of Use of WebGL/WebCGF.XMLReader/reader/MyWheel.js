/**
 * MyWheel
 * @constructor
 */
function MyWheel(scene) {
    CGFobject.call(this, scene);
    this.scene = scene;

    this.tire;
    this.rim;

    this.tire_material;
    this.rim_material;

    this.define_materials();
    this.build();

};

MyWheel.prototype = Object.create(CGFobject.prototype);
MyWheel.prototype.constructor = MyWheel;

MyWheel.prototype.define_materials = function () {
    this.tire_material = new CGFappearance(this.scene);
    this.tire_material.setAmbient(0.8, 0.8, 0.8, 1);
    this.tire_material.setDiffuse(0.2, 0.2, 0.2, 1.0);
    this.tire_material.setSpecular(0, 0, 0, 1.0);
    this.tire_material.setShininess(1);
    this.tire_material.loadTexture('./images/tire_rubber.jpg');
    this.tire_material.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

    this.rim_material = new CGFappearance(this.scene);
    this.rim_material.setAmbient(0.5, 0.5, 0.5, 1);
    this.rim_material.setDiffuse(0.7, 0.7, 0.7, 1.0);
    this.rim_material.setSpecular(0.7, 0.7, 0.7, 1.0);
    this.rim_material.setShininess(100);
    this.rim_material.loadTexture('./images/simple_rim.png');
    this.rim_material.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
}


MyWheel.prototype.build = function () {
    this.tire = new MyTorus(this.scene, 1, 1.15, 100, 100, 1, 1);
    this.rim = new MyCylinderWithTops(this.scene, 0.65, 0.65, 0.50, 100, 100, 1, 1);

}

MyWheel.prototype.display = function () {

    this.rim_material.apply();
    this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.25);
        this.rim.display();
    this.scene.popMatrix();

    this.tire_material.apply();
    this.scene.pushMatrix();
        this.scene.scale(0.6, 0.6, 4);
        this.tire.display();
    this.scene.popMatrix();

    this.scene.defaultAppearance.apply();
};
