/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(controlpoints, span) {
    Animation.call(this);
    if (controlpoints == null)   // include 'undefined'
        throw new Error("The control points should be instantiated.");
    if (controlpoints.length < 6)   // 6 = 2 points with 3 coordinates
        console.warn("The number of control points should be, at least, 2. The animation will not take effect.");
    if (span == null)   // include 'undefined'
        throw new Error("The animation time should be instantiated.");
    if (span < 0)
        throw new Error("The animation time cannot be negative.");

    this.controlpoints = controlpoints;
    this.span = span;   /* in seconds */

    var distance = 0;
    for (var i = 3; i < this.controlpoints.length; i += 3)
        distance += this.calculateLineLength(i - 3, i);
    this.velocity = distance / this.span;
    this.transform = mat4.create();
};

/* sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2) */
LinearAnimation.prototype.calculateLineLength = function (point1XIndex, point2XIndex) {
    var sum = 0;
    for (var i = 0, delta; i < 3; i++) {
        delta = this.controlpoints[point2XIndex + i] - this.controlpoints[point1XIndex + i];
        sum += delta * delta;
    }
    return Math.sqrt(sum);
}

/* cos(alfa) = ((x1, z1) . (x2, z2)) / (sqrt(x1^2 + z1^2) * sqrt(x2^2 + z2^2)) -> alfa in xOz */
LinearAnimation.prototype.calculateYAngle = function (vector1, vector2) {
    var crossProduct = 0;
    crossProduct += vector1[0] * vector2[0];
    crossProduct += vector1[2] * vector2[2];

    var lengthVector1 = vector1[0] * vector1[0] + vector1[2] * vector1[2];
    var lengthVector2 = vector2[0] * vector2[0] + vector2[2] * vector2[2];

    var cosAlfa = crossProduct / Math.sqrt(lengthVector1 * lengthVector2);

    return Math.acos(cosAlfa);
}

LinearAnimation.prototype.calculateGeometricTransformation = function (currTime) {
    if (this.controlpoints.length < 6)  /* static animation -> 6 = 2 points with 3 coordinates */
        return;

    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;   /* in seconds */
    var translation = [0, 0, 0];

    if (deltaTime <= this.span) {
        var newTotalDistanceDone = this.velocity * deltaTime;

        /* calculate what is the actual pair of control points ('i' will be the second control point) */
        var actualLineLength, i = 3, distanceCompletedLines = 0, stop = false;
        while (!stop) {
            actualLineLength = this.calculateLineLength(i - 3, i);
            if (distanceCompletedLines + actualLineLength <= newTotalDistanceDone) {
                distanceCompletedLines += actualLineLength;
                for (var j = 0; j < 3; j++)
                    translation[j] += (this.controlpoints[i + j] - this.controlpoints[i - 3 + j]);
                i += 3;
            }
            else stop = true;
        }

        var lineDistanceDone = newTotalDistanceDone - distanceCompletedLines;
        var lineDeltaTime = lineDistanceDone * this.velocity;
        var lineTime = actualLineLength * this.velocity;

        /* calculate the line point where the object must be placed */
        for (var j = 0; j < 3; j++)
            translation[j] += (this.controlpoints[i + j] - this.controlpoints[i - 3 + j]) * lineDeltaTime / lineTime;
    } else {
        var lastControlPoint = this.controlpoints.length - 3;
        for (var i = 0; i < 3; i++)
            translation[i] = [this.controlpoints[lastControlPoint + i]];
        this.done = true;
    }

    /* calculate Y rotation angle */
    var yRotationAngle = -this.calculateYAngle([1, 0, 0], translation);

    /* generate transformation matrix */
    this.transform = mat4.create();
    mat4.translate(this.transform, this.transform, translation);
    mat4.rotate(this.transform, this.transform, yRotationAngle, [0, 1, 0]);
}

LinearAnimation.prototype.getGeometricTransformation = function () {
    return this.transform;
}
