
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

MySceneGraph.prototype.parseSceneTag = function (elem) {
    this.rootNode = this.reader.getString(elem, "root", true);
    var axis_length = this.reader.getFloat(elem, "axis_length", true);
    this.scene.axis = new CGFaxis(this.scene, axis_length);
}

MySceneGraph.prototype.parsePerspectiveTags = function (elems) {
    for (var i = 0, nnodes = elems.length; i < nnodes; i++) {
        var e = elems[i];
        var id = this.reader.getString(e, "id", true);
        var near = this.reader.getFloat(e, "near", true);
        var far = this.reader.getFloat(e, "far", true);
        var angle = this.reader.getFloat(e, "angle", true) * this.degToRad;

        var fromElem = this.findOneChild(e, "from");
        var from_x = this.reader.getFloat(fromElem, "x", true);
        var from_y = this.reader.getFloat(fromElem, "y", true);
        var from_z = this.reader.getFloat(fromElem, "z", true);

        var toElem = this.findOneChild(e, "to");
        var to_x = this.reader.getFloat(toElem, "x", true);
        var to_y = this.reader.getFloat(toElem, "y", true);
        var to_z = this.reader.getFloat(toElem, "z", true);

        var from = vec3.fromValues(from_x, from_y, from_z);
        var to = vec3.fromValues(to_x, to_y, to_z);

        this.perspectives[id] = new CGFcamera(angle, near, far, from, to);
        this.perspectivesIds.push(id);
    };
}

MySceneGraph.prototype.parseIlluminationTag = function (elem) {
    var doublesided = this.reader.getBoolean(elem, "doublesided", true);
    var local = this.reader.getBoolean(elem, "local", true);

    var ambientElem = this.findOneChild(elem, "ambient");
    var ambient_r = this.reader.getFloat(ambientElem, "r", true);
    var ambient_g = this.reader.getFloat(ambientElem, "g", true);
    var ambient_b = this.reader.getFloat(ambientElem, "b", true);
    var ambient_a = this.reader.getFloat(ambientElem, "a", true);
    this.scene.setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);

    var backgroundElem = this.findOneChild(elem, "background");
    var background_r = this.reader.getFloat(backgroundElem, "r", true);
    var background_g = this.reader.getFloat(backgroundElem, "g", true);
    var background_b = this.reader.getFloat(backgroundElem, "b", true);
    var background_a = this.reader.getFloat(backgroundElem, "a", true);
    this.background = [background_r, background_g, background_b, background_a];
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
        var location_x = this.reader.getFloat(locationElem, "x", true);
        var location_y = this.reader.getFloat(locationElem, "y", true);
        var location_z = this.reader.getFloat(locationElem, "z", true);

        var ambientElem = this.findOneChild(elems[i], "ambient");
        var ambient_r = this.reader.getFloat(ambientElem, "r", true);
        var ambient_g = this.reader.getFloat(ambientElem, "g", true);
        var ambient_b = this.reader.getFloat(ambientElem, "b", true);
        var ambient_a = this.reader.getFloat(ambientElem, "a", true);

        var diffuseElem = this.findOneChild(elems[i], "diffuse");
        var diffuse_r = this.reader.getFloat(diffuseElem, "r", true);
        var diffuse_g = this.reader.getFloat(diffuseElem, "g", true);
        var diffuse_b = this.reader.getFloat(diffuseElem, "b", true);
        var diffuse_a = this.reader.getFloat(diffuseElem, "a", true);

        var specularElem = this.findOneChild(elems[i], "specular");
        var specular_r = this.reader.getFloat(specularElem, "r", true);
        var specular_g = this.reader.getFloat(specularElem, "g", true);
        var specular_b = this.reader.getFloat(specularElem, "b", true);
        var specular_a = this.reader.getFloat(specularElem, "a", true);

        if (lightType == "spot") {
            var angle = this.reader.getFloat(elems[i], "angle", true) * this.degToRad;
            var exponent = this.reader.getFloat(elems[i], "exponent", true);

            var targetElem = this.findOneChild(elems[i], "target");
            var target_x = this.reader.getFloat(targetElem, "x", true);
            var target_y = this.reader.getFloat(targetElem, "y", true);
            var target_z = this.reader.getFloat(targetElem, "z", true);

            var direction_x = target_x - location_x;
            var direction_y = target_y - location_y;
            var direction_z = target_z - location_z;

            this.scene.lights[lightsArrayIndex].setSpotCutOff(angle);
            this.scene.lights[lightsArrayIndex].setSpotDirection(direction_x, direction_y, direction_z);
            this.scene.lights[lightsArrayIndex].setSpotExponent(exponent);
        }

        this.scene.lightsIds[lightsArrayIndex] = id;
        if (enabled)
            this.scene.lights[lightsArrayIndex].enable();
        else
            this.scene.lights[lightsArrayIndex].disable();
        this.scene.lights[lightsArrayIndex].setPosition(location_x, location_y, location_z);
        this.scene.lights[lightsArrayIndex].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.lights[lightsArrayIndex].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.lights[lightsArrayIndex].setSpecular(specular_r, specular_g, specular_b, specular_a);
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
        var emission_r = this.reader.getFloat(emissionElem, "r", true);
        var emission_g = this.reader.getFloat(emissionElem, "g", true);
        var emission_b = this.reader.getFloat(emissionElem, "b", true);
        var emission_a = this.reader.getFloat(emissionElem, "a", true);

        var ambientElem = this.findOneChild(elems[i], "ambient");
        var ambient_r = this.reader.getFloat(ambientElem, "r", true);
        var ambient_g = this.reader.getFloat(ambientElem, "g", true);
        var ambient_b = this.reader.getFloat(ambientElem, "b", true);
        var ambient_a = this.reader.getFloat(ambientElem, "a", true);

        var diffuseElem = this.findOneChild(elems[i], "diffuse");
        var diffuse_r = this.reader.getFloat(diffuseElem, "r", true);
        var diffuse_g = this.reader.getFloat(diffuseElem, "g", true);
        var diffuse_b = this.reader.getFloat(diffuseElem, "b", true);
        var diffuse_a = this.reader.getFloat(diffuseElem, "a", true);

        var specularElem = this.findOneChild(elems[i], "specular");
        var specular_r = this.reader.getFloat(specularElem, "r", true);
        var specular_g = this.reader.getFloat(specularElem, "g", true);
        var specular_b = this.reader.getFloat(specularElem, "b", true);
        var specular_a = this.reader.getFloat(specularElem, "a", true);

        var shininessElem = this.findOneChild(elems[i], "shininess");
        var shininess_value = this.reader.getFloat(shininessElem, "value", true);

        this.materials[id] = new CGFappearance(this.scene);
        this.materials[id].setEmission(emission_r, emission_g, emission_b, emission_a);
        this.materials[id].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.materials[id].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.materials[id].setSpecular(specular_r, specular_g, specular_b, specular_a);
        if (shininess_value > 0)
            this.materials[id].setShininess(shininess_value);
    }
}

MySceneGraph.prototype.parseTransformationTag = function (elem, matrix) {
    var operation = elem.children;
    for (var i = 0, length = operation.length; i < length; i++) {
        if (operation[i].tagName == "translate") {
            var translate_x = this.reader.getFloat(operation[i], "x", true);
            var translate_y = this.reader.getFloat(operation[i], "y", true);
            var translate_z = this.reader.getFloat(operation[i], "z", true);
            mat4.translate(matrix, matrix, [translate_x, translate_y, translate_z]);
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
            var scale_x = this.reader.getFloat(operation[i], "x", true);
            var scale_y = this.reader.getFloat(operation[i], "y", true);
            var scale_z = this.reader.getFloat(operation[i], "z", true);
            mat4.scale(matrix, matrix, [scale_x, scale_y, scale_z]);
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


