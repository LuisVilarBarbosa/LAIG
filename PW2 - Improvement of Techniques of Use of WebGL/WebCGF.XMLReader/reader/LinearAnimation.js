/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(controlpoints, span) {
    Animation.call(this);
    if (controlpoints == null)   // include 'undefined'
        throw new Error("The control points should be instantiated.");
    if (controlpoints.length < 2)
        console.warn("The number of control points should be, at least, 2. The animation will not take effect.");
    if (span == null)   // include 'undefined'
        throw new Error("The animation time should be instantiated.");
    if (span < 0)
        throw new Error("The animation time cannot be negative.");

    this.controlpoints = controlpoints;
    this.span = span;   /* in seconds */

    var distance = 0;
    for (var i = 1; i < this.controlpoints.length; i++)
        distance += this.calculateLineLength(this.controlpoints[i - 1], this.controlpoints[i]);
    this.velocity = distance / this.span;
    this.transform = mat4.create();
};

/* sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2) */
LinearAnimation.prototype.calculateLineLength = function (point1, point2) {
    var sum = 0;
    for (var i = 0, delta; i < 3; i++) {
        delta = point2[i] - point1[i];
        sum += delta * delta;
    }
    return Math.sqrt(sum);
}

LinearAnimation.prototype.calculateYAngle = function (point1, point2) {
    return Math.atan2(point2[2] - point1[2], point2[0] - point1[0]);
}

LinearAnimation.prototype.calculateGeometricTransformation = function (currTime) {
    if (this.controlpoints.length < 2 || this.done === true)  /* static animation or animation done */
        return;

    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;   /* in seconds */
    var translation = [0, 0, 0], yRotationAngle;

    if (deltaTime <= this.span) {
        var newTotalDistanceDone = this.velocity * deltaTime;

        /* calculate what is the actual pair of control points ('i' will be the second control point) */
        var actualLineLength, i = 1, distanceCompletedLines = 0;
        for (var stop = false; !stop;) {
            actualLineLength = this.calculateLineLength(this.controlpoints[i - 1], this.controlpoints[i]);
            if (distanceCompletedLines + actualLineLength <= newTotalDistanceDone) {
                distanceCompletedLines += actualLineLength;
                i++;
            }
            else stop = true;
        }

        var lineDistanceDone = newTotalDistanceDone - distanceCompletedLines;
        var lineDeltaTime = lineDistanceDone * this.velocity;
        var lineTime = actualLineLength * this.velocity;

        /* calculate the line point where the object must be placed */
        for (var j = 0, ratio = lineDeltaTime / lineTime; j < 3; j++)
            translation[j] = this.controlpoints[i - 1][j] + (this.controlpoints[i][j] - this.controlpoints[i - 1][j]) * ratio;
        yRotationAngle = -this.calculateYAngle(this.controlpoints[i - 1], this.controlpoints[i]);
    } else {
        var lastIndex = this.controlpoints.length - 1;
        translation = this.controlpoints[lastIndex];
        yRotationAngle = -this.calculateYAngle(this.controlpoints[lastIndex - 1], this.controlpoints[lastIndex]);
        this.done = true;
    }

    /* generate transformation matrix */
    this.transform = mat4.create();
    mat4.translate(this.transform, this.transform, translation);
    mat4.rotate(this.transform, this.transform, yRotationAngle, [0, 1, 0]);
}

LinearAnimation.prototype.getGeometricTransformation = function () {
    return this.transform;
}
