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

    this.lights = this.gui.addFolder("Lights");
    this.lights.open();
    for (var i = 0; i < this.scene.lightsIds.length; i++)
        this.lights.add(this.scene.lights[i], 'enabled').name(this.scene.lightsIds[i]);

    return true;
};

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
    if (event.keyCode == 118 || event.keyCode == 86); // 'v' || 'V'
    else if (event.keyCode == 109 || event.keyCode == 77); // 'm' || 'M'
};
