/**
 * MyInterface
 * @constructor
 */
function MyInterface() {
    //call CGFinterface constructor
    CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function (application) {
    // call CGFinterface init
    CGFinterface.prototype.init.call(this, application);

    // init GUI. For more information on the methods, check:
    //  http://workshop.chromeexperiments.com/examples/gui

    this.gui = new dat.GUI();

    this.omniLights = this.gui.addFolder("Omnidirectional lights");
    this.omniLights.open();
    this.spotLights = this.gui.addFolder("Spot lights");
    this.spotLights.open();

    this.gui.add(this.scene, 'mode', { cc: 0, ch: 1, hh: 2 });
    this.gui.add(this.scene, 'level', { easy: 0, hard: 1 });
    this.gui.add(this.scene.game, 'timer').listen();
    this.gui.add(this.scene.game, 'scorer').listen();
    this.gui.add(this.scene.game, 'maxMoveTime', 1, 300);
	this.gui.add(this.scene.game, 'selectScene', { none: 0, snow: 1, sand: 2, space:3 });

    return true;
};

MyInterface.prototype.addLight = function (id, light, lightType) {
    if (lightType == "omni")
        this.omniLights.add(light, 'enabled').name(id);
    else if (lightType == "spot")
        this.spotLights.add(light, 'enabled').name(id);
    else
        console.warn("Unable to add to the interface the light '" + id + "' - unrecognized light type.");
}

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function (event) {
    // call CGFinterface default code (omit if you want to override)
    CGFinterface.prototype.processKeyboard.call(this, event);

    // Check key codes e.g. here: http://www.asciitable.com/
    // or use String.fromCharCode(event.keyCode) to compare chars

    // for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
    if (event.keyCode == 118 || event.keyCode == 86) // 'v' || 'V'
        this.scene.nextView();
    else if (event.keyCode == 109 || event.keyCode == 77) // 'm' || 'M'
        this.scene.nextMaterial();
};
