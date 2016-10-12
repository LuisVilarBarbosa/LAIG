
function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    // File reading 
    this.reader = new CGFXMLreader();

    /*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

    this.reader.open('scenes/' + filename, this);

    this.perspectives = [];
    this.textures = [];
    this.materials = [];
    this.transformations = [];
    this.primitives = [];
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function () {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseDSXFile(rootElement);

    if (error != null) {
        this.onXMLError(error);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};



MySceneGraph.prototype.verifyDSXFileStructure = function (rootElement) {
    var name;
    if (rootElement.children.length != 9) return "invalid number of 'dsx' children tags detected";
    if (name = rootElement.children[0].nodeName != 'scene') return "expected 'scene' tag instead of " + name;
    if (name = rootElement.children[1].nodeName != 'views') return "expected 'views' tag instead of " + name;
    if (name = rootElement.children[2].nodeName != 'illumination') return "expected 'illumination' tag instead of " + name;
    if (name = rootElement.children[3].nodeName != 'lights') return "expected 'lights' tag instead of " + name;
    if (name = rootElement.children[4].nodeName != 'textures') return "expected 'textures' tag instead of " + name;
    if (name = rootElement.children[5].nodeName != 'materials') return "expected 'materials' tag instead of " + name;
    if (name = rootElement.children[6].nodeName != 'transformations') return "expected 'transformations' tag instead of " + name;
    if (name = rootElement.children[7].nodeName != 'primitives') return "expected 'primitives' tag instead of " + name;
    if (name = rootElement.children[8].nodeName != 'components') return "expected 'components' tag instead of " + name;
    // verify subsequent tags
}

MySceneGraph.prototype.parseSceneTag = function (elem) {
    this.scene.rootNode = elem.attributes.getNamedItem("root").nodeValue;
    var axis_length = elem.attributes.getNamedItem("axis_length").nodeValue;
    this.scene.axis = new CGFaxis(this.scene, axis_length, 0.2);    // 0.2 = default thickness
}

MySceneGraph.prototype.parsePerspectiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var e = elems[i];

        var id = e.attributes.getNamedItem('id').nodeValue;
        var near = e.attributes.getNamedItem('near').nodeValue;
        var far = e.attributes.getNamedItem('far').nodeValue;
        var angle = e.attributes.getNamedItem('angle').nodeValue;
        var from_x = e.children[0].attributes.getNamedItem('x').nodeValue;
        var from_y = e.children[0].attributes.getNamedItem('y').nodeValue;
        var from_z = e.children[0].attributes.getNamedItem('z').nodeValue;
        var to_x = e.children[1].attributes.getNamedItem('x').nodeValue;
        var to_y = e.children[1].attributes.getNamedItem('y').nodeValue;
        var to_z = e.children[1].attributes.getNamedItem('z').nodeValue;
        var from = vec3.fromValues(from_x, from_y, from_z);
        var to = vec3.fromValues(to_x, to_y, to_z);

        this.perspectives[id] = new CGFcamera(angle, near, far, from, to);
    };
}

MySceneGraph.prototype.parseIlluminationTag = function (elem) {
    var doublesided = this.reader.getBoolean(elem, 'doublesided', true);
    var local = this.reader.getBoolean(elem, 'local', true);

    var ambientElems = elem.getElementsByTagName('ambient');
    if (ambientElems == null || ambientElems.length != 1)
        console.log("The number of 'ambient' tags is not 1");
    var ambient_r = ambientElems[0].attributes.getNamedItem('r').nodeValue;
    var ambient_g = ambientElems[0].attributes.getNamedItem('g').nodeValue;
    var ambient_b = ambientElems[0].attributes.getNamedItem('b').nodeValue;
    var ambient_a = ambientElems[0].attributes.getNamedItem('a').nodeValue;
    this.scene.setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);

    var backgroundElems = elem.getElementsByTagName('background');
    if (ambientElems == null || ambientElems.length != 1)
        console.log("The number of 'background' tags is not 1");
    var background_r = backgroundElems[0].attributes.getNamedItem('r').nodeValue;
    var background_g = backgroundElems[0].attributes.getNamedItem('g').nodeValue;
    var background_b = backgroundElems[0].attributes.getNamedItem('b').nodeValue;
    var background_a = backgroundElems[0].attributes.getNamedItem('a').nodeValue;
    this.background = [background_r, background_g, background_b, background_a];
}

MySceneGraph.prototype.parseLightsRelativeTags = function (elems, lightType, lightsArrayStartIndex) {
    if (lightType != 'omni' && lightType != 'spot')
        console.log("The light type '" + lightType + "' will be considered 'omni'")

    var lightsArrayIndex = lightsArrayStartIndex;
    for (var i = 0, nnodes = elems.length; i < nnodes; i++, lightsArrayIndex++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;    // not in use
        var enabled = this.reader.getBoolean(elems[i], 'enabled', true);

        var location = elems[i].getElementsByTagName('location');
        if (location == null || location.length != 1)
            console.log("The number of 'location' tags is not 1");
        var location_x = location[0].attributes.getNamedItem('x').nodeValue;
        var location_y = location[0].attributes.getNamedItem('y').nodeValue;
        var location_z = location[0].attributes.getNamedItem('z').nodeValue;
       
        var ambient = elems[i].getElementsByTagName('ambient');
        if (ambient == null || ambient.length != 1)
            console.log("The number of 'ambient' tags is not 1");
        var ambient_r = ambient[0].attributes.getNamedItem('r').nodeValue;
        var ambient_g = ambient[0].attributes.getNamedItem('g').nodeValue;
        var ambient_b = ambient[0].attributes.getNamedItem('b').nodeValue;
        var ambient_a = ambient[0].attributes.getNamedItem('a').nodeValue;

        var diffuse = elems[i].getElementsByTagName('diffuse');
        if (diffuse == null || diffuse.length != 1)
            console.log("The number of 'diffuse' tags is not 1");
        var diffuse_r = diffuse[0].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = diffuse[0].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = diffuse[0].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = diffuse[0].attributes.getNamedItem('a').nodeValue;

        var specular = elems[i].getElementsByTagName('specular');
        if (specular == null || specular.length != 1)
            console.log("The number of 'specular' tags is not 1");
        var specular_r = specular[0].attributes.getNamedItem('r').nodeValue;
        var specular_g = specular[0].attributes.getNamedItem('g').nodeValue;
        var specular_b = specular[0].attributes.getNamedItem('b').nodeValue;
        var specular_a = specular[0].attributes.getNamedItem('a').nodeValue;

        if (lightType == 'spot') {
            var target = elems[i].getElementsByTagName('target');
            if (target == null || target.length != 1)
                console.log("The number of 'target' tags is not 1");
            var target_x = target[0].attributes.getNamedItem('x').nodeValue;
            var target_y = target[0].attributes.getNamedItem('y').nodeValue;
            var target_z = target[0].attributes.getNamedItem('z').nodeValue;

            var direction_x = target_x - location_x;
            var direction_y = target_y - location_y;
            var direction_z = target_z - location_z;

            this.scene.lights[lightsArrayIndex].setSpotDirection(direction_x, direction_y, direction_z);
        }

        if (enabled)
            this.scene.lights[lightsArrayIndex].enable();
        else
            this.scene.lights[lightsArrayIndex].disable();
        this.scene.lights[lightsArrayIndex].setPosition(location_x, location_y, location_z);
        this.scene.lights[lightsArrayIndex].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.lights[lightsArrayIndex].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.lights[lightsArrayIndex].setSpecular(specular_r, specular_g, specular_b, specular_a);
    }

    return lightsArrayIndex;
}

MySceneGraph.prototype.parseTextureTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;
        var file = elems[i].attributes.getNamedItem('file').nodeValue;
        var length_s = elems[i].attributes.getNamedItem('length_s').nodeValue;
        var length_t = elems[i].attributes.getNamedItem('length_t').nodeValue;

        this.textures[id] = new CGFappearance(this.scene);
        this.textures[id].loadTexture(file);
        this.textures[id].setTextureWrap(length_s, length_t);
    }
}

MySceneGraph.prototype.parseMaterialTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;
        var emission_r = elems[i].children[0].attributes.getNamedItem('r').nodeValue;
        var emission_g = elems[i].children[0].attributes.getNamedItem('g').nodeValue;
        var emission_b = elems[i].children[0].attributes.getNamedItem('b').nodeValue;
        var emission_a = elems[i].children[0].attributes.getNamedItem('a').nodeValue;
        var ambient_r = elems[i].children[1].attributes.getNamedItem('r').nodeValue;
        var ambient_g = elems[i].children[1].attributes.getNamedItem('g').nodeValue;
        var ambient_b = elems[i].children[1].attributes.getNamedItem('b').nodeValue;
        var ambient_a = elems[i].children[1].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = elems[i].children[2].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = elems[i].children[2].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = elems[i].children[2].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = elems[i].children[2].attributes.getNamedItem('a').nodeValue;
        var specular_r = elems[i].children[3].attributes.getNamedItem('r').nodeValue;
        var specular_g = elems[i].children[3].attributes.getNamedItem('g').nodeValue;
        var specular_b = elems[i].children[3].attributes.getNamedItem('b').nodeValue;
        var specular_a = elems[i].children[3].attributes.getNamedItem('a').nodeValue;
        var shininess_value = elems[i].children[4].attributes.getNamedItem('value').nodeValue;

        this.materials[id] = new CGFappearance(this.scene);
        this.materials[id].setEmission(emission_r, emission_g, emission_b, emission_a);
        this.materials[id].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.materials[id].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.materials[id].setSpecular(specular_r, specular_g, specular_b, specular_a);
        if (shininess_value > 0)
            this.materials[id].setShininess(shininess_value);
    }
}

MySceneGraph.prototype.parseTransformationTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;
        this.transformations[id] = mat4.create();

        var operation = elems[i].children;
        for (var j = 0, ops = operation.length; j < ops; j++) {
            if (operation[j].tagName == 'translate') {
                var translate_x = operation[j].attributes.getNamedItem('x').nodeValue;
                var translate_y = operation[j].attributes.getNamedItem('y').nodeValue;
                var translate_z = operation[j].attributes.getNamedItem('z').nodeValue;
                mat4.translate(this.transformations[id], this.transformations[id], [translate_x, translate_y, translate_z]);
            }
            else if (operation[j].tagName == 'rotate') {
                var rotate_axis = operation[j].attributes.getNamedItem('axis').nodeValue;
                var rotate_angle = operation[j].attributes.getNamedItem('angle').nodeValue;
                if (rotate_axis == 'x' || rotate_axis == 'X')
                    mat4.rotate(this.transformations[id], this.transformations[id], rotate_angle, [1, 0, 0]);
                else if (rotate_axis == 'y' || rotate_axis == 'Y')
                    mat4.rotate(this.transformations[id], this.transformations[id], rotate_angle, [0, 1, 0]);
                else if (rotate_axis == 'z' || rotate_axis == 'Z')
                    mat4.rotate(this.transformations[id], this.transformations[id], rotate_angle, [0, 0, 1]);
                else
                    return "Invalid rotation axis: " + rotate_axis;
            }
            else if (operation[j].tagName == 'scale') {
                var scale_x = operation[j].attributes.getNamedItem('x').nodeValue;
                var scale_y = operation[j].attributes.getNamedItem('y').nodeValue;
                var scale_z = operation[j].attributes.getNamedItem('z').nodeValue;
                mat4.scale(this.transformations[id], this.transformations[id], [scale_x, scale_y, scale_z]);
            }
            else
                console.log("Invalid matricial operation: " + operation[j].tagName);
        }
    }
}

MySceneGraph.prototype.parsePrimitiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;

        var tempRectangleElems = elems[i].getElementsByTagName('rectangle');
        if (tempRectangleElems != null && tempRectangleElems.length == 1) {
            var x1 = tempRectangleElems[0].attributes.getNamedItem('x1').nodeValue;
            var y1 = tempRectangleElems[0].attributes.getNamedItem('y1').nodeValue;
            var x2 = tempRectangleElems[0].attributes.getNamedItem('x2').nodeValue;
            var y2 = tempRectangleElems[0].attributes.getNamedItem('y2').nodeValue;
            this.primitives[id] = new Rectangle(this.scene, x1, y1, x2, y2);
        }
        var tempTriangleElems = elems[i].getElementsByTagName('triangle');
        if (tempTriangleElems != null && tempTriangleElems.length == 1) {
            var x1 = tempTriangleElems[0].attributes.getNamedItem('x1').nodeValue;
            var y1 = tempTriangleElems[0].attributes.getNamedItem('y1').nodeValue;
            var z1 = tempTriangleElems[0].attributes.getNamedItem('z1').nodeValue;
            var x2 = tempTriangleElems[0].attributes.getNamedItem('x2').nodeValue;
            var y2 = tempTriangleElems[0].attributes.getNamedItem('y2').nodeValue;
            var z2 = tempTriangleElems[0].attributes.getNamedItem('z2').nodeValue;
            var x3 = tempTriangleElems[0].attributes.getNamedItem('x3').nodeValue;
            var y3 = tempTriangleElems[0].attributes.getNamedItem('y3').nodeValue;
            var z3 = tempTriangleElems[0].attributes.getNamedItem('z3').nodeValue;
            this.primitives[id] = new Triangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
        }
        var tempCylinderElems = elems[i].getElementsByTagName('cylinder');
        if (tempCylinderElems != null && tempCylinderElems.length == 1) {
            var base = tempCylinderElems[0].attributes.getNamedItem('base').nodeValue;
            var top = tempCylinderElems[0].attributes.getNamedItem('top').nodeValue;
            var height = tempCylinderElems[0].attributes.getNamedItem('height').nodeValue;
            var slices = tempCylinderElems[0].attributes.getNamedItem('slices').nodeValue;
            var stacks = tempCylinderElems[0].attributes.getNamedItem('stacks').nodeValue;
        }
        var tempSphereElems = elems[i].getElementsByTagName('sphere');
        if (tempSphereElems != null && tempSphereElems.length == 1) {
            var radius = tempSphereElems[0].attributes.getNamedItem('radius').nodeValue;
            var slices = tempSphereElems[0].attributes.getNamedItem('slices').nodeValue;
            var stacks = tempSphereElems[0].attributes.getNamedItem('stacks').nodeValue;
        }
        var tempTorusElems = elems[i].getElementsByTagName('torus');
        if (tempTorusElems != null && tempTorusElems.length == 1) {
            var inner = tempTorusElems[0].attributes.getNamedItem('inner').nodeValue;
            var outer = tempTorusElems[0].attributes.getNamedItem('outer').nodeValue;
            var slices = tempTorusElems[0].attributes.getNamedItem('slices').nodeValue;
            var loops = tempTorusElems[0].attributes.getNamedItem('loops').nodeValue;
        }
    }
}

MySceneGraph.prototype.parseComponentTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = elems[i].attributes.getNamedItem('id').nodeValue;
        this.scene.graph[id] = new Node();

        /* 'transformation' tags loading */
        var tempTransformationElems = elems[i].getElementsByTagName('transformation');
        if (tempTransformationElems == null || tempTransformationElems.length == 0)
            return "'transformation' element is missing.";
        // transformationref and transformation loading to do
        // this.scene.graph[id].setMatrix();

        /* 'materials' tags loading */
        var tempMaterialsElems = elems[i].getElementsByTagName('materials');
        if (tempMaterialsElems == null || tempMaterialsElems.length == 0)
            return "'materials' element is missing.";

        /* 'material' tags loading */
        var tempMaterialElems = elems[i].getElementsByTagName('material');
        if (tempMaterialElems == null || tempMaterialElems.length == 0)
            return "'material' element is missing.";
        for (var i = 0, nnodes2 = tempMaterialElems.length; i < nnodes2; i++) {
            var material = tempMaterialElems[i].attributes.getNamedItem('id').nodeValue;
            if(material != "inherit")   // it is considered that if "inherit" is declared, no more materials exist
                this.scene.graph[id].addMaterial(this.materials[material]);
        }

        /* 'texture' tags loading */
        var tempTextureElems = elems[i].getElementsByTagName('texture');
        if (tempTextureElems == null || tempTextureElems.length != 1)
            return "'texture' tag misbehavior.";
        var texture = tempTextureElems[0].attributes.getNamedItem('id').nodeValue;
        this.scene.graph[id].setTexture(this.textures[texture]);

        /* 'children' tags loading */
        var tempChildrenElems = elems[i].getElementsByTagName('children');
        if (tempChildrenElems == null || tempChildrenElems.length != 1)
            return "'children' tag misbehavior.";
        for (var i = 0, nnodes2 = tempChildrenElems.length; i < nnodes2; i++) {
            /* 'componentref' and 'primitiveref' tags loading */
            var tempComponentrefElems = tempChildrenElems[i].getElementsByTagName('componentref');
            var tempPrimitiverefElems = tempChildrenElems[i].getElementsByTagName('primitiveref');
            if ((tempComponentrefElems == null || tempComponentrefElems.length == 0) &&
                (tempPrimitiverefElems == null || tempPrimitiverefElems.length == 0))
                return "'componentref' or 'primitiveref' element is missing";
            else {
                for (var i = 0, nnodes3 = tempComponentrefElems.length; i < nnodes3; i++)
                    this.scene.graph[id].push(tempComponentrefElems[i].attributes.getNamedItem('id').nodeValue);

                // more than one primitive must be allowed and verify if it is stored the name or the primitive itself
                for (var i = 0, nnodes3 = tempPrimitiverefElems.length; i < nnodes3; i++)
                    this.scene.graph[id].primitive = this.primitives[tempPrimitiverefElems[i].attributes.getNamedItem('id').nodeValue];
            }
        }
    }
}

MySceneGraph.prototype.parseDSXFile = function (rootElement) {
    var error = this.verifyDSXFileStructure(rootElement);
    if (error != null)
        return error;

    /* 'scene' tags loading */
    var tempSceneElems = rootElement.getElementsByTagName('scene');
    if (tempSceneElems == null || tempSceneElems.length != 1)
        return "'scene' tag misbehavior.";
    this.parseSceneTag(tempSceneElems[0]);

    /* 'views' tags loading */
    var tempViewsElems = rootElement.getElementsByTagName('views');
    if (tempViewsElems == null || tempViewsElems.length != 1) {
        return "'views' tag misbehavior.";
    }
    var default_view = tempViewsElems[0].attributes.getNamedItem("default").nodeValue;

    /* 'perspective' tags loading */
    var tempPerspectiveElems = rootElement.getElementsByTagName('perspective');
    if (tempPerspectiveElems == null || tempPerspectiveElems.length == 0) {
        return "'perspective' element is missing.";
    }
    this.parsePerspectiveTags(tempPerspectiveElems)
    this.scene.camera = this.perspectives[default_view];

    /* 'illumination' tags loading */
    var tempIlluminationElems = rootElement.getElementsByTagName('illumination');
    if (tempIlluminationElems == null || tempIlluminationElems.length != 1)
        return "'illumination' tag misbehavior.";
    this.parseIlluminationTag(tempIlluminationElems[0]);

    /* 'lights' tags loading */
    var tempLightsElems = rootElement.getElementsByTagName('lights');
    if (tempLightsElems == null || tempLightsElems.length != 1)
        return "'lights' tag misbehavior.";

    /* 'omni' and 'spot' tags loading */
    var tempOmniElems = tempLightsElems[0].getElementsByTagName('omni');
    var tempSpotElems = tempLightsElems[0].getElementsByTagName('spot');
    if ((tempOmniElems == null || tempOmniElems.length == 0) &&
        (tempSpotElems == null || tempSpotElems.length == 0))
        return "'omni' or 'spot' element is missing.";
    var lastUsedIndex = this.parseLightsRelativeTags(tempOmniElems, 'omni', 0);
    this.parseLightsRelativeTags(tempSpotElems, 'spot', lastUsedIndex + 1);

    /* 'textures' tags loading */
    var tempTexturesElems = rootElement.getElementsByTagName('textures')
    if (tempTexturesElems == null || tempTexturesElems.length != 1)
        return "'textures' tag misbehavior.";

    /* 'texture' tags loading */
    var tempTextureElems = tempTexturesElems[0].getElementsByTagName('texture');
    if (tempTextureElems == null || tempTextureElems.length == 0)
        return "'texture' element is missing.";
    this.parseTextureTags(tempTextureElems);

    /* 'materials' tags loading */
    var tempMaterialsElems = rootElement.getElementsByTagName('materials')
    if (tempMaterialsElems == null || tempMaterialsElems.length == 0)
        return "'materials' tag misbehavior.";

    /* 'material' tags loading */
    var tempMaterialElems = tempMaterialsElems[0].getElementsByTagName('material');
    if (tempMaterialElems == null || tempMaterialElems.length == 0)
        return "'material' element is missing.";
    this.parseMaterialTags(tempMaterialElems);

    /* 'transformations' tags loading */
    var tempTransformationsElems = rootElement.getElementsByTagName('transformations')
    if (tempTransformationsElems == null || tempTransformationsElems.length != 1)
        return "'transformations' tag misbehavior.";

    /* 'transformation' tags loading */
    var tempTransformationElems = tempTransformationsElems[0].getElementsByTagName('transformation');
    if (tempTransformationElems == null || tempTransformationElems.length == 0)
        return "'transformation' element is missing.";
    this.parseTransformationTags(tempTransformationElems);

    /* 'primitives' tags loading */
    var tempPrimitivesElems = rootElement.getElementsByTagName('primitives')
    if (tempPrimitivesElems == null || tempPrimitivesElems.length != 1)
        return "'primitives' tag misbehavior.";

    /* 'primitive' tags loading */
    var tempPrimitiveElems = tempPrimitivesElems[0].getElementsByTagName('primitive');
    if (tempPrimitiveElems == null || tempPrimitiveElems.length == 0)
        return "'primitive' element is missing.";
    this.parsePrimitiveTags(tempPrimitiveElems);

    /* 'components' tags loading */
    var tempComponentsElems = rootElement.getElementsByTagName('components')
    if (tempComponentsElems == null || tempComponentsElems.length != 1)
        return "'components' tag misbehavior.";

    /* 'component' tags loading */
    var tempComponentElems = tempComponentsElems[0].getElementsByTagName('component');
    if (tempComponentElems == null || tempComponentElems.length == 0)
        return "'component' element is missing.";
    this.parseComponentTags(tempComponentElems);
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};


