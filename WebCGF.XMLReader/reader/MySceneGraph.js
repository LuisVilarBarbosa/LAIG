
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
    if (rootElement.children.length != 9) throw "Invalid number of 'dsx' children tags detected (verify if all the elements begin with <tag> and end </tag>).";
    if ((name = rootElement.children[0].nodeName) != "scene") throw "Expected 'scene' tag instead of '" + name + "'.";
    if ((name = rootElement.children[1].nodeName) != "views") throw "Expected 'views' tag instead of '" + name + "'.";
    if ((name = rootElement.children[2].nodeName) != "illumination") throw "Expected 'illumination' tag instead of '" + name + "'.";
    if ((name = rootElement.children[3].nodeName) != "lights") throw "Expected 'lights' tag instead of '" + name + "'.";
    if ((name = rootElement.children[4].nodeName) != "textures") throw "Expected 'textures' tag instead of '" + name + "'.";
    if ((name = rootElement.children[5].nodeName) != "materials") throw "Expected 'materials' tag instead of '" + name + "'.";
    if ((name = rootElement.children[6].nodeName) != "transformations") throw "Expected 'transformations' tag instead of '" + name + "'.";
    if ((name = rootElement.children[7].nodeName) != "primitives") throw "Expected 'primitives' tag instead of '" + name + "'.";
    if ((name = rootElement.children[8].nodeName) != "components") throw "Expected 'components' tag instead of '" + name + "'.";
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
                throw "'" + ids[i] + "' is not an unique id.";
    }
}

MySceneGraph.prototype.findOneChild = function (elem, tagNameToFind) {
    var elems = elem.getElementsByTagName(tagNameToFind);
    if (elems == null || elems.length != 1)
        throw "Either zero or more than one '" + tagNameToFind + "' elements found.";
    return elems[0];
}

MySceneGraph.prototype.findChildren = function (elem, tagNameToFind) {
    var elems = elem.getElementsByTagName(tagNameToFind);
    if (elems == null || elems.length == 0)
        throw "Zero '" + tagNameToFind + "' elements found.";
    return elems;
}

MySceneGraph.prototype.getFloatsXYZ = function (elem) {
    var array = [
        this.reader.getFloat(elem, "x", true),
        this.reader.getFloat(elem, "y", true),
        this.reader.getFloat(elem, "z", true)
    ];
    return array;
}

MySceneGraph.prototype.getFloatsRGBA = function (elem) {
    var array = [
        this.reader.getFloat(elem, "r", true),
        this.reader.getFloat(elem, "g", true),
        this.reader.getFloat(elem, "b", true),
        this.reader.getFloat(elem, "a", true)
    ];
    return array;
}

MySceneGraph.prototype.parseSceneTag = function (elem) {
    this.scene.setRootNodeId(this.reader.getString(elem, "root", true));
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

        this.scene.addPerspective(id, new CGFcamera(angle, near, far, from, to));
    };
}

MySceneGraph.prototype.parseIlluminationTag = function (elem) {
    // The next two booleans are not loaded by indication of the professor.
    //var doublesided = this.reader.getBoolean(elem, "doublesided", true);
    //var local = this.reader.getBoolean(elem, "local", true);

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
        this.scene.myInterface.addLight(id, this.scene.lights[lightsArrayIndex], lightType);
    }

    return lightsArrayIndex;
}

MySceneGraph.prototype.parseTextureTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        var file = this.reader.getString(elems[i], "file", true);
        var length_s = this.reader.getFloat(elems[i], "length_s", true);
        var length_t = this.reader.getFloat(elems[i], "length_t", true);
        this.scene.addTexture(id, new CGFtexture(this.scene, file, length_s, length_t));
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

        var material = new CGFappearance(this.scene);
        material.setEmission(emission[0], emission[1], emission[2], emission[3]);
        material.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
        material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
        material.setSpecular(specular[0], specular[1], specular[2], specular[3]);
        if (shininess_value > 0)
            material.setShininess(shininess_value);

        this.scene.addMaterial(id, material);
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
                throw "Invalid rotation axis: '" + rotate_axis + "'.";
        }
        else if (operation[i].tagName == "scale") {
            var scale = this.getFloatsXYZ(operation[i]);
            mat4.scale(matrix, matrix, scale);
        }
        else
            throw "Invalid matricial operation: '" + operation[i].tagName + "'.";
    }
}

MySceneGraph.prototype.parseTransformationTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        var transformation = mat4.create();
        this.parseTransformationTag(elems[i], transformation);
        this.scene.addTransformation(id, transformation);
    }
}

MySceneGraph.prototype.parsePrimitiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var id = this.reader.getString(elems[i], "id", true);
        if (elems[i].children.length != 1)
            throw "Either zero or more than one primitive elements found in the definition of '" + id + "'";

        var primitive = elems[i].children[0];
        if (primitive.tagName == "rectangle") {
            var x1 = this.reader.getFloat(primitive, "x1", true);
            var y1 = this.reader.getFloat(primitive, "y1", true);
            var x2 = this.reader.getFloat(primitive, "x2", true);
            var y2 = this.reader.getFloat(primitive, "y2", true);
            this.scene.addPrimitive(id, new MyRectangle(this.scene, x1, y1, x2, y2));
        }
        else if (primitive.tagName == "triangle") {
            var x1 = this.reader.getFloat(primitive, "x1", true);
            var y1 = this.reader.getFloat(primitive, "y1", true);
            var z1 = this.reader.getFloat(primitive, "z1", true);
            var x2 = this.reader.getFloat(primitive, "x2", true);
            var y2 = this.reader.getFloat(primitive, "y2", true);
            var z2 = this.reader.getFloat(primitive, "z2", true);
            var x3 = this.reader.getFloat(primitive, "x3", true);
            var y3 = this.reader.getFloat(primitive, "y3", true);
            var z3 = this.reader.getFloat(primitive, "z3", true);
            this.scene.addPrimitive(id, new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3));
        }
        else if (primitive.tagName == "cylinder") {
            var base = this.reader.getFloat(primitive, "base", true);
            var top = this.reader.getFloat(primitive, "top", true);
            var height = this.reader.getFloat(primitive, "height", true);
            var slices = this.reader.getInteger(primitive, "slices", true);
            var stacks = this.reader.getInteger(primitive, "stacks", true);
            this.scene.addPrimitive(id, new MyCylinderWithTops(this.scene, base, top, height, slices, stacks));
        }
        else if (primitive.tagName == "sphere") {
            var radius = this.reader.getFloat(primitive, "radius", true);
            var slices = this.reader.getInteger(primitive, "slices", true);
            var stacks = this.reader.getInteger(primitive, "stacks", true);
            this.scene.addPrimitive(id, new MySphere(this.scene, radius, slices, stacks));
        }
        else if (primitive.tagName == "torus") {
            var inner = this.reader.getFloat(primitive, "inner", true);
            var outer = this.reader.getFloat(primitive, "outer", true);
            var slices = this.reader.getInteger(primitive, "slices", true);
            var loops = this.reader.getInteger(primitive, "loops", true);
            this.scene.addPrimitive(id, new MyTorus(this.scene, inner, outer, slices, loops));
        }
        else
            throw "Invalid primitive element found: '" + primitive.tagName + "'.";
    }
}

MySceneGraph.prototype.parseComponentTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var node = new Node();
        var id = this.reader.getString(elems[i], "id", true);

        /* 'transformation' tags loading */
        var transformationElem = this.findOneChild(elems[i], "transformation");
        var transformationrefElems = transformationElem.getElementsByTagName("transformationref");
        if (transformationrefElems != null && transformationrefElems.length == 1) {
            var transformation = this.reader.getString(transformationrefElems[0], "id", true);
            node.setMatrix(this.scene.transformations[transformation]);
        }
        else {
            var transformation = mat4.create();
            this.parseTransformationTag(transformationElem, transformation);
            node.setMatrix(transformation);
        }

        /* 'materials' tags loading */
        this.findOneChild(elems[i], "materials");

        /* 'material' tags loading */
        var materialElems = this.findChildren(elems[i], "material");
        for (var j = 0, nnodes2 = materialElems.length; j < nnodes2; j++) {
            var material = this.reader.getString(materialElems[j], "id", true);
            node.addMaterialId(material);
        }

        /* 'texture' tags loading */
        var textureElem = this.findOneChild(elems[i], "texture");
        var texture = this.reader.getString(textureElem, "id", true);
        node.setTextureId(texture);

        /* 'children' tags loading */
        var childrenElem = this.findOneChild(elems[i], "children");

        /* 'componentref' and 'primitiveref' tags loading */
        var componentrefElems = childrenElem.getElementsByTagName("componentref");
        var primitiverefElems = childrenElem.getElementsByTagName("primitiveref");
        if ((componentrefElems == null || componentrefElems.length == 0) &&
            (primitiverefElems == null || primitiverefElems.length == 0))   // this will force an intermediate node (not leaf, i. e., not primitive) to have, at least, one descendant (component or primitive)
            throw "'componentref' or 'primitiveref' element is missing.";
        else {
            for (var j = 0, nnodes2 = componentrefElems.length; j < nnodes2; j++)
                node.pushChild(this.reader.getString(componentrefElems[j], "id", true));

            for (var j = 0, nnodes2 = primitiverefElems.length; j < nnodes2; j++)
                node.pushPrimitive(this.reader.getString(primitiverefElems[j], "id", true));
        }

        this.scene.addNode(id, node);
    }

    if (this.scene.sceneGraph[this.scene.rootNodeId] === undefined)
        throw "There is no 'component' with the root node id: '" + this.scene.rootNodeId + "'.";
}

MySceneGraph.prototype.parseDSXFile = function (rootElement) {
    try {
        this.verifyDSXFileStructure(rootElement);
        this.verifyDSXFileIds(rootElement);

        this.parseSceneTag(this.findOneChild(rootElement, "scene"));

        var viewsElem = this.findOneChild(rootElement, "views");
        var default_view = this.reader.getString(viewsElem, "default", true);

        this.parsePerspectiveTags(this.findChildren(viewsElem, "perspective"));
        this.scene.setDefaultPerspective(default_view); // must be done after loading the perspectives

        this.parseIlluminationTag(this.findOneChild(rootElement, "illumination"));

        var lightsElem = this.findOneChild(rootElement, "lights");

        /* 'omni' and 'spot' tags loading */
        var omniElems = lightsElem.getElementsByTagName("omni");
        var spotElems = lightsElem.getElementsByTagName("spot");
        if ((omniElems == null || omniElems.length == 0) &&
            (spotElems == null || spotElems.length == 0))
            throw "'omni' or 'spot' element is missing.";
        var nextIndexToUse = this.parseLightsRelativeTags(omniElems, "omni", 0);
        this.parseLightsRelativeTags(spotElems, "spot", nextIndexToUse);

        var texturesElem = this.findOneChild(rootElement, "textures");

        this.parseTextureTags(this.findChildren(texturesElem, "texture"));

        /* only one 'materials' child should be found, but, because there are more
        'materials' tags in 'components', 'getElementsByTagName' finds more than one */
        var materialsElems = this.findChildren(rootElement, "materials");

        var materialElems = this.findChildren(materialsElems[0], "material");
        this.parseMaterialTags(materialElems);

        var transformationsElem = this.findOneChild(rootElement, "transformations")

        var transformationElems = this.findChildren(transformationsElem, "transformation");
        this.parseTransformationTags(transformationElems);

        var primitivesElem = this.findOneChild(rootElement, "primitives")

        var primitiveElems = this.findChildren(primitivesElem, "primitive");
        this.parsePrimitiveTags(primitiveElems);

        var componentsElems = this.findOneChild(rootElement, "components")

        var componentElems = this.findChildren(componentsElems, "component");
        this.parseComponentTags(componentElems);

    } catch (e) {
        return e;
    }
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};


