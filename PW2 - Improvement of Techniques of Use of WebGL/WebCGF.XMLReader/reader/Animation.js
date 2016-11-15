/**
 * Animation
 * @constructor
 * @abstract
 */
function Animation() {
    if (this.constructor === Animation)
        throw new Error("Can't instantiate abstract class!");
    this.done = false;  // indicates if the animation ended
};

/**
 @abstract
 Must set 'this.done' as true when the animation is ended
 */
Animation.prototype.calculateGeometricTransformation = function () {
    throw new Error("Abstract method!");
}

/**
 @abstract
 */
Animation.prototype.getGeometricTransformation = function () {
    throw new Error("Abstract method!");
}
