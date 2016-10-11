
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
    if (rootElement.children.length != 9) return "invalid number of 'dsx' children tags detected";
    if (rootElement.children[0].nodeName != 'scene') return "'scene' tag out of order";
    if (rootElement.children[1].nodeName != 'views') return "'views' tag out of order";
    if (rootElement.children[2].nodeName != 'illumination') return "'illumination' tag out of order";
    if (rootElement.children[3].nodeName != 'lights') return "'lights' tag out of order";
    if (rootElement.children[4].nodeName != 'textures') return "'textures' tag out of order";
    if (rootElement.children[5].nodeName != 'materials') return "'materials' tag out of order";
    if (rootElement.children[6].nodeName != 'transformations') return "'transformations' tag out of order";
    if (rootElement.children[7].nodeName != 'primitives') return "'primitives' tag out of order";
    if (rootElement.children[8].nodeName != 'components') return "'components' tag out of order";
    // verify subsequent tags
}

MySceneGraph.prototype.parseDSXFile = function (rootElement) {
    var error = this.verifyDSXFileStructure(rootElement);
    if (error != null)
        return error;

    /* 'scene' tags loading */
    var tempSceneElems = rootElement.getElementsByTagName('scene');
    if (tempSceneElems == null || tempSceneElems.length != 1)
        return "'scene' tag misbehavior.";
    this.scene.rootNode = tempSceneElems[0].attributes.getNamedItem("root");
    var axis_length = tempSceneElems[0].attributes.getNamedItem("axis_length");
    this.scene.axis = new CGFaxis(this.scene, axis_length, 0.2);    // 0.2 = default thickness

    /* 'views' tags loading */
    var tempViewsElems = rootElement.getElementsByTagName('views');
    if (tempViewsElems == null || tempViewsElems.length != 1) {
        return "'views' tag misbehavior.";
    }
    var default_view = tempViewsElems[0].attributes.getNamedItem("default");

    /* 'perspective' tags loading */
    var tempPerspectiveElems = rootElement.getElementsByTagName('perspective');
    if (tempPerspectiveElems == null || tempPerspectiveElems.length == 0) {
        return "'perspective' element is missing.";
    }
    this.perspectives = [];
    var nnodes = tempPerspectiveElems.length;
    for (var i = 0; i < nnodes; i++) {
        var e = tempPerspectiveElems[i];

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
        //var from = vec4.create();
        //from.set(from_x, from_y, from_z, 1.0);   // what value should be given to 'w'?
        //var to = vec4.create();
        //to.set(to_x, to_y, to_z, 1.0);   // what value should be given to 'w'?

        //this.perspectives[id] = new CGFcamera(angle, near, far, from, to);
    };
    //this.scene.camera = this.perspectives[default_view];

    /* 'illumination' tags loading */
    var tempIlluminationElems = rootElement.getElementsByTagName('illumination');
    if (tempIlluminationElems == null || tempIlluminationElems.length != 1)
        return "'illumination' tag misbehavior.";
    var doublesided = this.reader.getBoolean(tempIlluminationElems[0], 'doublesided', true);
    var local = this.reader.getBoolean(tempIlluminationElems[0], 'local', true);
    var ambient_r = tempIlluminationElems[0].children[0].attributes.getNamedItem('r').nodeValue;
    var ambient_g = tempIlluminationElems[0].children[0].attributes.getNamedItem('g').nodeValue;
    var ambient_b = tempIlluminationElems[0].children[0].attributes.getNamedItem('b').nodeValue;
    var ambient_a = tempIlluminationElems[0].children[0].attributes.getNamedItem('a').nodeValue;
    this.scene.setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
    var background_r = tempIlluminationElems[0].children[1].attributes.getNamedItem('r').nodeValue;
    var background_g = tempIlluminationElems[0].children[1].attributes.getNamedItem('g').nodeValue;
    var background_b = tempIlluminationElems[0].children[1].attributes.getNamedItem('b').nodeValue;
    var background_a = tempIlluminationElems[0].children[1].attributes.getNamedItem('a').nodeValue;
    this.background = [background_r, background_g, background_b, background_a];

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
    var nnodes = tempOmniElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempOmniElems[i].attributes.getNamedItem('id');    // not in use
        var enabled = this.reader.getBoolean(tempOmniElems[i], 'enabled', true);
        var location_x = tempOmniElems[i].children[0].attributes.getNamedItem('x').nodeValue;
        var location_y = tempOmniElems[i].children[0].attributes.getNamedItem('y').nodeValue;
        var location_z = tempOmniElems[i].children[0].attributes.getNamedItem('z').nodeValue;
        var location_w = tempOmniElems[i].children[0].attributes.getNamedItem('w').nodeValue;
        var ambient_r = tempOmniElems[i].children[1].attributes.getNamedItem('r').nodeValue;
        var ambient_g = tempOmniElems[i].children[1].attributes.getNamedItem('g').nodeValue;
        var ambient_b = tempOmniElems[i].children[1].attributes.getNamedItem('b').nodeValue;
        var ambient_a = tempOmniElems[i].children[1].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = tempOmniElems[i].children[2].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = tempOmniElems[i].children[2].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = tempOmniElems[i].children[2].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = tempOmniElems[i].children[2].attributes.getNamedItem('a').nodeValue;
        var specular_r = tempOmniElems[i].children[3].attributes.getNamedItem('r').nodeValue;
        var specular_g = tempOmniElems[i].children[3].attributes.getNamedItem('g').nodeValue;
        var specular_b = tempOmniElems[i].children[3].attributes.getNamedItem('b').nodeValue;
        var specular_a = tempOmniElems[i].children[3].attributes.getNamedItem('a').nodeValue;

        if(enabled)
            this.scene.lights[i].enable();
        else
            this.scene.lights[i].disable();
        this.scene.lights[i].setPosition(location_x, location_y, location_z, location_w);
        this.scene.lights[i].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.lights[i].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.lights[i].setSpecular(specular_r, specular_g, specular_b, specular_a);
    }

    var nnodes = tempSpotElems.length;
    for (var i = tempOmniElems.length; i < nnodes; i++) {
        var id = tempSpotElems[i].attributes.getNamedItem('id');    // not in use
        var enabled = this.reader.getBoolean(tempSpotElems[i], 'enabled', true);
        var target_x = tempSpotElems[i].children[0].attributes.getNamedItem('x').nodeValue;
        var target_y = tempSpotElems[i].children[0].attributes.getNamedItem('y').nodeValue;
        var target_z = tempSpotElems[i].children[0].attributes.getNamedItem('z').nodeValue;
        var location_x = tempSpotElems[i].children[1].attributes.getNamedItem('x').nodeValue;
        var location_y = tempSpotElems[i].children[1].attributes.getNamedItem('y').nodeValue;
        var location_z = tempSpotElems[i].children[1].attributes.getNamedItem('z').nodeValue;
        var ambient_r = tempSpotElems[i].children[2].attributes.getNamedItem('r').nodeValue;
        var ambient_g = tempSpotElems[i].children[2].attributes.getNamedItem('g').nodeValue;
        var ambient_b = tempSpotElems[i].children[2].attributes.getNamedItem('b').nodeValue;
        var ambient_a = tempSpotElems[i].children[2].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = tempSpotElems[i].children[3].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = tempSpotElems[i].children[3].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = tempSpotElems[i].children[3].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = tempSpotElems[i].children[3].attributes.getNamedItem('a').nodeValue;
        var specular_r = tempSpotElems[i].children[4].attributes.getNamedItem('r').nodeValue;
        var specular_g = tempSpotElems[i].children[4].attributes.getNamedItem('g').nodeValue;
        var specular_b = tempSpotElems[i].children[4].attributes.getNamedItem('b').nodeValue;
        var specular_a = tempSpotElems[i].children[4].attributes.getNamedItem('a').nodeValue;

        var direction_x = target_x - location_x;
        var direction_y = target_y - location_y;
        var direction_z = target_z - location_z;

        if (enabled)
            this.scene.lights[i].enable();
        else
            this.scene.lights[i].disable();
        this.scene.lights[i].setSpotDirection(direction_x, direction_y, direction_z);
        this.scene.lights[i].setPosition(location_x, location_y, location_z);
        this.scene.lights[i].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.lights[i].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.lights[i].setSpecular(specular_r, specular_g, specular_b, specular_a);
    }

    /* 'textures' tags loading */
    var tempTexturesElems = rootElement.getElementsByTagName('textures')
    if (tempTexturesElems == null || tempTexturesElems.length != 1)
        return "'textures' tag misbehavior.";

    /* 'texture' tags loading */
    var tempTextureElems = tempTexturesElems[0].getElementsByTagName('texture');
    if (tempTextureElems == null || tempTextureElems.length == 0)
        return "'texture' element is missing.";
    this.textures = [];
    var nnodes = tempTextureElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempTextureElems[i].attributes.getNamedItem('id'); // not saved
        var file = tempTextureElems[i].attributes.getNamedItem('file');
        var length_s = tempTextureElems[i].attributes.getNamedItem('length_s');
        var length_t = tempTextureElems[i].attributes.getNamedItem('length_t');

        this.textures[id] = new CGFappearance(this.scene);
        //this.textures[id].loadTexture(file);
        //console.log(file);
        this.textures[id].setTextureWrap(length_s, length_t);
    }

    /* 'materials' tags loading */
    var tempMaterialsElems = rootElement.getElementsByTagName('materials')
    if (tempMaterialsElems == null || tempMaterialsElems.length == 0)
        return "'materials' tag misbehavior.";

    /* 'material' tags loading */
    var tempMaterialElems = tempMaterialsElems[0].getElementsByTagName('material');
    if (tempMaterialElems == null || tempMaterialElems.length == 0)
        return "'material' element is missing.";
    this.materials = [];
    var nnodes = tempMaterialElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempMaterialElems[i].attributes.getNamedItem('id');
        var emission_r = tempMaterialElems[i].children[0].attributes.getNamedItem('r').nodeValue;
        var emission_g = tempMaterialElems[i].children[0].attributes.getNamedItem('g').nodeValue;
        var emission_b = tempMaterialElems[i].children[0].attributes.getNamedItem('b').nodeValue;
        var emission_a = tempMaterialElems[i].children[0].attributes.getNamedItem('a').nodeValue;
        var ambient_r = tempMaterialElems[i].children[1].attributes.getNamedItem('r').nodeValue;
        var ambient_g = tempMaterialElems[i].children[1].attributes.getNamedItem('g').nodeValue;
        var ambient_b = tempMaterialElems[i].children[1].attributes.getNamedItem('b').nodeValue;
        var ambient_a = tempMaterialElems[i].children[1].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = tempMaterialElems[i].children[2].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = tempMaterialElems[i].children[2].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = tempMaterialElems[i].children[2].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = tempMaterialElems[i].children[2].attributes.getNamedItem('a').nodeValue;
        var specular_r = tempMaterialElems[i].children[3].attributes.getNamedItem('r').nodeValue;
        var specular_g = tempMaterialElems[i].children[3].attributes.getNamedItem('g').nodeValue;
        var specular_b = tempMaterialElems[i].children[3].attributes.getNamedItem('b').nodeValue;
        var specular_a = tempMaterialElems[i].children[3].attributes.getNamedItem('a').nodeValue;
        var shininess_value = tempMaterialElems[i].children[4].attributes.getNamedItem('value').nodeValue;

        this.materials[id] = new CGFappearance(this.scene);
        this.materials[id].setEmission(emission_r, emission_g, emission_b, emission_a);
        this.materials[id].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.materials[id].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.materials[id].setSpecular(specular_r, specular_g, specular_b, specular_a);
        if(shininess_value > 0)
            this.materials[id].setShininess(shininess_value);
    }

    /* 'transformations' tags loading */
    var tempTransformationsElems = rootElement.getElementsByTagName('transformations')
    if (tempTransformationsElems == null || tempTransformationsElems.length != 1)
        return "'transformations' tag misbehavior.";

    /* 'transformation' tags loading */
    var tempTransformationElems = tempTransformationsElems[0].getElementsByTagName('transformation');
    if (tempTransformationElems == null || tempTransformationElems.length == 0)
        return "'transformation' element is missing.";
    var nnodes = tempTransformationElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempTransformationElems[i].attributes.getNamedItem('id');
        /*var translate_x = tempTransformationElems[i].children[0].attributes.getNamedItem('x').nodeValue;
        var translate_y = tempTransformationElems[i].children[0].attributes.getNamedItem('y').nodeValue;
        var translate_z = tempTransformationElems[i].children[0].attributes.getNamedItem('z').nodeValue;
        var rotate_axis = tempTransformationElems[i].children[1].attributes.getNamedItem('axis').nodeValue;
        if (rotate_axis != 'x' && rotate_axis != 'X' &&
            rotate_axis != 'y' && rotate_axis != 'Y' &&
            rotate_axis != 'z' && rotate_axis != 'Z')
            return "Invalid rotation axis: " + rotate_axis;
        var rotate_angle = tempTransformationElems[i].children[1].attributes.getNamedItem('angle').nodeValue;
        var scale_x = tempTransformationElems[i].children[2].attributes.getNamedItem('x').nodeValue;
        var scale_y = tempTransformationElems[i].children[2].attributes.getNamedItem('y').nodeValue;
        var scale_z = tempTransformationElems[i].children[2].attributes.getNamedItem('z').nodeValue;

        var transformation = mat4.create();
        mat4.translate(transformation, transformation, [translate_x, translate_y, translate_z]);
        if (rotate_axis == 'x' || rotate_axis == 'X')
            mat4.rotate(transformation, transformation, rotate_angle, [1, 0, 0]);
        else if (rotate_axis == 'y' || rotate_axis == 'Y')
            mat4.rotate(transformation, transformation, rotate_angle, [0, 1, 0]);
        else if (rotate_axis == 'z' || rotate_axis == 'Z')
            mat4.rotate(transformation, transformation, rotate_angle, [0, 0, 1]);
        mat4.scale(transformation, transformation, [scale_x, scale_y, scale_z]);*/
    }

    /* 'primitives' tags loading */
    var tempPrimitivesElems = rootElement.getElementsByTagName('primitives')
    if (tempPrimitivesElems == null || tempPrimitivesElems.length != 1)
        return "'primitives' tag misbehavior.";

    /* 'primitive' tags loading */
    var tempPrimitiveElems = tempPrimitivesElems[0].getElementsByTagName('primitive');
    if (tempPrimitiveElems == null || tempPrimitiveElems.length == 0)
        return "'primitive' element is missing.";
    var nnodes = tempPrimitiveElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempPrimitiveElems[i].attributes.getNamedItem('id');
       
        var tempRectangleElems = tempPrimitiveElems[i].getElementsByTagName('rectangle');
        if (tempRectangleElems != null && tempRectangleElems.length == 1) {
            var x1 = tempRectangleElems[0].attributes.getNamedItem('x1').nodeValue;
            var y1 = tempRectangleElems[0].attributes.getNamedItem('y1').nodeValue;
            var x2 = tempRectangleElems[0].attributes.getNamedItem('x2').nodeValue;
            var y2 = tempRectangleElems[0].attributes.getNamedItem('y2').nodeValue;
        }
        var tempTriangleElems = tempPrimitiveElems[i].getElementsByTagName('triangle');
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
        }
        var tempCylinderElems = tempPrimitiveElems[i].getElementsByTagName('cylinder');
        if (tempCylinderElems != null && tempCylinderElems.length == 1) {
            var base = tempCylinderElems[0].attributes.getNamedItem('base').nodeValue;
            var top = tempCylinderElems[0].attributes.getNamedItem('top').nodeValue;
            var height = tempCylinderElems[0].attributes.getNamedItem('height').nodeValue;
            var slices = tempCylinderElems[0].attributes.getNamedItem('slices').nodeValue;
            var stacks = tempCylinderElems[0].attributes.getNamedItem('stacks').nodeValue;
        }
        var tempSphereElems = tempPrimitiveElems[i].getElementsByTagName('sphere');
        if (tempSphereElems != null && tempSphereElems.length == 1) {
            var radius = tempSphereElems[0].attributes.getNamedItem('radius').nodeValue;
            var slices = tempSphereElems[0].attributes.getNamedItem('slices').nodeValue;
            var stacks = tempSphereElems[0].attributes.getNamedItem('stacks').nodeValue;
        }
        var tempTorusElems = tempPrimitiveElems[i].getElementsByTagName('torus');
        if (tempTorusElems != null && tempTorusElems.length == 1) {
            var inner = tempTorusElems[0].attributes.getNamedItem('inner').nodeValue;
            var outer = tempTorusElems[0].attributes.getNamedItem('outer').nodeValue;
            var slices = tempTorusElems[0].attributes.getNamedItem('slices').nodeValue;
            var loops = tempTorusElems[0].attributes.getNamedItem('loops').nodeValue;
        }
    }

    /* 'components' tags loading */
    var tempComponentsElems = rootElement.getElementsByTagName('components')
    if (tempComponentsElems == null || tempComponentsElems.length != 1)
        return "'components' tag misbehavior.";

    /* 'component' tags loading */
    var tempComponentElems = tempComponentsElems[0].getElementsByTagName('component');
    if (tempComponentElems == null || tempComponentElems.length == 0)
        return "'component' element is missing.";
    var nnodes = tempComponentElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempComponentElems[i].attributes.getNamedItem('id');
        this.scene.graph[id] = new Node();

        /* 'transformation' tags loading */
        var tempTransformationElems = tempComponentElems[i].getElementsByTagName('transformation');
        if (tempTransformationElems == null || tempTransformationElems.length == 0)
            return "'transformation' element is missing.";
        // transformationref and transformation loading to do
        // this.scene.graph[id].setMatrix();

        /* 'materials' tags loading */
        var tempMaterialsElems = tempComponentElems[i].getElementsByTagName('materials');
        if (tempMaterialsElems == null || tempMaterialsElems.length == 0)
            return "'materials' element is missing.";

        /* 'material' tags loading */
        var tempMaterialElems = tempComponentElems[i].getElementsByTagName('material');
        if (tempMaterialElems == null || tempMaterialElems.length == 0)
            return "'material' element is missing.";
        var nnodes = tempMaterialElems.length;
        for (var i = 0; i < nnodes; i++) {
            var material = tempMaterialElems[i].attributes.getNamedItem('id');
            this.scene.graph[id].addMaterial(this.materials[material]);
            // misses 'inherit' condition
        }

        /* 'texture' tags loading */
        var tempTextureElems = tempComponentElems[i].getElementsByTagName('texture');
        if (tempTextureElems == null || tempTextureElems.length != 1)
            return "'texture' tag misbehavior.";
        var texture = tempTextureElems[0].attributes.getNamedItem('id');
        this.scene.graph[id].setTexture(this.textures[texture]);

        /* 'children' tags loading */
        var tempChildrenElems = tempComponentElems[i].getElementsByTagName('children');
        if (tempChildrenElems == null || tempChildrenElems.length != 1)
            return "'children' tag misbehavior.";
        var nnodes = tempChildrenElems.length;
        for (var i = 0; i < nnodes; i++) {
            /* 'componentref' and 'primitiveref' tags loading */
            var tempComponentrefElems = tempChildrenElems[i].getElementsByTagName('componentref');
            var tempPrimitiverefElems = tempChildrenElems[i].getElementsByTagName('primitiveref');
            if ((tempComponentrefElems == null || tempComponentrefElems.length == 0) &&
                (tempPrimitiverefElems == null || tempPrimitiverefElems.length == 0))
                return "'componentref' or 'primitiveref' element is missing";
            else {
                var nnodes = tempComponentrefElems.length;
                for (var i = 0; i < nnodes; i++)
                    this.scene.graph[id].push(tempComponentrefElems[i].attributes.getNamedItem('id'));

                var nnodes = tempPrimitiverefElems.length;
                // more than one primitive must be allowed and verify if it is stored the name or the primitive itself
                /*for (var i = 0; i < nnodes; i++)
                    this.scene.graph[id].primitive = tempPrimitiverefElems[i].attributes.getNamedItem('id');*/
            }
        }
    }
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};


