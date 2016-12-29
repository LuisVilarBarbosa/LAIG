
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

    this.gl.frontFace(this.gl.CCW);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.cullFace(this.gl.BACK);

    this.enableTextures(true);
    this.axis = new CGFaxis(this);
    this.lightsIds = [];

    this.defaultAppearance = new CGFappearance(this);
    this.defaultAppearance.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.defaultAppearance.setShininess(10.0);
	
	this.green = new CGFappearance(this);
    this.green.setAmbient(0, 0.39, 0, 1);
    this.green.setDiffuse(0, 0.39, 0, 1);
    this.green.setSpecular(0, 0.39, 0, 1);
    this.green.setShininess(10.0);
	
	this.red = new CGFappearance(this);
    this.red.setAmbient(0.4, 0, 0, 1);
    this.red.setDiffuse(0.4, 0, 0, 1);
    this.red.setSpecular(0.4, 0, 0, 1);
    this.red.setShininess(10.0);
	
	this.blue = new CGFappearance(this);
    this.blue.setAmbient(0, 0, 0.6, 1);
    this.blue.setDiffuse(0, 0, 0.6, 1);
    this.blue.setSpecular(0, 0, 0.6, 1);
    this.blue.setShininess(10.0);
	
	this.yellow = new CGFappearance(this);
    this.yellow.setAmbient(0.7, 0.7, 0, 1);
    this.yellow.setDiffuse(0.7, 0.7, 0, 1);
    this.yellow.setSpecular(0.7, 0.7, 0, 1);
    this.yellow.setShininess(10.0);
	
	this.nova = new CGFappearance(this);
    this.nova.setAmbient(0.8, 0.8, 0.8, 1);
    this.nova.setDiffuse(0.8, 0.8, 0.8, 1);
    this.nova.setSpecular(0.8, 0.8, 0.8, 1);
    this.nova.setShininess(10.0);
	this.nova.loadTexture('images/nodes_board.PNG');

    this.rootNodeId = null;
    this.perspectives = [];
    this.perspectivesIds = [];
    this.actualPerspectivesIdsIndex = 0;
    this.textures = [];
    this.materials = [];
    this.transformations = [];
    this.primitives = [];
    this.sceneGraph = [];
    this.animations = [];

    this.materialsStack = new Stack(this.defaultAppearance);
    this.texturesStack = new Stack(null);

    this.updatePeriod = 25; /* millis */
    this.setUpdatePeriod(this.updatePeriod);

    this.changesToNextView = 0;  // number of changes to the next view

    this.game = new NodesGame(this);
    this.modes = ["cc", "ch", "hh"];
    this.mode = 0;
    this.levels = ["easy", "hard"];
    this.level = 1;
	
	this.setPickEnabled(true);
	
	this.snow_scene = new MySnowScene(this);
};


XMLscene.prototype.logPicking = function ()
{
	
	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			for (var i=0; i< this.pickResults.length; i++) {
				var obj = this.pickResults[i][0];
				
				if (obj)
				{
					var customId = this.pickResults[i][1];
					this.game.pickingHandler(customId);
					
				}
			}
			this.pickResults.splice(0,this.pickResults.length);
		}		
	}
}

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
	this.logPicking();
	this.clearPickRegistration();
	
	
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
            this.lights[i].update();    // lights are being enabled and disabled directly by the interface

        //this.processGraph(this.rootNodeId);
    };
	
	this.game.display();
	this.snow_scene.display();
};

XMLscene.prototype.setRootNodeId = function (nodeId) {
    this.rootNodeId = nodeId;
}

XMLscene.prototype.setAxis = function (axis) {
    this.axis = axis;
}

XMLscene.prototype.addPerspective = function (id, camera) {
    this.perspectives[id] = camera;
    this.perspectivesIds.push(id);
}

XMLscene.prototype.setDefaultPerspective = function (id) {
    this.actualPerspectivesIdsIndex = -1;
    for (var i = 0; i < this.perspectivesIds.length; i++) {
        if (this.perspectivesIds[i] == id) {
            this.actualPerspectivesIdsIndex = i;
            break;
        }
    }

    if (this.actualPerspectivesIdsIndex == -1) {
        console.warn("Perspective not found when defining the default perspective: '" + id + "'.");
        this.actualPerspectivesIdsIndex = 0;
    }
    else
        this.camera = this.perspectives[this.perspectivesIds[this.actualPerspectivesIdsIndex]];
    this.myInterface.setActiveCamera(this.camera);
}

/* 'angle', 'exponent' and 'target' will be undefined when 'lightType' equal to 'omni' */
XMLscene.prototype.setLight = function (lightType, lightsArrayIndex, id, enabled, location, ambient, diffuse, specular, angle, exponent, target) {
    this.lightsIds[lightsArrayIndex] = id;
    if (enabled)
        this.lights[lightsArrayIndex].enable();
    else
        this.lights[lightsArrayIndex].disable();

    if (lightType != "spot")
        this.lights[lightsArrayIndex].setPosition(location[0], location[1], location[2], location[3]);
    else
        // If w=1, then it's a positional light source. If w=0, it's a directional light source.
        this.lights[lightsArrayIndex].setPosition(location[0], location[1], location[2], 0);

    this.lights[lightsArrayIndex].setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
    this.lights[lightsArrayIndex].setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
    this.lights[lightsArrayIndex].setSpecular(specular[0], specular[1], specular[2], specular[3]);
    this.lights[lightsArrayIndex].setVisible(true);
    this.myInterface.addLight(id, this.lights[lightsArrayIndex], lightType);

    if (lightType == "spot") {
        var direction = [];
        direction[0] = target[0] - location[0];
        direction[1] = target[1] - location[1];
        direction[2] = target[2] - location[2];

        this.lights[lightsArrayIndex].setSpotCutOff(angle);
        this.lights[lightsArrayIndex].setSpotDirection(direction[0], direction[1], direction[2]);
        this.lights[lightsArrayIndex].setSpotExponent(exponent);
    }
}

XMLscene.prototype.addTexture = function (id, texture) {
    this.textures[id] = texture;
}

XMLscene.prototype.addMaterial = function (id, material) {
    this.materials[id] = material;
}

XMLscene.prototype.addTransformation = function (id, transformation) {
    this.transformations[id] = transformation;
}

XMLscene.prototype.addPrimitive = function (id, primitive) {
    this.primitives[id] = primitive;
}

XMLscene.prototype.addNode = function (id, node) {
    this.sceneGraph[id] = node;
}

XMLscene.prototype.addAnimation = function (id, animation) {
    this.animations[id] = animation;
}

XMLscene.prototype.processGraph = function (nodeId) {
    var material = null;
    var texture = null;
    if (nodeId != null) {
        var node = this.sceneGraph[nodeId];
        var nodeMaterialId = node.getMaterialId();
        if (nodeMaterialId == "inherit")
            material = this.materialsStack.top();
        else
            material = this.materials[nodeMaterialId];
        if (node.texture == "none")
            texture = null;
        else if (node.texture == "inherit")
            texture = this.texturesStack.top();
        else
            texture = this.textures[node.texture];

        material.setTexture(texture);
        material.apply();

        var animationId = node.getAnimation();
        if (animationId != null) {
            var animation = this.animations[animationId];
            this.multMatrix(animation.getGeometricTransformation());
        }

        this.multMatrix(node.mat);

        for (var i = 0; i < node.primitives.length; i++) {
            var primitive = this.primitives[node.primitives[i]];
            if (texture != null)
                primitive.setTextureCoordinates(texture.length_s, texture.length_t);
            primitive.display();
        }
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
    this.changesToNextView++;
}

XMLscene.prototype.nextMaterial = function (nodeId) {
    if (nodeId === undefined)
        this.nextMaterial(this.rootNodeId);
    else {
        var node = this.sceneGraph[nodeId];
        node.nextMaterialId();
        for (var i = 0, length = node.children.length; i < length; i++)
            this.nextMaterial(node.children[i]);
    }
}

XMLscene.prototype.update = function (currTime) {
    if (this.graph.loadedOk)
        this.updateAux(currTime, this.rootNodeId);

    this.game.update(currTime);
    this.game.setMode(this.modes[this.mode]);
    this.game.setLevel(this.levels[this.level]);

    this.updateView(currTime);
}

// Variables access is like in 'processGraph', so it is already simulated.
XMLscene.prototype.updateAux = function (currTime, nodeId) {
    var node = this.sceneGraph[nodeId];
    var animationId = node.getAnimation();

    if (animationId != null) {
        var animation = this.animations[animationId];
        animation.calculateGeometricTransformation(currTime);
        if (animation.done) {
            node.nextAnimation();
            this.animations[node.getAnimation()].calculateGeometricTransformation(currTime);
        }
    }

    for (var i = 0; i < node.children.length; i++)
        this.updateAux(currTime, node.children[i]);
}

XMLscene.prototype.updateView = function (currTime) {
    if (this.changesToNextView > 0) {
        var transitionTime = 1000;

        this.firstTime = this.firstTime || currTime;
        var deltaTime = currTime - this.firstTime;
        var ratio = deltaTime / transitionTime;
        if (ratio > 1) ratio = 1;

        if (this.origPerspective == null || this.nextPerspective == null) {
            this.origPerspective = this.perspectives[this.perspectivesIds[this.actualPerspectivesIdsIndex]];
            this.nextPerspectivesIdsIndex = (this.actualPerspectivesIdsIndex + 1) % this.perspectivesIds.length;
            this.nextPerspective = this.perspectives[this.perspectivesIds[this.nextPerspectivesIdsIndex]];
        }
        
        var angle = this.origPerspective.fov + (this.nextPerspective.fov - this.origPerspective.fov) * ratio;
        var near = this.origPerspective.near + (this.nextPerspective.near - this.origPerspective.near) * ratio;
        var far = this.origPerspective.far + (this.nextPerspective.far - this.origPerspective.far) * ratio;
        var from = [], to = [];
        for (var i = 0; i < 3; i++) {
            from.push(this.origPerspective.position[i] + (this.nextPerspective.position[i] - this.origPerspective.position[i]) * ratio);
            to.push(this.origPerspective.target[i] + (this.nextPerspective.target[i] - this.origPerspective.target[i]) * ratio);
        }
        this.camera = new CGFcamera(angle, near, far, from, to);
        this.myInterface.setActiveCamera(this.camera);

        if (ratio == 1) {
            this.changesToNextView--;
            this.firstTime = null;
            this.origPerspective = null;
            this.actualPerspectivesIdsIndex = this.nextPerspectivesIdsIndex;
            this.nextPerspective = null;
        }
    }
}

XMLscene.prototype.setGameMode = function (mode) {
    this.game.setMode(mode);
}

XMLscene.prototype.setGameLevel = function (level) {
    this.game.setLevel(level);
}
