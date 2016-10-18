/**
 * MyCylinderWithTops
 * @constructor
 */
function MyCylinderWithTops(scene, base, top, height, slices, stacks) {
    CGFobject.call(this, scene);

    this.baseDiameter = base;
    this.topDiameter = top;
    this.height = height;
    this.cylinder = new MyCylinder(this.scene, this.baseDiameter, this.topDiameter, this.height, slices, stacks);
    this.top = new MyCircle(this.scene, slices);
};

MyCylinderWithTops.prototype = Object.create(CGFobject.prototype);
MyCylinderWithTops.prototype.constructor = MyCylinderWithTops;

MyCylinderWithTops.prototype.display = function () {

    this.scene.pushMatrix();
        
        this.cylinder.display();

        this.scene.pushMatrix();
            this.scene.scale(this.baseDiameter, this.baseDiameter, this.baseDiameter);
            this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
            this.top.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(0.0, 0.0, this.height);
            this.scene.scale(this.topDiameter, this.topDiameter, this.topDiameter);
            this.top.display();
        this.scene.popMatrix();

    this.scene.popMatrix();
};
