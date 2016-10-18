
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

    this.degToRad = Math.PI / 180;
    this.rootNode = null;
    this.perspectives = [];
    this.perspectivesIds = [];
    this.actualPerspectivesIdsIndex = 0;
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
    if (rootElement.children.length != 9) return "invalid number of 'dsx' children tags detected (verify if all the elements begin with <tag> and end </tag>)";
    if ((name = rootElement.children[0].nodeName) != 'scene') return "expected 'scene' tag instead of " + name;
    if ((name = rootElement.children[1].nodeName) != 'views') return "expected 'views' tag instead of " + name;
    if ((name = rootElement.children[2].nodeName) != 'illumination') return "expected 'illumination' tag instead of " + name;
    if ((name = rootElement.children[3].nodeName) != 'lights') return "expected 'lights' tag instead of " + name;
    if ((name = rootElement.children[4].nodeName) != 'textures') return "expected 'textures' tag instead of " + name;
    if ((name = rootElement.children[5].nodeName) != 'materials') return "expected 'materials' tag instead of " + name;
    if ((name = rootElement.children[6].nodeName) != 'transformations') return "expected 'transformations' tag instead of " + name;
    if ((name = rootElement.children[7].nodeName) != 'primitives') return "expected 'primitives' tag instead of " + name;
    if ((name = rootElement.children[8].nodeName) != 'components') return "expected 'components' tag instead of " + name;
}

MySceneGraph.prototype.getAllDSXFileIds = function (elem, ids) {
    if (elem != null && elem.nodeName != "components") {
        var id = this.reader.getString(elem, "id", false);  // 'false' because not all nodes have ids
        if (id != null)
            ids.push(id);

        if (elem.children != null) {
            for (var i = 0, length = elem.children.length; i < length; i++)
                this.getAllDSXFileIds(elem.children[i], ids);
        }
    }
}

MySceneGraph.prototype.verifyDSXFileIds = function (rootElement) {
    if (rootElement != null) {
        var ids = [];
        this.getAllDSXFileIds(rootElement, ids);
        ids.sort();

        for (var i = 1, length = ids.length; i < length; i++)
            if (ids[i - 1] == ids[i])
                console.log("'" + ids[i] + "' is not an unique id");
    }
}

MySceneGraph.prototype.findOneChild = function (elem, tagNameToFind) {  /* calls to this function must return if this function returns null */
    var elems = elem.getElementsByTagName(tagNameToFind);
    if (elems == null || elems.length != 1) {
        console.log("either zero or more than one '" + tagNameToFind + "' element found");
        return null;
    }
    return elems[0];
}

MySceneGraph.prototype.findChildren = function (elem, tagNameToFind) {  /* calls to this function must return if this function returns null */
    var elems = elem.getElementsByTagName(tagNameToFind);
    if (elems == null || elems.length == 0) {
        console.log("zero '" + tagNameToFind + "' element found");
        return null;
    }
    return elems;
}

MySceneGraph.prototype.getFloatsXYZ = function (elem) {
    var array = [];
    array.push(this.reader.getFloat(elem, "x", true));
    array.push(this.reader.getFloat(elem, "y", true));
    array.push(this.reader.getFloat(elem, "z", true));
    return array;
}

MySceneGraph.prototype.getFloatsRGBA = function (elem) {
    var array = [];
    array.push(this.reader.getFloat(elem, "r", true));
    array.push(this.reader.getFloat(elem, "g", true));
    array.push(this.reader.getFloat(elem, "b", true));
    array.push(this.reader.getFloat(elem, "a", true));
    return array;
}

MySceneGraph.prototype.parseSceneTag = function (elem) {
    this.rootNode = this.reader.getString(elem, "root", true);
    var axis_length = this.reader.getFloat(elem, "axis_length", true);
    this.scene.setAxis(new CGFaxis(this.scene, axis_length));
}

MySceneGraph.prototype.parsePerspectiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var e = elems[i];
        var id = this.reader.getString(e, "id", true);
        var near = this.reader.getFloat(e, "near", true);
        var far = this.reader.getFloat(e, "far", true);
        var angle = this.reader.getFloat(e, "angle", true) * this.degToRad;

        var fromElem = this.findOneChild(e, "from");
        var from = this.getFloatsXYZ(fromElem);

        var toElem = this.findOneChild(e, "to");
        var to = this.getFloatsXYZ(toElem);

        var from = vec3.fromValues(from[0], from[1], from[2]);
        var to = vec3.fromValues(to[0], to[1], to[2]);

        this.perspectives[id] = new CGFcamera(angle, near, far, from, to);
        this.perspectivesIds.push(id);
    };
}

MySceneGraph.prototype.parseIlluminationTag = function (elem) {
    var doublesided = this.reader.getBoolean(elem, "doublesided", true);
    var local = this.reader.getBoolean(elem, "local", true);
    // apply values

    var ambientElem = this.findOneChild(elem, "ambient");
    var ambient = this.getFloatsRGBA(ambientElem);
    this.scene.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);

    var backgroundElem = this.findOneChild(elem, "background");
    var background = this.getFloatsRGBA(backgroundElem);
    this.background = [background[0], background[1], background[2], background[3]];
}

MySceneGraph.prototype.parseLightsRelativeTags = function (elems, lightType, lightsArrayStartIndex) {
    if (lightType != "omni" && lightType != "spot")
        console.log("the light type '" + lightType + "' will be considered 'omni'")
    var lightsArrayIndex = lightsArrayStartIndex;
    var nnodes = elems.length;
    if ((lightsArrayStartIndex - 1 + nnodes) >= 8) {
        console.log("WebGL only accepts 8 lights. The first 8 lights will be loaded, the others not.");
        nnodes = 8 - lightsArrayStartIndex;
    }

    for (var i = 0; i < nnodes; i++, lightsArrayIndex++) {
        var id = this.reader.getString(elems[i], "id", true);
        var enabled = this.reader.getBoolean(elems[i], "enabled", true);

        var locationElem = this.findOneChild(elems[i], "location");
        var location = this.getFloatsXYZ(locationElem);

        var ambientElem = this.findOneChild(elems[i], "ambient");
        var ambient = this.getFloatsRGBA(ambientElem);

        var diffuseElem = this.findOneChild(elems[i], "diffuse");
        var diffuse = this.getFloatsRGBA(diffuseElem);

        var specularElem = this.findOneChild(elems[i], "specular");
        var specular = this.getFloatsRGBA(specularElem);

        if (lightType == "spot") {
            var angle = this.reader.getFloat(elems[i], "angle", true) * this.degToRad;
            var exponent = this.reader.getFloat(elems[i], "exponent", true);

            var targetElem = this.findOneChild(elems[i], "target");
            var target = this.getFloatsXYZ(targetElem);

            var direction = [];
            direction[0] = target[0] - location[0];
            direction[1] = target[1] - location[1];
            direction[2] = target[2] - location[2];

            this.scene.lights[lightsArrayIndex].setSpotCutOff(angle);
            this.scene.lights[lightsArrayIndex].setSpotDirection(direction[0], direction[1], direction[2]);
            this.scene.lights[lightsArrayIndex].setSpotExponent(exponent);
        }

        this.scene.lightsIds[lightsArrayIndex] = id;
        if (enabled)
            this.scene.lights[lightsArrayIndex].enable();
        else
            this.scene.lights[lightsArrayIndex].disable();
        this.scene.lights[lightsArrayIndex].setPosition(location[0], location[1], location[2]);
        this.scene.lights[lightsArrayIndex].setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
        this.scene.lights[lightsArrayIndex].setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
        this.scene.lights[lightsArrayIndex].setSpecular(specular[0], specular[1], specular[2], specular[3]);
        this.scene.myInterface.addLight(this.scene.lights[lightsArrayIndex], id);
    }

    return lightsArrayIndex;
}

MySceneGraph.prototype.parseTextureTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        var file = this.reader.getString(elems[i], "file", true);
        var length_s = this.reader.getFloat(elems[i], "length_s", true);
        var length_t = this.reader.getFloat(elems[i], "length_t", true);

        this.textures[id] = new CGFtexture(this.scene, file, length_s, length_t);
    }
}

MySceneGraph.prototype.parseMaterialTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);

        var emissionElem = this.findOneChild(elems[i], "emission");
        var emission = this.getFloatsRGBA(emissionElem);

        var ambientElem = this.findOneChild(elems[i], "ambient");
        var ambient = this.getFloatsRGBA(ambientElem);

        var diffuseElem = this.findOneChild(elems[i], "diffuse");
        var diffuse = this.getFloatsRGBA(diffuseElem);

        var specularElem = this.findOneChild(elems[i], "specular");
        var specular = this.getFloatsRGBA(specularElem);

        var shininessElem = this.findOneChild(elems[i], "shininess");
        var shininess_value = this.reader.getFloat(shininessElem, "value", true);

        this.materials[id] = new CGFappearance(this.scene);
        this.materials[id].setEmission(emission[0], emission[1], emission[2], emission[3]);
        this.materials[id].setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
        this.materials[id].setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
        this.materials[id].setSpecular(specular[0], specular[1], specular[2], specular[3]);
        if (shininess_value > 0)
            this.materials[id].setShininess(shininess_value);
    }
}

MySceneGraph.prototype.parseTransformationTag = function (elem, matrix) {
    var operation = elem.children;
    for (var i = 0, length = operation.length; i < length; i++) {
        if (operation[i].tagName == "translate") {
            var translate = this.getFloatsXYZ(operation[i]);
            mat4.translate(matrix, matrix, translate);
        }
        else if (operation[i].tagName == "rotate") {
            var rotate_axis = this.reader.getString(operation[i], "axis", true);
            var rotate_angle = this.reader.getFloat(operation[i], "angle", true) * this.degToRad;
            if (rotate_axis == "x" || rotate_axis == "X")
                mat4.rotate(matrix, matrix, rotate_angle, [1, 0, 0]);
            else if (rotate_axis == "y" || rotate_axis == "Y")
                mat4.rotate(matrix, matrix, rotate_angle, [0, 1, 0]);
            else if (rotate_axis == "z" || rotate_axis == "Z")
                mat4.rotate(matrix, matrix, rotate_angle, [0, 0, 1]);
            else
                return "Invalid rotation axis: " + rotate_axis;
        }
        else if (operation[i].tagName == "scale") {
            var scale = this.getFloatsXYZ(operation[i]);
            mat4.scale(matrix, matrix, scale);
        }
        else
            console.log("Invalid matricial operation: " + operation[i].tagName);
    }
}

MySceneGraph.prototype.parseTransformationTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        this.transformations[id] = mat4.create();
        this.parseTransformationTag(elems[i], this.transformations[id]);
    }
}

MySceneGraph.prototype.parsePrimitiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);

        var tempRectangleElems = elems[i].getElementsByTagName("rectangle");
        if (tempRectangleElems != null && tempRectangleElems.length == 1) {
            var x1 = this.reader.getFloat(tempRectangleElems[0], "x1", true);
            var y1 = this.reader.getFloat(tempRectangleElems[0], "y1", true);
            var x2 = this.reader.getFloat(tempRectangleElems[0], "x2", true);
            var y2 = this.reader.getFloat(tempRectangleElems[0], "y2", true);
            this.primitives[id] = new MyRectangle(this.scene, x1, y1, x2, y2);
        }
        var tempTriangleElems = elems[i].getElementsByTagName("triangle");
        if (tempTriangleElems != null && tempTriangleElems.length == 1) {
            var x1 = this.reader.getFloat(tempTriangleElems[0], "x1", true);
            var y1 = this.reader.getFloat(tempTriangleElems[0], "y1", true);
            var z1 = this.reader.getFloat(tempTriangleElems[0], "z1", true);
            var x2 = this.reader.getFloat(tempTriangleElems[0], "x2", true);
            var y2 = this.reader.getFloat(tempTriangleElems[0], "y2", true);
            var z2 = this.reader.getFloat(tempTriangleElems[0], "z2", true);
            var x3 = this.reader.getFloat(tempTriangleElems[0], "x3", true);
            var y3 = this.reader.getFloat(tempTriangleElems[0], "y3", true);
            var z3 = this.reader.getFloat(tempTriangleElems[0], "z3", true);
            this.primitives[id] = new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
        }
        var tempCylinderElems = elems[i].getElementsByTagName("cylinder");
        if (tempCylinderElems != null && tempCylinderElems.length == 1) {
            var base = this.reader.getFloat(tempCylinderElems[0], "base", true);
            var top = this.reader.getFloat(tempCylinderElems[0], "top", true);
            var height = this.reader.getFloat(tempCylinderElems[0], "height", true);
            var slices = this.reader.getInteger(tempCylinderElems[0], "slices", true);
            var stacks = this.reader.getInteger(tempCylinderElems[0], "stacks", true);
            this.primitives[id] = new MyCylinderWithTops(this.scene, base, top, height, slices, stacks);
        }
        var tempSphereElems = elems[i].getElementsByTagName("sphere");
        if (tempSphereElems != null && tempSphereElems.length == 1) {
            var radius = this.reader.getFloat(tempSphereElems[0], "radius", true);
            var slices = this.reader.getInteger(tempSphereElems[0], "slices", true);
            var stacks = this.reader.getInteger(tempSphereElems[0], "stacks", true);
            this.primitives[id] = new MySphere(this.scene, radius, slices, stacks);
        }
        var tempTorusElems = elems[i].getElementsByTagName("torus");
        if (tempTorusElems != null && tempTorusElems.length == 1) {
            var inner = this.reader.getFloat(tempTorusElems[0], "inner", true);
            var outer = this.reader.getFloat(tempTorusElems[0], "outer", true);
            var slices = this.reader.getInteger(tempTorusElems[0], "slices", true);
            var loops = this.reader.getInteger(tempTorusElems[0], "loops", true);
            this.primitives[id] = new MyTorus(this.scene, inner, outer, slices, loops);
        }
    }
}

MySceneGraph.prototype.parseComponentTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        this.scene.graph[id] = new Node();

        /* 'transformation' tags loading */
        var tempTransformationElem = this.findOneChild(elems[i], "transformation");
        var tempTransformationrefElems = tempTransformationElem.getElementsByTagName("transformationref");
        if (tempTransformationrefElems != null && tempTransformationrefElems.length == 1) {
            var transformation = this.reader.getString(tempTransformationrefElems[0], "id", true);
            this.scene.graph[id].setMatrix(this.transformations[transformation]);
        }
        else {
            var transformation = mat4.create();
            this.parseTransformationTag(tempTransformationElem, transformation);
            this.scene.graph[id].setMatrix(transformation);
        }

        /* 'materials' tags loading */
        this.findOneChild(elems[i], "materials");

        /* 'material' tags loading */
        var tempMaterialElems = this.findChildren(elems[i], "material");
        for (var j = 0, nnodes2 = tempMaterialElems.length; j < nnodes2; j++) {
            var material = this.reader.getString(tempMaterialElems[j], "id", true);
            this.scene.graph[id].addMaterial(material);
        }

        /* 'texture' tags loading */
        var tempTextureElem = this.findOneChild(elems[i], "texture");
        var texture = this.reader.getString(tempTextureElem, "id", true);
        this.scene.graph[id].setTexture(texture);

        /* 'children' tags loading */
        var tempChildrenElem = this.findOneChild(elems[i], "children");

        /* 'componentref' and 'primitiveref' tags loading */
        var tempComponentrefElems = tempChildrenElem.getElementsByTagName("componentref");
        var tempPrimitiverefElems = tempChildrenElem.getElementsByTagName("primitiveref");
        if ((tempComponentrefElems == null || tempComponentrefElems.length == 0) &&
            (tempPrimitiverefElems == null || tempPrimitiverefElems.length == 0))
            return "'componentref' or 'primitiveref' element is missing";
        else {
            for (var j = 0, nnodes2 = tempComponentrefElems.length; j < nnodes2; j++)
                this.scene.graph[id].pushChild(this.reader.getString(tempComponentrefElems[j], "id", true));

            for (var j = 0, nnodes2 = tempPrimitiverefElems.length; j < nnodes2; j++)
                this.scene.graph[id].pushPrimitive(this.reader.getString(tempPrimitiverefElems[j], "id", true));
        }
    }

    if (this.scene.graph[this.rootNode] === undefined)
        console.log("There is no 'component' with the root node id: " + this.rootNode);
}

MySceneGraph.prototype.parseDSXFile = function (rootElement) {
    var error = this.verifyDSXFileStructure(rootElement);
    if (error != null)
        return error;
    this.verifyDSXFileIds(rootElement);

    /* 'scene' tags loading */
    var tempSceneElems = rootElement.getElementsByTagName("scene");
    if (tempSceneElems == null || tempSceneElems.length != 1)
        return "'scene' tag misbehavior.";
    this.parseSceneTag(tempSceneElems[0]);

    /* 'views' tags loading */
    var tempViewsElems = rootElement.getElementsByTagName("views");
    if (tempViewsElems == null || tempViewsElems.length != 1) {
        return "'views' tag misbehavior.";
    }
    var default_view = this.reader.getString(tempViewsElems[0], "default", true);
    for (var i = 0; i < this.perspectivesIds.length; i++)
        if (this.perspectivesIds[i] == default_view)
            this.actualPerspectivesIdsIndex = i;

    /* 'perspective' tags loading */
    var tempPerspectiveElems = rootElement.getElementsByTagName("perspective");
    if (tempPerspectiveElems == null || tempPerspectiveElems.length == 0) {
        return "'perspective' element is missing.";
    }
    this.parsePerspectiveTags(tempPerspectiveElems);
    this.scene.camera = this.perspectives[this.perspectivesIds[this.actualPerspectivesIdsIndex]];

    /* 'illumination' tags loading */
    var tempIlluminationElems = rootElement.getElementsByTagName("illumination");
    if (tempIlluminationElems == null || tempIlluminationElems.length != 1)
        return "'illumination' tag misbehavior.";
    this.parseIlluminationTag(tempIlluminationElems[0]);

    /* 'lights' tags loading */
    var tempLightsElems = rootElement.getElementsByTagName("lights");
    if (tempLightsElems == null || tempLightsElems.length != 1)
        return "'lights' tag misbehavior.";

    /* 'omni' and 'spot' tags loading */
    var tempOmniElems = tempLightsElems[0].getElementsByTagName("omni");
    var tempSpotElems = tempLightsElems[0].getElementsByTagName("spot");
    if ((tempOmniElems == null || tempOmniElems.length == 0) &&
        (tempSpotElems == null || tempSpotElems.length == 0))
        return "'omni' or 'spot' element is missing.";
    var nextIndexToUse = this.parseLightsRelativeTags(tempOmniElems, "omni", 0);
    this.parseLightsRelativeTags(tempSpotElems, "spot", nextIndexToUse);

    /* 'textures' tags loading */
    var tempTexturesElems = rootElement.getElementsByTagName("textures")
    if (tempTexturesElems == null || tempTexturesElems.length != 1)
        return "'textures' tag misbehavior.";

    /* 'texture' tags loading */
    var tempTextureElems = tempTexturesElems[0].getElementsByTagName("texture");
    if (tempTextureElems == null || tempTextureElems.length == 0)
        return "'texture' element is missing.";
    this.parseTextureTags(tempTextureElems);

    /* 'materials' tags loading */
    var tempMaterialsElems = rootElement.getElementsByTagName("materials")
    if (tempMaterialsElems == null || tempMaterialsElems.length == 0)
        return "'materials' tag misbehavior.";

    /* 'material' tags loading */
    var tempMaterialElems = tempMaterialsElems[0].getElementsByTagName("material");
    if (tempMaterialElems == null || tempMaterialElems.length == 0)
        return "'material' element is missing.";
    this.parseMaterialTags(tempMaterialElems);

    /* 'transformations' tags loading */
    var tempTransformationsElems = rootElement.getElementsByTagName("transformations")
    if (tempTransformationsElems == null || tempTransformationsElems.length != 1)
        return "'transformations' tag misbehavior.";

    /* 'transformation' tags loading */
    var tempTransformationElems = tempTransformationsElems[0].getElementsByTagName("transformation");
    if (tempTransformationElems == null || tempTransformationElems.length == 0)
        return "'transformation' element is missing.";
    this.parseTransformationTags(tempTransformationElems);

    /* 'primitives' tags loading */
    var tempPrimitivesElems = rootElement.getElementsByTagName("primitives")
    if (tempPrimitivesElems == null || tempPrimitivesElems.length != 1)
        return "'primitives' tag misbehavior.";

    /* 'primitive' tags loading */
    var tempPrimitiveElems = tempPrimitivesElems[0].getElementsByTagName("primitive");
    if (tempPrimitiveElems == null || tempPrimitiveElems.length == 0)
        return "'primitive' element is missing.";
    this.parsePrimitiveTags(tempPrimitiveElems);

    /* 'components' tags loading */
    var tempComponentsElems = rootElement.getElementsByTagName("components")
    if (tempComponentsElems == null || tempComponentsElems.length != 1)
        return "'components' tag misbehavior.";

    /* 'component' tags loading */
    var tempComponentElems = tempComponentsElems[0].getElementsByTagName("component");
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


