export function Zombie(){
		

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
		this.numNodes = 6;
		//var zombie = [];


		var loader = new THREE.TextureLoader();
        //load('resources/zombie.png', function(texture) {body.background = texture;});
        
        var body_geometry      = new THREE.BoxGeometry( 0.4, 0.6, 0.2);
        //var neck_geometry      = new THREE.BoxGeometry( 0.1, 0.05, 0.085);
        var head_geometry      = new THREE.BoxGeometry( 0.4, 0.4, 0.4);
        var left_leg_geometry  = new THREE.BoxGeometry( 0.2, 0.6, 0.2);
        var right_leg_geometry = new THREE.BoxGeometry( 0.2, 0.6, 0.2);
        var left_arm_geometry  = new THREE.BoxGeometry( 0.2, 0.6, 0.2);
        var right_arm_geometry = new THREE.BoxGeometry( 0.2, 0.6, 0.2);
        //var left_eye_geometry  = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var right_eye_geometry = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var nose_geometry      = new THREE.BoxGeometry( 0.09, 0.045, 0.1)

        //var body_material      = new THREE.MeshLambertMaterial({color: 0x00ff00});
        // var body_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/ZombieArancione/zombie_arancione.png')});
        // var head_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/ZombieArancione/head_front.png'), function(texture){
        //                                                                                                                 texture.offset(new THREE.Vector2(15,15));
        //                                                                                                             } 
        //                                                                                                 });

        var texture0 = loader.load( 'resources/ZombieArancione/head_right.png' );
		var texture1 = loader.load( 'resources/ZombieArancione/head_left.png' );
		var texture2 = loader.load( 'resources/ZombieArancione/head_top.png' );
		var texture3 = loader.load( 'resources/ZombieArancione/head_bottom.png' );
		var texture4 = loader.load( 'resources/ZombieArancione/head_back.png' );
		var texture5 = loader.load( 'resources/ZombieArancione/head_front.png' );

        var head_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var head_material = new THREE.MeshFaceMaterial( head_materials );

		texture0 = loader.load( 'resources/ZombieArancione/body_right.png' );
		texture1 = loader.load( 'resources/ZombieArancione/body_left.png' );
		texture2 = loader.load( 'resources/ZombieArancione/body_top.png' );
		texture3 = loader.load( 'resources/ZombieArancione/body_bottom.png' );
		texture4 = loader.load( 'resources/ZombieArancione/body_back.png' );
		texture5 = loader.load( 'resources/ZombieArancione/body_front.png' );

        var body_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var body_material = new THREE.MeshFaceMaterial( body_materials );

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
        var head      = new THREE.Mesh( head_geometry, head_material );
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
        // for ( var i = 0; i < numNodes; i++)
        //     scene.add(zombie[i]);
        
        //___________________HIERACHICAL OBJECT_________________
        //Parent.attach(son): method that joints parent and son
        //Parent.detach(son): method that disjoints parent and son

        //body.attach(neck);
        body.attach(head);
        body.attach(left_leg);
        body.attach(right_leg);
        body.attach(left_arm);
        body.attach(right_arm);
        //head.attach(left_eye);
        //head.attach(right_eye);
        //head.attach(nose);

        body.position.set(0, left_leg_geometry.parameters.height+body_geometry.parameters.height, 0);
        //neck.position.set(0, 0.3, 0);
        head.position.set(0, left_leg_geometry.parameters.height+body_geometry.parameters.height+head_geometry.parameters.height+0.1, 0);
        left_leg.position.set(-left_leg_geometry.parameters.width/2, left_leg_geometry.parameters.height, 0);
        right_leg.position.set(right_leg_geometry.parameters.width/2, right_leg_geometry.parameters.height, 0);
        left_arm.position.set(-(body_geometry.parameters.width+left_arm_geometry.parameters.width)/2, left_leg_geometry.parameters.height+left_arm_geometry.parameters.height, 0);
        right_arm.position.set((body_geometry.parameters.width+right_arm_geometry.parameters.width)/2, right_leg_geometry.parameters.height+right_arm_geometry.parameters.height, 0);
        //left_eye.position.set(-0.1, 0, -0.15);
        //right_eye.position.set(0.1, 0, -0.15);
        //nose.position.set(0, -0.04, -0.15)

}