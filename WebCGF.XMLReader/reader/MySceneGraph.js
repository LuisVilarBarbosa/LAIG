
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

    /* 'scene' tag loading */
    var tempSceneElems = rootElement.getElementsByTagName('scene');
    if (tempSceneElems == null || tempSceneElems.length != 1)
        return "'scene' elements wrongly found.";
    //console.log(tempSceneElems);
    var root = tempSceneElems[0].attributes.getNamedItem("root");
    var axis_length = tempSceneElems[0].attributes.getNamedItem("axis_length");
    //console.log(root); console.log(axis_length);

    /* 'perspectives' tags loading */
    var tempPerspectives = rootElement.getElementsByTagName('perspective');
    if (tempPerspectives == null || tempPerspectives.length == 0) {
        return "'perspective' element is missing.";
    }
    this.perspectives = [];
    // iterate over every element
    var nnodes = tempPerspectives.length;
    for (var i = 0; i < nnodes; i++) {
        var e = tempPerspectives[i];

        // process each element and store its information
        //this.perspectives[e.id] = e.attributes.getNamedItem('perspective');
        //console.log("Read view item id " + e.id + " with value " + this.perspectives[e.id]);
    };

    /* 'illumination' tags loading */
    var tempIllumination = rootElement.getElementsByTagName('illumination');
    if (tempIllumination == null || tempIllumination.length != 1)
        return "'illumination' element is missing.";
    console.log(tempIllumination);
    var doublesided = this.reader.getBoolean(tempIllumination[0], 'doublesided', true);
    var local = this.reader.getBoolean(tempIllumination[0], 'local', true);
    //console.log(doublesided + " " + local);
    var ambient_r = tempIllumination[0].children[0].attributes.getNamedItem('r').nodeValue;
    var ambient_g = tempIllumination[0].children[0].attributes.getNamedItem('g').nodeValue;
    var ambient_b = tempIllumination[0].children[0].attributes.getNamedItem('b').nodeValue;
    var ambient_a = tempIllumination[0].children[0].attributes.getNamedItem('a').nodeValue;
    this.scene.setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
    var background_r = tempIllumination[0].children[0].attributes.getNamedItem('r').nodeValue;
    var background_g = tempIllumination[0].children[0].attributes.getNamedItem('g').nodeValue;
    var background_b = tempIllumination[0].children[0].attributes.getNamedItem('b').nodeValue;
    var background_a = tempIllumination[0].children[0].attributes.getNamedItem('a').nodeValue;
    this.background = [background_r, background_g, background_b, background_a];
    //console.log(this.ambient + " " + this.background);

    /* ''lights' tags loading */
    var tempLights = rootElement.getElementsByTagName('lights');
    if (tempLights.length != 1)
        return "'lights' tag misbehavior.";

    /* 'omni' tags loading */
    var tempOmni = tempLights[0].getElementsByTagName('omni');
    var nnones = tempOmni.length;
    for (var i = 0; i < nnones; i++) {
        var id = tempOmni[i].attributes.getNamedItem('id');
        var enabled = this.reader.getBoolean(tempOmni[i], 'enabled', true);
        var location_x = tempOmni[i].children[0].attributes.getNamedItem('x').nodeValue;
        var location_y = tempOmni[i].children[0].attributes.getNamedItem('y').nodeValue;
        var location_z = tempOmni[i].children[0].attributes.getNamedItem('z').nodeValue;
        var location_w = tempOmni[i].children[0].attributes.getNamedItem('w').nodeValue;
        var ambient_r = tempOmni[i].children[1].attributes.getNamedItem('r').nodeValue;
        var ambient_g = tempOmni[i].children[1].attributes.getNamedItem('g').nodeValue;
        var ambient_b = tempOmni[i].children[1].attributes.getNamedItem('b').nodeValue;
        var ambient_a = tempOmni[i].children[1].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = tempOmni[i].children[2].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = tempOmni[i].children[2].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = tempOmni[i].children[2].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = tempOmni[i].children[2].attributes.getNamedItem('a').nodeValue;
        var specular_r = tempOmni[i].children[3].attributes.getNamedItem('r').nodeValue;
        var specular_g = tempOmni[i].children[3].attributes.getNamedItem('g').nodeValue;
        var specular_b = tempOmni[i].children[3].attributes.getNamedItem('b').nodeValue;
        var specular_a = tempOmni[i].children[3].attributes.getNamedItem('a').nodeValue;

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
    var tempSpot = tempLights[0].getElementsByTagName('spot');
    var nnones = tempSpot.length;
    for (var i = 0; i < nnones; i++) {
        var id = tempSpot[i].attributes.getNamedItem('id');
        var enabled = this.reader.getBoolean(tempSpot[i], 'enabled', true);
        var target_x = tempSpot[i].children[0].attributes.getNamedItem('x').nodeValue;
        var target_y = tempSpot[i].children[0].attributes.getNamedItem('y').nodeValue;
        var target_z = tempSpot[i].children[0].attributes.getNamedItem('z').nodeValue;
        var location_x = tempSpot[i].children[1].attributes.getNamedItem('x').nodeValue;
        var location_y = tempSpot[i].children[1].attributes.getNamedItem('y').nodeValue;
        var location_z = tempSpot[i].children[1].attributes.getNamedItem('z').nodeValue;
        var ambient_r = tempSpot[i].children[2].attributes.getNamedItem('r').nodeValue;
        var ambient_g = tempSpot[i].children[2].attributes.getNamedItem('g').nodeValue;
        var ambient_b = tempSpot[i].children[2].attributes.getNamedItem('b').nodeValue;
        var ambient_a = tempSpot[i].children[2].attributes.getNamedItem('a').nodeValue;
        var diffuse_r = tempSpot[i].children[3].attributes.getNamedItem('r').nodeValue;
        var diffuse_g = tempSpot[i].children[3].attributes.getNamedItem('g').nodeValue;
        var diffuse_b = tempSpot[i].children[3].attributes.getNamedItem('b').nodeValue;
        var diffuse_a = tempSpot[i].children[3].attributes.getNamedItem('a').nodeValue;
        var specular_r = tempSpot[i].children[4].attributes.getNamedItem('r').nodeValue;
        var specular_g = tempSpot[i].children[4].attributes.getNamedItem('g').nodeValue;
        var specular_b = tempSpot[i].children[4].attributes.getNamedItem('b').nodeValue;
        var specular_a = tempSpot[i].children[4].attributes.getNamedItem('a').nodeValue;

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
    var tempTexturess = rootElement.getElementsByTagName('textures')
    if (tempTexturess.length != 1)
        return "'textures' tag misbehavior.";

    /* 'texture' tags loading */
    var tempTextures = tempTexturess[0].getElementsByTagName('texture');
    var nnones = tempTextures.length;
    for (var i = 0; i < nnones; i++) {
        var id = tempTextures[i].attributes.getNamedItem('id'); // not saved
        var file = tempTextures[i].attributes.getNamedItem('file');
        var length_s = tempTextures[i].attributes.getNamedItem('length_s');
        var length_t = tempTextures[i].attributes.getNamedItem('length_t');

        this.scene.appearance[i] = new CGFappearance(this.scene);
        this.scene.appearance[i].loadTexture(file);
        this.scene.appearance[i].setTextureWrap(length_s, length_t);
    }

    /* 'materials' tags loading */
    var tempMaterialss = rootElement.getElementsByTagName('materials')
    if (tempMaterialss.length != 1)
        return "'textures' tag misbehavior.";

    /* 'material' tags loading */
    var tempMaterials = tempMaterialss[0].getElementsByTagName('material');
    var nnones = tempMaterials.length;
    for (var i = 0; i < nnones; i++) {
        var id = tempMaterials[i].attributes.getNamedItem('id');
    }
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};


