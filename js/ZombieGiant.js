export function ZombieGiant(){		

		this.zombie = [];

		this.body_Id = 0;
		this.head_Id = 1;
		this.left_leg_Id = 2;
		this.right_leg_Id = 3;
		this.left_arm_Id = 4;
		this.right_arm_Id = 5;
		this.numNodes = 6;
		
		var loader = new THREE.TextureLoader();
        
        
        var body_geometry      = new THREE.BoxGeometry( 4, 6, 2);
        var head_geometry      = new THREE.BoxGeometry( 4, 4, 4);
        var left_leg_geometry  = new THREE.BoxGeometry( 2, 6, 2);
        var right_leg_geometry = new THREE.BoxGeometry( 2, 6, 2);
        var left_arm_geometry  = new THREE.BoxGeometry( 2, 6, 2);
        var right_arm_geometry = new THREE.BoxGeometry( 2, 6, 2);                                                                                                

        // HEAD
        var texture0 = loader.load( 'resources/ZombieGiant/head_right.png' );
		var texture1 = loader.load( 'resources/ZombieGiant/head_left.png' );
		var texture2 = loader.load( 'resources/ZombieGiant/head_top.png' );
		var texture3 = loader.load( 'resources/ZombieGiant/head_bottom.png' );
		var texture4 = loader.load( 'resources/ZombieGiant/head_back.png' );
		var texture5 = loader.load( 'resources/ZombieGiant/head_front.png' );

        var head_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var head_material = new THREE.MeshFaceMaterial( head_materials );

		// BODY
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

		// LEFT LEG
		texture0 = loader.load( 'resources/ZombieArancione/left_leg_right.png' );
		texture1 = loader.load( 'resources/ZombieArancione/left_leg_left.png' );
		texture2 = loader.load( 'resources/ZombieArancione/left_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieArancione/left_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieArancione/left_leg_back.png' );
		texture5 = loader.load( 'resources/ZombieArancione/left_leg_front.png' );

        var left_leg_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var left_leg_material = new THREE.MeshFaceMaterial( left_leg_materials );

		// RIGHT LEG
		texture0 = loader.load( 'resources/ZombieArancione/right_leg_right.png' );
		texture1 = loader.load( 'resources/ZombieArancione/right_leg_left.png' );
		texture2 = loader.load( 'resources/ZombieArancione/right_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieArancione/right_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieArancione/right_leg_back.png' );
		texture5 = loader.load( 'resources/ZombieArancione/right_leg_front.png' );

        var right_leg_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var right_leg_material = new THREE.MeshFaceMaterial( right_leg_materials );

		// LEFT ARM
		texture0 = loader.load( 'resources/ZombieArancione/left_arm_right.png' );
		texture1 = loader.load( 'resources/ZombieArancione/left_arm_left.png' );
		texture2 = loader.load( 'resources/ZombieArancione/left_arm_top.png' );
		texture3 = loader.load( 'resources/ZombieArancione/left_arm_bottom.png' );
		texture4 = loader.load( 'resources/ZombieArancione/left_arm_back.png' );
		texture5 = loader.load( 'resources/ZombieArancione/left_arm_front.png' );

        var left_arm_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var left_arm_material = new THREE.MeshFaceMaterial( left_arm_materials );

		// RIGHT ARM
		texture0 = loader.load( 'resources/ZombieArancione/right_arm_right.png' );
		texture1 = loader.load( 'resources/ZombieArancione/right_arm_left.png' );
		texture2 = loader.load( 'resources/ZombieArancione/right_arm_top.png' );
		texture3 = loader.load( 'resources/ZombieArancione/right_arm_bottom.png' );
		texture4 = loader.load( 'resources/ZombieArancione/right_arm_back.png' );
		texture5 = loader.load( 'resources/ZombieArancione/right_arm_front.png' );

        var right_arm_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var right_arm_material = new THREE.MeshFaceMaterial( right_arm_materials );


        var body      = new THREE.Mesh( body_geometry, body_material);
       	var head      = new THREE.Mesh( head_geometry, head_material );
        var left_leg  = new THREE.Mesh( left_leg_geometry, left_leg_material);
        var right_leg = new THREE.Mesh( right_leg_geometry, right_leg_material);
        var left_arm  = new THREE.Mesh( left_arm_geometry, left_arm_material);
        var right_arm = new THREE.Mesh( right_arm_geometry, right_arm_material);
       
        this.zombie[this.body_Id]      = body;
        this.zombie[this.head_Id]      = head;
        this.zombie[this.left_leg_Id]  = left_leg;
        this.zombie[this.right_leg_Id] = right_leg;
        this.zombie[this.left_arm_Id]  = left_arm;
        this.zombie[this.right_arm_Id] = right_arm;
        
        body.position.set(0, left_leg_geometry.parameters.height/2+body_geometry.parameters.height, 0);
        head.position.set(0, left_leg_geometry.parameters.height/2+body_geometry.parameters.height+head_geometry.parameters.height+0.1, 0);
        left_leg.position.set(-left_leg_geometry.parameters.width/2, left_leg_geometry.parameters.height/2, 0);
        right_leg.position.set(right_leg_geometry.parameters.width/2, right_leg_geometry.parameters.height/2, 0);
        left_arm.position.set(-(body_geometry.parameters.width+left_arm_geometry.parameters.width)/2, left_leg_geometry.parameters.height/2+left_arm_geometry.parameters.height*1.3, -right_leg_geometry.parameters.height/4);
        right_arm.position.set((body_geometry.parameters.width+right_arm_geometry.parameters.width)/2, right_leg_geometry.parameters.height/2+right_arm_geometry.parameters.height*1.3, -right_leg_geometry.parameters.height/4);
}