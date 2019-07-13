function Zombie(){
		

		this.zombie = [];

		var body_Id = 0;
		//var neck_Id = 1;
		var head_Id = 1;
		var left_leg_Id = 2;
		var right_leg_Id = 3;
		var left_arm_Id = 4;
		var right_arm_Id = 5;
		//var left_eye_Id = 6;
		//var right_eye_Id = 7;
		//var nose_Id = 8;
		var numNodes = 6;
		//var zombie = [];


		var loader = new THREE.TextureLoader();
        //load('resources/zombie.png', function(texture) {body.background = texture;});
        
        var body_geometry      = new THREE.BoxGeometry( 0.4, 0.55, 0.25);
        //var neck_geometry      = new THREE.BoxGeometry( 0.1, 0.05, 0.085);
        var head_geometry      = new THREE.BoxGeometry( 0.4, 0.25, 0.35);
        var left_leg_geometry  = new THREE.BoxGeometry( 0.2, 0.6, 0.25);
        var right_leg_geometry = new THREE.BoxGeometry( 0.2, 0.6, 0.25);
        var left_arm_geometry  = new THREE.BoxGeometry( 0.19, 0.65, 0.25);
        var right_arm_geometry = new THREE.BoxGeometry( 0.19, 0.65, 0.25);
        //var left_eye_geometry  = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var right_eye_geometry = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var nose_geometry      = new THREE.BoxGeometry( 0.09, 0.045, 0.1)

        //var body_material      = new THREE.MeshLambertMaterial({color: 0x00ff00});
        var body_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/zombie_arancione.png')});
        var head_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/zombie_arancione.png'), function(texture){
                                                                                                                        texture.offset(new THREE.Vector2(15,15));
                                                                                                                    } 
                                                                                                        });
        //var neck_material      = new THREE.MeshLambertMaterial({color: 0x000000});
        //var head_material      = new THREE.MeshLambertMaterial({color: 0xe107a9});
        var left_leg_material  = new THREE.MeshLambertMaterial({color: 0x2a4acd});
        var right_leg_material = new THREE.MeshLambertMaterial({color: 0x2a4acd});
        var left_arm_material  = new THREE.MeshLambertMaterial({color: 0xfeff11});
        var right_arm_material = new THREE.MeshLambertMaterial({color: 0xfeff11});
        //var left_eye_material  = new THREE.MeshLambertMaterial({color: 0x000000});
        //var right_eye_material = new THREE.MeshLambertMaterial({color: 0x000000});
        //var nose_material = new THREE.MeshLambertMaterial({color: 0x000000});
        
        var body      = new THREE.Mesh( body_geometry, body_material);
        //var neck      = new THREE.Mesh( neck_geometry, neck_material);
        var head      = new THREE.Mesh( head_geometry, head_material);
        var left_leg  = new THREE.Mesh( left_leg_geometry, left_leg_material);
        var right_leg = new THREE.Mesh( right_leg_geometry, right_leg_material);
        var left_arm  = new THREE.Mesh( left_arm_geometry, left_arm_material);
        var right_arm = new THREE.Mesh( right_arm_geometry, right_arm_material);
        //var left_eye  = new THREE.Mesh(left_eye_geometry, left_eye_material);
        //var right_eye = new THREE.Mesh(right_eye_geometry, right_eye_material);
        //var nose      = new THREE.Mesh(nose_geometry, nose_material); 

        this.zombie[body_Id]      = body;
        //zombie[neck_Id]      = neck;
        this.zombie[head_Id]      = head;
        this.zombie[left_leg_Id]  = left_leg;
        this.zombie[right_leg_Id] = right_leg;
        this.zombie[left_arm_Id]  = left_arm;
        this.zombie[right_arm_Id] = right_arm;
        //zombie[left_eye_Id]  = left_eye;
        //zombie[right_eye_Id] = right_eye;
        //zombie[nose_Id]      = nose;
        /*
        scene.add(body);
        scene.add(neck);
        scene.add(head);
        scene.add(left_leg);
        scene.add(right_leg);
        scene.add(left_arm);
        scene.add(right_arm);
        */
        for ( var i = 0; i < numNodes; i++)
            scene.add(zombie[i]);
        
        //___________________HIERACHICAL OBJECT_________________
        //Parent.attach(son): method that joints parent and son
        //Parent.detach(son): method that disjoints parent and son

        //body.attach(neck);
        this.body.attach(head);
        this.body.attach(left_leg);
        this.body.attach(right_leg);
        this.body.attach(left_arm);
        this.body.attach(right_arm);
        //head.attach(left_eye);
        //head.attach(right_eye);
        //head.attach(nose);
        
        this.body.position.set(0, 1.5, 0);
        //neck.position.set(0, 0.3, 0);
        this.head.position.set(0, 0.4, 0);
        this.left_leg.position.set(-0.3, -0.02, 0);
        this.right_leg.position.set(0.3, -0.02, 0);
        this.left_arm.position.set(-0.1, -0.6, 0);
        this.right_arm.position.set(0.1, -0.6, 0);
        //left_eye.position.set(-0.1, 0, -0.15);
        //right_eye.position.set(0.1, 0, -0.15);
        //nose.position.set(0, -0.04, -0.15)

}