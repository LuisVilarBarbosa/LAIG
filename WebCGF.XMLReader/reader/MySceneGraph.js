
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



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample = function (rootElement) {

    var elems = rootElement.getElementsByTagName('globals');
    if (elems == null) {
        return "globals element is missing.";
    }

    if (elems.length != 1) {
        return "either zero or more than one 'globals' element found.";
    }

    // various examples of different types of access
    var globals = elems[0];
    this.background = this.reader.getRGBA(globals, 'background');
    this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill", "line", "point"]);
    this.cullface = this.reader.getItem(globals, 'cullface', ["back", "front", "none", "frontandback"]);
    this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw", "cw"]);

    console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

    var tempList = rootElement.getElementsByTagName('list');

    if (tempList == null || tempList.length == 0) {
        return "list element is missing.";
    }

    this.list = [];
    // iterate over every element
    var nnodes = tempList[0].children.length;
    for (var i = 0; i < nnodes; i++) {
        var e = tempList[0].children[i];

        // process each element and store its information
        this.list[e.id] = e.attributes.getNamedItem("coords").value;
        console.log("Read list item id " + e.id + " with value " + this.list[e.id]);
    };

};

MySceneGraph.prototype.parseDSXFile = function (rootElement) {

    /* 'scene' tags loading */
    var tempSceneElems = rootElement.getElementsByTagName('scene');
    if (tempSceneElems == null || tempSceneElems.length != 1)
        return "'scene' tag misbehavior.";
    //console.log(tempSceneElems);
    var root = tempSceneElems[0].attributes.getNamedItem("root");
    var axis_length = tempSceneElems[0].attributes.getNamedItem("axis_length");
    //console.log(root); console.log(axis_length);

    /* 'views' tags loading */
    var tempViewsElems = rootElement.getElementsByTagName('views');
    if (tempViewsElems == null || tempViewsElems.length != 1) {
        return "'views' tag misbehavior.";
    }

    /* 'perspectives' tags loading */
    var tempPerspectiveElems = rootElement.getElementsByTagName('perspective');
    if (tempPerspectiveElems == null || tempPerspectiveElems.length == 0) {
        return "'perspective' element is missing.";
    }
    this.perspectives = [];
    // iterate over every element
    var nnodes = tempPerspectiveElems.length;
    for (var i = 0; i < nnodes; i++) {
        var e = tempPerspectiveElems[i];

        // process each element and store its information
        //this.perspectives[e.id] = e.attributes.getNamedItem('perspective');
        //console.log("Read view item id " + e.id + " with value " + this.perspectives[e.id]);
    };

    /* 'illumination' tags loading */
    var tempIlluminationElems = rootElement.getElementsByTagName('illumination');
    if (tempIlluminationElems == null || tempIlluminationElems.length != 1)
        return "'illumination' tag misbehavior.";
    console.log(tempIlluminationElems);
    var doublesided = this.reader.getBoolean(tempIlluminationElems[0], 'doublesided', true);
    var local = this.reader.getBoolean(tempIlluminationElems[0], 'local', true);
    //console.log(doublesided + " " + local);
    var ambient_r = tempIlluminationElems[0].children[0].attributes.getNamedItem('r').nodeValue;
    var ambient_g = tempIlluminationElems[0].children[0].attributes.getNamedItem('g').nodeValue;
    var ambient_b = tempIlluminationElems[0].children[0].attributes.getNamedItem('b').nodeValue;
    var ambient_a = tempIlluminationElems[0].children[0].attributes.getNamedItem('a').nodeValue;
    this.scene.setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
    var background_r = tempIlluminationElems[0].children[0].attributes.getNamedItem('r').nodeValue;
    var background_g = tempIlluminationElems[0].children[0].attributes.getNamedItem('g').nodeValue;
    var background_b = tempIlluminationElems[0].children[0].attributes.getNamedItem('b').nodeValue;
    var background_a = tempIlluminationElems[0].children[0].attributes.getNamedItem('a').nodeValue;
    this.background = [background_r, background_g, background_b, background_a];
    //console.log(this.ambient + " " + this.background);

    /* 'lights' tags loading */
    var tempLightsElems = rootElement.getElementsByTagName('lights');
    if (tempLightsElems == null || tempLightsElems.length != 1)
        return "'lights' tag misbehavior.";

    /* 'omni' tags loading */
    var tempOmniElems = tempLightsElems[0].getElementsByTagName('omni');
    /*if (tempOmniElems == null || tempOmniElems.length == 0)
        return "'omni' element is missing.";*/
    var nnodes = tempOmniElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempOmniElems[i].attributes.getNamedItem('id');
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

        this.scene.lights[i] = new CGFlight(this.scene, id);
        if(enabled)
            this.scene.lights[i].enable();
        else
            this.scene.lights[i].disable();
        this.scene.lights[i].setPosition(location_x, location_y, location_z, location_w);
        this.scene.lights[i].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.lights[i].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.lights[i].setSpecular(specular_r, specular_g, specular_b, specular_a);
    }

    /* 'spot' tags loading */
    var tempSpotElems = tempLightsElems[0].getElementsByTagName('spot');
    /*if (tempSpotElems == null || tempSpotElems.length == 0)
        return "'spot' element is missing.";*/
    var nnodes = tempSpotElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempSpotElems[i].attributes.getNamedItem('id');
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

        this.scene.lights[i] = new CGFlight(this.scene, id);
        if (enabled)
            this.scene.lights[i].enable();
        else
            this.scene.lights[i].disable();
        this.scene.lights[i].setSpotDirection(target_x, target_y, target_z);    // verify function in use
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
    var nnodes = tempTextureElems.length;
    for (var i = 0; i < nnodes; i++) {
        var id = tempTextureElems[i].attributes.getNamedItem('id'); // not saved
        var file = tempTextureElems[i].attributes.getNamedItem('file');
        var length_s = tempTextureElems[i].attributes.getNamedItem('length_s');
        var length_t = tempTextureElems[i].attributes.getNamedItem('length_t');

        this.scene.appearance[i] = new CGFappearance(this.scene);
        this.scene.appearance[i].loadTexture(file);
        this.scene.appearance[i].setTextureWrap(length_s, length_t);
    }

    /* 'materials' tags loading */
    var tempMaterialsElems = rootElement.getElementsByTagName('materials')
    if (tempMaterialsElems == null || tempMaterialsElems.length != 1)
        return "'materials' tag misbehavior.";

    /* 'material' tags loading */
    var tempMaterialElems = tempMaterialsElems[0].getElementsByTagName('material');
    if (tempMaterialElems == null || tempMaterialElems.length == 0)
        return "'material' element is missing.";
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
        var shininess_r = tempMaterialElems[i].children[4].attributes.getNamedItem('r').nodeValue;
        var shininess_g = tempMaterialElems[i].children[4].attributes.getNamedItem('g').nodeValue;
        var shininess_b = tempMaterialElems[i].children[4].attributes.getNamedItem('b').nodeValue;
        var shininess_a = tempMaterialElems[i].children[4].attributes.getNamedItem('a').nodeValue;

        this.scene.appearance[i] = new CGFappearance(this.scene); // correct: sobrepostion of material over texture
        this.scene.appearance[i].setEmission(emission_r, emission_g, emission_b, emission_a);
        this.scene.appearance[i].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
        this.scene.appearance[i].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
        this.scene.appearance[i].setSpecular(specular_r, specular_g, specular_b, specular_a);
        this.scene.appearance[i].setShininess(shininess_r, shininess_g, shininess_b, shininess_a);
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
        var translate_x = tempTransformationElems[i].children[0].attributes.getNamedItem('x').nodeValue;
        var translate_y = tempTransformationElems[i].children[0].attributes.getNamedItem('y').nodeValue;
        var translate_z = tempTransformationElems[i].children[0].attributes.getNamedItem('z').nodeValue;
        var rotate_x = tempTransformationElems[i].children[1].attributes.getNamedItem('x').nodeValue;
        var rotate_y = tempTransformationElems[i].children[1].attributes.getNamedItem('y').nodeValue;
        var rotate_z = tempTransformationElems[i].children[1].attributes.getNamedItem('z').nodeValue;
        var scale_x = tempTransformationElems[i].children[2].attributes.getNamedItem('x').nodeValue;
        var scale_y = tempTransformationElems[i].children[2].attributes.getNamedItem('y').nodeValue;
        var scale_z = tempTransformationElems[i].children[2].attributes.getNamedItem('z').nodeValue;

        // store transformation matrix
    }
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};


