/**
 * MyCylinderWithTops
 * @constructor
 */
function MyCylinderWithTops(scene, base, top, height, slices, stacks, minS, maxS, minT, maxT) {
    CGFobject.call(this, scene);

    this.baseRadius = base;
    this.topRadius = top;
    this.height = height;
    this.cylinder = new MyCylinder(this.scene, this.baseRadius, this.topRadius, this.height, slices, stacks, minS, maxS, minT, maxT);
    this.top = new MyCircle(this.scene, slices, minS, maxS, minT, maxT);
};

MyCylinderWithTops.prototype = Object.create(CGFobject.prototype);
MyCylinderWithTops.prototype.constructor = MyCylinderWithTops;

MyCylinderWithTops.prototype.display = function () {

    this.scene.pushMatrix();
        
        this.cylinder.display();

        this.scene.pushMatrix();
            this.scene.scale(this.baseRadius * 2, this.baseRadius * 2, this.baseRadius * 2);
            this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
            this.top.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(0.0, 0.0, this.height);
            this.scene.scale(this.topRadius * 2, this.topRadius * 2, this.topRadius * 2);
            this.top.display();
        this.scene.popMatrix();

    this.scene.popMatrix();
};

MyCylinderWithTops.prototype.setTextureCoordinates = function (minS, maxS, minT, maxT) {
    this.cylinder.setTextureCoordinates(minS, maxS, minT, maxT);
    this.top.setTextureCoordinates(minS, maxS, minT, maxT);
}
