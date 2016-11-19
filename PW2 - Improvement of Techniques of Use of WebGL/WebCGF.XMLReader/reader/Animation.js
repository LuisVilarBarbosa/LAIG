/**
 * Animation
 * @constructor
 * @abstract
 */
function Animation() {
    if (this.constructor === Animation)
        throw this.constructor.name + ": Can't instantiate abstract class!";
    this.done = false;  // indicates if the animation ended
};

/**
 @abstract
 Must set 'this.done' as true when the animation is ended
 */
Animation.prototype.calculateGeometricTransformation = function () {
    throw this.constructor.name + ": Abstract method!";
}

/**
 @abstract
 */
Animation.prototype.getGeometricTransformation = function () {
    throw this.constructor.name + ": Abstract method!";
}
