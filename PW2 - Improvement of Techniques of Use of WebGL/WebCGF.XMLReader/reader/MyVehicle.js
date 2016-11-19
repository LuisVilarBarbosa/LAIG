/**d
 * MyVehicle
 * @constructor
 */
function MyVehicle(scene) {
    CGFobject.call(this, scene);
    this.scene = scene;

    //objects
    this.wheel;
    this.glass;
    this.bonnet;
    this.roof;
    this.left_front_fender;
    this.right_front_fender;
    this.rear_bumper;
    this.front_bumper;
    this.left_panel;
    this.right_panel;
    this.bottom;
    this.interior;
    this.interior_roof;
    this.interior_glass;
    this.left_side;
    this.right_side;
    this.interior_left_side;
    this.interior_right_side;

    //materials
    this.glass_material;
    this.paint_material;
    this.interior_material;

    this.init_materials()
    this.init_objects();

};

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor = MyVehicle;

MyVehicle.prototype.init_materials = function () {

    this.paint_material = new CGFappearance(this.scene);
    this.paint_material.setAmbient(0.441/2, 0.507/2, 0.129/2, 1);
    this.paint_material.setDiffuse(0.441, 0.507, 0.129, 1);
    this.paint_material.setSpecular(0.9, 0.9, 0.9, 1);
    this.paint_material.setShininess(500);

    this.glass_material = new CGFappearance(this.scene);
    this.glass_material.setAmbient(0, 0, 0, 0.2);
    this.glass_material.setDiffuse(0.1, 0.1, 0.1, 0.2);
    this.glass_material.setSpecular(0.9, 0.9, 0.9, 0.2);
    this.glass_material.setShininess(5000);

    this.interior_material = new CGFappearance(this.scene);
    this.interior_material.setAmbient(0.5, 0.5, 0.5, 1);
    this.interior_material.setDiffuse(1, 0.867, 0.678, 1);
    this.interior_material.setSpecular(0, 0, 0, 1);
    this.interior_material.setShininess(50);

}

MyVehicle.prototype.init_objects = function () {
    windshield_CP =  [
                        // U = 0
                        [-1, -0.5, 0.5, 1],
                        [-0.95, 0, 0.25, 1],
                        [-0.90, 0.5, 0, 1],

                        // U = 1
                        [0, -0.5, 0.7, 1],
                        [0, 0, 0.45, 1],
                        [0, 0.5, 0.2, 1],

                        // U = 2
                        [1, -0.5, 0.5, 1],
                        [0.95, 0, 0.25, 1],
                        [0.90, 0.5, 0, 1]
                    ];

    bonnet_CP = [
                    // U = 0
                    [1, -0.5, 0.5, 1],
                    [1, -0.5, 3, 1],
                    [1, -1.1, 3.7, 1],

                    // U = 1
                    [0, -0.5, 0.7, 1],
                    [0, -0.5, 3, 1],
                    [0, -1.1, 3.7, 1],

                    // U = 2
                    [-1, -0.5, 0.5, 1],
                    [-1, -0.5, 3, 1],
                    [-1, -1.1, 3.7, 1]
                ];

    roof_CP =   [
                    // U = 0
                    [-0.90, 0.5, 0, 1],
                    [-0.95, 0.2, -2, 1],
                    [-1, -0.5, -3, 1],

                    // U = 1
                    [0, 0.5, 0.2, 1],
                    [0, 0.2, -2, 1],
                    [0, -0.5, -3, 1],

                    // U = 2
                    [0.90, 0.5, 0, 1],
                    [0.95, 0.2, -2, 1],
                    [1, -0.5, -3, 1]
                ];

    left_front_fender_CP =  [
                                // U = 0
                                [1, -1.5, 3, 1],
                                [1, -1.3, 3.3, 1],
                                [1, -1.1, 3.7, 1],

                                // U = 1
                                [1, -1.5, 2.8, 1],
                                [1, -1.0, 3.1, 1],
                                [1, -0.5, 3.5, 1],

                                // U = 2
                                [1, -1.5, 0.5, 1],
                                [1, -1.0, 0.5, 1],
                                [1, -0.5, 0.5, 1]
                            ];

    right_front_fender_CP =  [
                                // U = 0
                                [-1, -1.5, 0.5, 1],
                                [-1, -1.0, 0.5, 1],
                                [-1, -0.5, 0.5, 1],

                                // U = 1
                                [-1, -1.5, 2.8, 1],
                                [-1, -1.0, 3.1, 1],
                                [-1, -0.5, 3.5, 1],

                                // U = 2
                                [-1, -1.5, 3, 1],
                                [-1, -1.3, 3.3, 1],
                                [-1, -1.1, 3.7, 1]
                            ];
    rear_bumper_CP =    [
                            // U = 0
                            [1, -1.5, -2.5, 1],
                            [1, -0.5, -3, 1],

                            // U = 1
                            [-1, -1.5, -2.5, 1],
                            [-1, -0.5, -3, 1]
                        ];

    front_bumper_CP =   [
                            // U = 0
                            [-1, -1.5, 3, 1],
                            [-1, -1.3, 3.3, 1],
                            [-1, -1.1, 3.7, 1],

                            // U = 1
                            [1, -1.5, 3, 1],
                            [1, -1.3, 3.3, 1],
                            [1, -1.1, 3.7, 1]
                        ];

    left_panel_CP = [
                        // U = 0
                        [1, -1.5, 0.5, 1],
                        [1, -0.5, 0.5, 1],

                        // U = 1
                        [1, -1.5, -2.5, 1],
                        [1, -0.5, -3, 1]
                    ];

    rigth_panel_CP =[
                        // U = 0
                        [-1, -1.5, -2.5, 1],
                        [-1, -0.5, -3, 1],

                        // U = 1
                        [-1, -1.5, 0.5, 1],
                        [-1, -0.5, 0.5, 1]
                    ];
    bottom_CP = [
                    // U = 0
                    [-1, -1.5, 3, 1],
                    [1, -1.5, 3, 1],

                    // U = 1
                    [-1, -1.5, -2.5, 1],
                    [1, -1.5, -2.5, 1]
                ];

    interior_CP =   [
                        // U = 0
                        [1, -0.5, -3, 1],
                        [1, -0.5, 0.5, 1],

                        // U = 1
                        [0, -0.5, -3, 1],
                        [0, -0.5, 0.7, 1],


                        [-1, -0.5, -3, 1],
                        [-1, -0.5, 0.5, 1]
                    ];

    interior_roof_CP =  [
                            // U = 0
                            [0.90, 0.5, 0, 1],
                            [0.95, 0.2, -2, 1],
                            [1, -0.5, -3, 1],

                            // U = 1
                            [0, 0.5, 0.2, 1],
                            [0, 0.2, -2, 1],
                            [0, -0.5, -3, 1],

                            // U = 2
                            [-0.90, 0.5, 0, 1],
                            [-0.95, 0.2, -2, 1],
                            [-1, -0.5, -3, 1]
                        ];

    interior_glass_CP = [
                            // U = 0
                            [1, -0.5, 0.5, 1],
                            [0.95, 0, 0.25, 1],
                            [0.90, 0.5, 0, 1],

                            // U = 1
                            [0, -0.5, 0.7, 1],
                            [0, 0, 0.45, 1],
                            [0, 0.5, 0.2, 1],

                            // U = 2
                            [-1, -0.5, 0.5, 1],
                            [-0.95, 0, 0.25, 1],
                            [-0.90, 0.5, 0, 1]
                        ];

    left_side_CP =  [
                        // U = 0
                        [0.9, -0.5, -1.5, 1],
                        [0.9, 0.175, -1.5, 1],

                        // U = 1
                        [0.95, -0.5, -2.25, 1],
                        [0.95, -0.05, -2.3, 1],

                        // U = 2
                        [1, -0.5, -3, 1],
                        [1, -0.5, -3, 1]
                    ];

    right_side_CP = [
                        // U = 0
                        [-1, -0.5, -3, 1],
                        [-1, -0.5, -3, 1],

                        // U = 1
                        [-0.95, -0.5, -2.25, 1],
                        [-0.95, -0.05, -2.3, 1],

                        // U = 2
                        [-0.9, -0.5, -1.5, 1],
                        [-0.9, 0.175, -1.5, 1]
                    ];

    interior_left_side_CP = [
                                // U = 0
                                [1, -0.5, -3, 1],
                                [1, -0.5, -3, 1],

                                // U = 1
                                [0.95, -0.5, -2.25, 1],
                                [0.95, -0.05, -2.3, 1],

                                // U = 2
                                [0.9, -0.5, -1.5, 1],
                                [0.9, 0.175, -1.5, 1]
                            ];

    interior_right_side_CP =[
                                // U = 0
                                [-0.9, -0.5, -1.5, 1],
                                [-0.9, 0.175, -1.5, 1],

                                // U = 1
                                [-0.95, -0.5, -2.25, 1],
                                [-0.95, -0.05, -2.3, 1],

                                // U = 2
                                [-1, -0.5, -3, 1],
                                [-1, -0.5, -3, 1]
                            ];


    this.wheel = new MyWheel(this.scene);
    this.glass = new MyNurbsPatch(this.scene, 2, 2, 20, 20, windshield_CP);
    this.bonnet = new MyNurbsPatch(this.scene, 2, 2, 200, 200, bonnet_CP);
    this.roof = new MyNurbsPatch(this.scene, 2, 2, 200, 200, roof_CP);
    this.left_front_fender = new MyNurbsPatch(this.scene, 2, 2, 20, 20, left_front_fender_CP);
    this.right_front_fender = new MyNurbsPatch(this.scene,2, 2, 20, 20, right_front_fender_CP);
    this.rear_bumper = new MyNurbsPatch(this.scene, 1, 1, 20, 20, rear_bumper_CP);
    this.front_bumper = new MyNurbsPatch(this.scene, 1, 2, 20, 20, front_bumper_CP);
    this.left_panel = new MyNurbsPatch(this.scene, 1, 1, 20, 20, left_panel_CP);
    this.right_panel = new MyNurbsPatch(this.scene, 1, 1, 20, 20, rigth_panel_CP);
    this.bottom = new MyNurbsPatch(this.scene, 1, 1, 20, 20, bottom_CP);
    this.interior = new MyNurbsPatch(this.scene, 2, 1, 20, 20, interior_CP);
    this.interior_roof = new MyNurbsPatch(this.scene, 2, 2, 20, 20, interior_roof_CP);
    this.interior_glass = new MyNurbsPatch(this.scene, 2, 2, 20, 20, interior_glass_CP);
    this.left_side = new MyNurbsPatch(this.scene, 2, 1, 20, 20, left_side_CP);
    this.right_side = new MyNurbsPatch(this.scene, 2, 1, 20, 20, right_side_CP);
    this.interior_left_side = new MyNurbsPatch(this.scene, 2, 1, 20, 20, interior_left_side_CP);
    this.interior_right_side = new MyNurbsPatch(this.scene, 2, 1, 20, 20, interior_right_side_CP);

}


MyVehicle.prototype.display = function () {

this.scene.pushMatrix();
    this.scene.rotate(90*Math.PI/180, 0, 1, 0);
    this.scene.scale(0.04, 0.04, 0.04);


    this.scene.pushMatrix();
        this.scene.scale(1.4, 1, 1);

        this.paint_material.apply();
        this.bonnet.display();
        this.roof.display();
        this.left_front_fender.display();
        this.right_front_fender.display();
        this.rear_bumper.display();
        this.left_panel.display();
        this.right_panel.display();
        this.front_bumper.display();
        this.bottom.display();
        this.left_side.display();
        this.right_side.display();

        this.glass_material.apply();
        this.interior_glass.display();
        this.glass.display();

        this.interior_material.apply();
        this.interior_right_side.display();
        this.interior_left_side.display();
        this.interior.display();
        this.interior_roof.display();

        this.scene.defaultAppearance.apply();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(1.4, -1.4, -1.5);
        this.scene.scale(0.8, 0.8, 0.8);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.wheel.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(1.4, -1.4, 2);
        this.scene.scale(0.8, 0.8, 0.8);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.wheel.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(-1.4, -1.4, -1.5);
        this.scene.scale(0.8, 0.8, 0.8);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.wheel.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(-1.4, -1.4, 2);
        this.scene.scale(0.8, 0.8, 0.8);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.wheel.display();
    this.scene.popMatrix();
this.scene.popMatrix();
};
