export function ZombieGiant(){		

		this.zombie = [];

		this.body_Id = 0;
		this.head_Id = 1;
		this.left_leg_top_Id = 2;
		this.left_leg_bottom_Id = 3;
		this.right_leg_top_Id = 4;
		this.right_leg_bottom_Id = 5;
		this.left_arm_Id = 6;
		this.right_arm_Id = 7;
		this.bottom_cube_Id = 8;
		this.numNodes = 9;
		
		var loader = new THREE.TextureLoader();
        
        
        var body_geometry      = new THREE.BoxGeometry( 4, 6, 2);
        var head_geometry      = new THREE.BoxGeometry( 4, 4, 4);
        var left_leg_top_geometry  = new THREE.BoxGeometry( 2, 3, 2);
        var left_leg_bottom_geometry  = new THREE.BoxGeometry( 2, 3, 2);
        var right_leg_top_geometry = new THREE.BoxGeometry( 2, 3, 2);
        var right_leg_bottom_geometry = new THREE.BoxGeometry( 2, 3, 2);
        var left_arm_geometry  = new THREE.BoxGeometry( 2, 6, 2);
        var right_arm_geometry = new THREE.BoxGeometry( 2, 6, 2);
        var bottom_cube_geometry = new THREE.BoxGeometry( 2, 10, 4);

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
		texture0 = loader.load( 'resources/ZombieGiant/body_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/body_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/body_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/body_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/body_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/body_front.png' );

        var body_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var body_material = new THREE.MeshFaceMaterial( body_materials );

		// LEFT LEG TOP
		texture0 = loader.load( 'resources/ZombieGiant/left_leg_up_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/left_leg_up_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/left_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/left_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/left_leg_up_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/left_leg_up_front.png' );

        var left_leg_top_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var left_leg_top_material = new THREE.MeshFaceMaterial( left_leg_top_materials );

		// LEFT LEG BOTTOM
		texture0 = loader.load( 'resources/ZombieGiant/left_leg_down_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/left_leg_down_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/left_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/left_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/left_leg_down_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/left_leg_down_front.png' );

		var left_leg_bottom_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var left_leg_bottom_material = new THREE.MeshFaceMaterial( left_leg_bottom_materials );

		// RIGHT LEG TOP
		texture0 = loader.load( 'resources/ZombieGiant/right_leg_up_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/right_leg_up_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/right_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/right_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/right_leg_up_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/right_leg_up_front.png' );

        var right_leg_top_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var right_leg_top_material = new THREE.MeshFaceMaterial( right_leg_top_materials );

		// RIGHT LEG BOTTOM
		texture0 = loader.load( 'resources/ZombieGiant/right_leg_down_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/right_leg_down_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/right_leg_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/right_leg_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/right_leg_down_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/right_leg_down_front.png' );

		var right_leg_bottom_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var right_leg_bottom_material = new THREE.MeshFaceMaterial( right_leg_bottom_materials );

		// LEFT ARM
		texture0 = loader.load( 'resources/ZombieGiant/left_arm_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/left_arm_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/left_arm_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/left_arm_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/left_arm_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/left_arm_front.png' );

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
		texture0 = loader.load( 'resources/ZombieGiant/right_arm_right.png' );
		texture1 = loader.load( 'resources/ZombieGiant/right_arm_left.png' );
		texture2 = loader.load( 'resources/ZombieGiant/right_arm_top.png' );
		texture3 = loader.load( 'resources/ZombieGiant/right_arm_bottom.png' );
		texture4 = loader.load( 'resources/ZombieGiant/right_arm_back.png' );
		texture5 = loader.load( 'resources/ZombieGiant/right_arm_front.png' );

        var right_arm_materials = [
		    new THREE.MeshBasicMaterial( { map: texture0 } ),
		    new THREE.MeshBasicMaterial( { map: texture1 } ),
		    new THREE.MeshBasicMaterial( { map: texture2 } ),
		    new THREE.MeshBasicMaterial( { map: texture3 } ),
		    new THREE.MeshBasicMaterial( { map: texture4 } ),
		    new THREE.MeshBasicMaterial( { map: texture5 } )
		];
		var right_arm_material = new THREE.MeshFaceMaterial( right_arm_materials );

		// BOTTOM CUBE
		var bottom_cube_material = new THREE.MeshBasicMaterial({
	   			color: 0xffffff,
	    		side: THREE.DoubleSide,
	    		transparent: true,
	    		opacity: 0
		});


        var body      = new THREE.Mesh( body_geometry, body_material);
       	var head      = new THREE.Mesh( head_geometry, head_material );
        var left_leg_top  = new THREE.Mesh( left_leg_top_geometry, left_leg_top_material);
        var left_leg_bottom  = new THREE.Mesh( left_leg_bottom_geometry, left_leg_bottom_material);
        var right_leg_top = new THREE.Mesh( right_leg_top_geometry, right_leg_top_material);
        var right_leg_bottom = new THREE.Mesh( right_leg_bottom_geometry, right_leg_bottom_material);
        var left_arm  = new THREE.Mesh( left_arm_geometry, left_arm_material);
        var right_arm = new THREE.Mesh( right_arm_geometry, right_arm_material);
        var bottom_cube = new THREE.Mesh( bottom_cube_geometry, bottom_cube_material);
       
        this.zombie[this.body_Id]      = body;
        this.zombie[this.head_Id]      = head;
        this.zombie[this.left_leg_top_Id]  = left_leg_top;
        this.zombie[this.left_leg_bottom_Id]  = left_leg_bottom;
        this.zombie[this.right_leg_top_Id] = right_leg_top;
        this.zombie[this.right_leg_bottom_Id] = right_leg_bottom;
        this.zombie[this.left_arm_Id]  = left_arm;
        this.zombie[this.right_arm_Id] = right_arm;
        this.zombie[this.bottom_cube_Id] = bottom_cube;

        var base_len = left_leg_top_geometry.parameters.height/2 + left_leg_bottom_geometry.parameters.height/2;
        body.position.set(0, base_len+body_geometry.parameters.height, 0);
        head.position.set(0, base_len+body_geometry.parameters.height+head_geometry.parameters.height+0.1, 0);
        left_leg_top.position.set(-left_leg_top_geometry.parameters.width/2, base_len+left_leg_top_geometry.parameters.height/2, 0);
        left_leg_bottom.position.set(-left_leg_bottom_geometry.parameters.width/2, base_len/2, 0);
        right_leg_top.position.set(right_leg_top_geometry.parameters.width/2, base_len+right_leg_top_geometry.parameters.height/2, 0);
        right_leg_bottom.position.set(right_leg_bottom_geometry.parameters.width/2, base_len/2, 0);
        left_arm.position.set(-(body_geometry.parameters.width+left_arm_geometry.parameters.width)/2, base_len+left_arm_geometry.parameters.height*1.3, -base_len/4);
        right_arm.position.set((body_geometry.parameters.width+right_arm_geometry.parameters.width)/2, base_len+right_arm_geometry.parameters.height*1.3, -base_len/4);
        bottom_cube.position.set(0, 0, 0);
}