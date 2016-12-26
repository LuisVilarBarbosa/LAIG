/**
 * ScalarAnimation
 * @constructor
 */
function ScalarAnimation(span, scale) {
    Animation.call(this);
    if (span == null)   // include 'undefined'
        throw this.constructor.name + ": The animation span should be instantiated.";
    if (span < 0)
        throw this.constructor.name + ": The animation span cannot be negative.";
    if (scale == null)
        throw this.constructor.name + ": The animation scale should be instantiated.";
    if (scale.length != 3)
        throw this.constructor.name + ": Invalid scale. The scale must have 3 components (xyz).";
    for (var i = 0; i < 3; i++)
        if (scale[i] < 0)
            throw this.constructor.name + ": Invalid scale component. All components must be greater or equal to 0.";

    this.span = span;   /* in seconds */
    this.scale = scale;

    this.transform = mat4.create();
};

ScalarAnimation.prototype.calculateGeometricTransformation = function (currTime) {
    if (this.done === true)
        return;

    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;   /* in seconds */
    this.transform = mat4.create();

    if (deltaTime <= this.span) {
        var ratio = deltaTime / this.span;
        var newScale = [];
        for (var i = 0; i < 3; i++)
            newScale.push(1 + (this.scale[i] - 1) * ratio);
        mat4.scale(this.transform, this.transform, newScale);
    } else {
        mat4.scale(this.transform, this.transform, this.scale);
        this.done = true;
    }
}

ScalarAnimation.prototype.getGeometricTransformation = function () {
    return this.transform;
}
