/**
 * AnimationByKeyImages
 * @constructor
 */
function AnimationByKeyImages(span, controlPoints, startang, rotang, scale) {
    Animation.call(this);
    if (controlPoints == null)   // include 'undefined'
        throw this.constructor.name + ": The control points should be instantiated.";
    if (controlPoints.length < 2)
        throw this.constructor.name + ": The number of control points must be, at least, 2.";

    this.span = span;
    this.controlPoints = controlPoints;
    this.startang = startang;
    this.rotang = rotang;
    this.scale = scale;

    var numberOfPairs = controlPoints.length - 1;
    this.circularSpan = this.span / numberOfPairs;   /* in seconds */
    this.actualPoint2 = 1;
    this.center = [0, 0, 0];
    var radius = this.calculateRadius(this.controlPoints[this.actualPoint2 - 1], this.controlPoints[this.actualPoint2]);

    try {
        this.linearAnimation = new LinearAnimation(this.controlPoints, this.span);
        this.circularAnimation = new CircularAnimation(this.circularSpan, this.center, radius, this.startang, this.rotang);
        this.scalarAnimation = new ScalarAnimation(this.span, this.scale);
    } catch (message) {
        throw this.constructor.name + ": " + message;
    }

    this.transform = mat4.create();
};

/* sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2) / 2 */
AnimationByKeyImages.prototype.calculateRadius = function (point1, point2) {
    var sum = 0;
    for (var i = 0, delta; i < 3; i++) {
        delta = point2[i] - point1[i];
        sum += delta * delta;
    }
    return Math.sqrt(sum) / 2;
}

AnimationByKeyImages.prototype.calculateGeometricTransformation = function (currTime) {
    if (this.done === true)  /* animation done - last transformation already saved */
        return;

    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;   /* in seconds */

    this.linearAnimation.calculateGeometricTransformation(currTime);
    this.circularAnimation.calculateGeometricTransformation(currTime);
    this.scalarAnimation.calculateGeometricTransformation(currTime);

    if (deltaTime <= this.span) {
        if (this.circularAnimation.done === true) {
            this.actualPoint2++;
            var radius = this.calculateRadius(this.controlPoints[this.actualPoint2 - 1], this.controlPoints[this.actualPoint2]);
            this.startang += this.rotang;
            this.circularAnimation = new CircularAnimation(this.circularSpan, this.center, radius, this.startang, this.rotang);
            this.circularAnimation.calculateGeometricTransformation(currTime);
        }
    }
    else
        this.done = true;

    /* generate transformation matrix */
    this.transform = mat4.create();
    mat4.multiply(this.transform, this.transform, this.linearAnimation.getGeometricTransformation());
    mat4.multiply(this.transform, this.transform, this.circularAnimation.getGeometricTransformation());
    mat4.multiply(this.transform, this.transform, this.scalarAnimation.getGeometricTransformation());
}

AnimationByKeyImages.prototype.getGeometricTransformation = function () {
    return this.transform;
}
