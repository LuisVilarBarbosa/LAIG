/**
 * CircularAnimation
 * @constructor
 */
function CircularAnimation(span, center, radius, startang, rotang) {
    Animation.call(this);
    if (span == null)   // include 'undefined'
        throw new Error("The animation time should be instantiated.");
    if (span < 0)
        throw new Error("The animation time cannot be negative.");
    if (center == null || radius == null || startang == null || rotang == null)
        throw new Error("Invalid variable. 'CircularAnimation' doesn't accept 'null' or 'undefined' variables.");
    if (center.length != 3)
        throw new Error("Invalid center. The center must have 3 components (xyz).");

    this.degToRad = Math.PI / 180;

    this.span = span;   /* in seconds */
    this.center = center;
    this.radius = radius;
    this.startang = startang * this.degToRad;
    this.rotang = rotang * this.degToRad;

    this.angVelocity = this.rotang / this.span;
    this.transform = mat4.create();
};

/* Rotation in the Y axis (planes parallel to ZX) */
CircularAnimation.prototype.calculateGeometricTransformation = function (currTime) {
    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;   /* in seconds */
    this.transform = mat4.create();

    if (deltaTime <= this.span) {
        var newTotalAngleDone = this.angVelocity * deltaTime;
        mat4.translate(this.transform, this.transform, this.center);
        mat4.rotate(this.transform, this.transform, this.startang + newTotalAngleDone, [0, 1, 0]);
        mat4.translate(this.transform, this.transform, [0, 0, this.radius]);
    } else {
        mat4.translate(this.transform, this.transform, this.center);
        mat4.rotate(this.transform, this.transform, this.startang + this.rotang, [0, 1, 0]);
        mat4.translate(this.transform, this.transform, [0, 0, this.radius]);
        this.done = true;
    }
}

CircularAnimation.prototype.getGeometricTransformation = function () {
    return this.transform;
}
