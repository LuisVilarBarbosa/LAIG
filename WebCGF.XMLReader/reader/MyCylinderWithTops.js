/**
 * MyCylinderWithTops
 * @constructor
 */
function MyCylinderWithTops(scene, slices, stacks) {
    CGFobject.call(this, scene);

    this.cylinder = new MyCylinder(this.scene, slices, stacks);
    this.top = new MyCircle(this.scene, slices);
};

MyCylinderWithTops.prototype = Object.create(CGFobject.prototype);
MyCylinderWithTops.prototype.constructor = MyCylinderWithTops;

MyCylinderWithTops.prototype.display = function () {

    this.scene.pushMatrix();
        
        this.cylinder.display();

        this.scene.pushMatrix();
            this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
            this.top.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(0.0, 0.0, 1.0);
            this.top.display();
        this.scene.popMatrix();

    this.scene.popMatrix();
};
