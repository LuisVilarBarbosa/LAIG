
function XMLscene(myInterface) {
    CGFscene.call(this);
    this.myInterface = myInterface;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);
    this.axis = new CGFaxis(this);
    this.lightsIds = [];

    this.defaultAppearance = new CGFappearance(this);
    this.defaultAppearance.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setShininess(10.0);

    this.materialsStack = new Stack(this.defaultAppearance);
    this.texturesStack = new Stack(null);
};

XMLscene.prototype.initLights = function () {

    this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.defaultAppearance.apply();
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
    this.lights[0].setVisible(true);
    this.lights[0].enable();
};

XMLscene.prototype.display = function () {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    this.axis.display();

    this.setDefaultAppearance();

    // ---- END Background, camera and axis setup

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) {
        for (var i = 0, length = this.lights.length; i < length; i++)
            this.lights[i].update();
        this.processGraph(this.graph.rootNode);
    };
};

XMLscene.prototype.setAxis = function (axis) {
    this.axis = axis;
}

XMLscene.prototype.processGraph = function (nodeName) {
    var material = null;
    var texture = null;
    if (nodeName != null) {
        var node = this.graph[nodeName];
        var nodeMaterialId = node.getMaterialId();
        if (nodeMaterialId == "inherit")
            material = this.materialsStack.top();
        else
            material = this.graph.materials[nodeMaterialId];
        if (material === undefined)
            console.log("'material' is undefined");
        if (node.texture == "none")
           texture = null;
        else if (node.texture == "inherit")
            texture = this.texturesStack.top();
        else
            texture = this.graph.textures[node.texture];

        material.setTexture(texture);
        material.apply();

        this.multMatrix(node.mat);
        for (var i = 0; i < node.primitives.length; i++)
            if (this.graph.primitives[node.primitives[i]] === undefined)
                console.log("'" + node.primitives[i] + "' is not a primitive"); // cyclic verification
            else
                this.graph.primitives[node.primitives[i]].display();
        for (var i = 0; i < node.children.length; i++) {
            this.pushMatrix();
            this.materialsStack.push(material);
            this.texturesStack.push(texture);
            this.processGraph(node.children[i]);
            this.texturesStack.pop();
            this.materialsStack.pop();
            this.popMatrix();
        }
    }
}

XMLscene.prototype.nextView = function () {
    this.graph.actualPerspectivesIdsIndex = (this.graph.actualPerspectivesIdsIndex + 1) % this.graph.perspectivesIds.length;
    this.camera = this.graph.perspectives[this.graph.perspectivesIds[this.graph.actualPerspectivesIdsIndex]];
}

XMLscene.prototype.nextMaterial = function (nodeName) {
    if (nodeName === undefined)
        this.nextMaterial(this.graph.rootNode);
    else {
        var node = this.graph[nodeName];
        node.nextMaterialId();
        for (var i = 0, length = node.children.length; i < length; i++)
            this.nextMaterial(node.children[i]);
    }
}
