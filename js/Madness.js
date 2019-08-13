import {Zombie} from './Zombie.js';
import {ZombieGiant} from './ZombieGiant.js';
import {ZombieHulk} from './ZombieHulk.js';

var scene, camera, renderer, mesh, clock, controls;
var raycaster = [];
var bullets = [];
var canShoot = 0;
var keyboard = {};
var score = 0;
var killed = 0;
var tempo = 10;
var MOVESPEED = 30;
var LOOKSPEED = 1;
var BULLETMOVESPEED = MOVESPEED * 5;
var DURATIONTIME = 150000; //in millisec
var NZOMBIE = 200; //20
var NZOMBIE_G = 20; //1
var NZOMBIE_H = 50;
var zombie;
var zombies = [];
var zombie_speed = 0;
var zombie_max_speed = 0.2;
var zombie_life = 1;
var zombie_giant_life = 10;
var zombie_hulk_life = 5;
var width = window.innerWidth;
var height = window.innerHeight;
var bb_side_walks = [],bb_zombies = [], bb_map = [];
var bb_player,box_player;
var previous_position;
var bb_bullet;
var eaten = false;
var tilt = false;
var tiltG = false;
var tiltH = false;
var nBlockX	= 10;
var nBlockZ	= 10;
var blockSizeX	= 50;
var blockSizeZ	= 50;
var roadW	= 8;
var roadD	= 8;
var sidewalkH	= 0.1;

var mouse = new THREE.Vector2(0,0);
var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, width / height, 0.3, 100),
    box: new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({
        color: 0x4444ff
    }))
};
var player = {
    height: 1.8,
    speed: 0.2,
    turnSpeed: Math.PI * 0.02
};
var meshes = {};
var loadingManager = null;
var RESOURCES_LOADED = false;
var models = {
    uzi: {
        obj: "models/uziGold.obj",
        mtl: "models/uziGold.mtl",
        mesh: null,
        castShadow: false
    }
};
var zombieClass;
var zombieClassBig = [];
var zombieLife = [];

window.onload = init();


function init() {


    //____________________________SCENE & CAMERA_______________________________________
    scene = new THREE.Scene();
    //scene.setGravity( new THREE.Vector3(0, -30, 0));
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.3, 1000);
    
    var texture_scene = new THREE.TextureLoader().load('resources/cielo_rosso.jpg', function(texture) {scene.background = texture;});
    scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);
    
	//Box before the game
    loadingScreen.box.position.set(0, 0, 5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = function() {
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    };

    //___________________________PROCEDURAL CITY_______________________________________
    //Basically we have 2 cities: createSquareCity() and createMrDoobCity();
    var proceduralCity = new THREEx.ProceduralCity().createSquareCity();    
    scene.add(proceduralCity);

	//Taking each sidewalk in order to avoid collision with buildings
    var i = 0;
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
    var buildingMesh = new THREE.Mesh(geometry);
    for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
      for( var blockX = 0; blockX < nBlockX; blockX++){
        // set position
        buildingMesh.position.x = (blockX+0.5-nBlockX/2)*blockSizeX
        buildingMesh.position.z = (blockZ+0.5-nBlockZ/2)*blockSizeZ

        buildingMesh.scale.x  = blockSizeX-roadW
        buildingMesh.scale.y  = sidewalkH*3;
        buildingMesh.scale.z  = blockSizeZ-roadD

        //bb_array[i] = new THREE.BoxHelper(buildingMesh,0xffff00);
        bb_side_walks[i] = new THREE.Box3().setFromObject(buildingMesh);

        //scene.add(bb_side_walks[i]);
        i++;
      }
    }
    
    //_____________________________________LIGHT________________________________________
    var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
    light.position.set(1, 1, 0.25);
    scene.add(light);

    for (var _key in models) {
        (function(key) {

            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function(materials) {
                materials.preload();

                var objLoader = new THREE.OBJLoader(loadingManager);

                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function(mesh) {

                    mesh.traverse(function(node) {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;

                            if ('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;

                });
            });

        })(_key);
    }

    // ZOMBIE SPAWNING
    for ( var i = 0; i < NZOMBIE; i++){
     	spawnZombie();
     	bb_zombies[i] = new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].head_Id]);
     	//scene.add(bb_zombies[i]);
    }
    for ( var i = NZOMBIE; i < NZOMBIE+NZOMBIE_G; i++){
      spawnZombieGiant();
      bb_zombies[i] = new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].left_leg_bottom_Id]);
      bb_zombies[i] = bb_zombies[i].union(new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].right_leg_bottom_Id]));
    }
    for ( var i = NZOMBIE+NZOMBIE_G; i < NZOMBIE+NZOMBIE_G+NZOMBIE_H; i++){
      spawnZombieHulk();
      bb_zombies[i] = new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].body_Id]);
    }

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));
    scene.add(camera);

    // height 20 to allow collision with zombies
    box_player = new THREE.Mesh( new THREE.BoxGeometry(2,20,2), new THREE.MeshBasicMaterial({transparent: true}) );
    box_player.position.set(0,0,-5);
    bb_player = new THREE.Box3().setFromObject(box_player);

    //Player previous position
    previous_position = new THREE.Vector3(camera.position);

    //scene.add(box_player);
    //scene.add(bb_player);
	
    //____Adding 4 transparent walls along all the 4 sides of the map in order to do not let the player going out_______
    //Store vertices clock-wisely
	var roofVertices = [
			new THREE.Vector3(-250,0,-250), new THREE.Vector3(-250,50,-250),new THREE.Vector3(250,50,-250),new THREE.Vector3(250,0,-250),
			new THREE.Vector3(250,0, -250), new THREE.Vector3(250,50,-250),new THREE.Vector3(250,50,250),new THREE.Vector3(250,0,250),
			new THREE.Vector3(250, 0,250), new THREE.Vector3(250,50,250),new THREE.Vector3(-250,50,250),new THREE.Vector3(-250,0,250),
			new THREE.Vector3(-250,0,250), new THREE.Vector3(-250,50,250),new THREE.Vector3(-250,50,-250),new THREE.Vector3(-250,0,-250)
		];
	var material = new THREE.MeshBasicMaterial({
	   			color: 0xffffff,
	    		side: THREE.DoubleSide,
	    		transparent: true,
	    		opacity: 0
	});
		
	
	for (var i = 0; i < roofVertices.length; i++) {

    	var v1 = roofVertices[i];
	    var v2 = roofVertices[(i+1)%roofVertices.length];//wrap last vertex back to start
	    var wallGeometry = new THREE.Geometry();
	    wallGeometry.vertices = [
	        v1,
	        v2,
	        new THREE.Vector3(v1.x, 0, v1.z),
	        new THREE.Vector3(v2.x, 0, v2.z)
	    ];
	    //always the same for simple 2-triangle plane
	    wallGeometry.faces = [new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3)];
	    wallGeometry.computeFaceNormals();
	    wallGeometry.computeVertexNormals();

		var wallMesh = new THREE.Mesh(wallGeometry, material);
		bb_map[i] = new THREE.Box3().setFromObject(wallMesh);

		scene.add(wallMesh)
  		//scene.add(bb_map[i])
	}

    renderer = new THREE.WebGLRenderer({antialiasing: true});
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    var distance = 1;
    clock = new THREE.Clock();
    controls = new THREE.FirstPersonControls(camera, scene);
    document.addEventListener('click', function() {
        if (distance > 0 && !eaten && killed != NZOMBIE+NZOMBIE_G+NZOMBIE_H) {
            controls.lock();
        }
        overlay_off();
    }, false);
    document.addEventListener('pointerlockchange', function() {
        //controls.unlock();
        if (document.pointerLockElement == null && distance > 0 && !eaten && killed != NZOMBIE+NZOMBIE_G+NZOMBIE_H) {
            overlay_on();
        }
    }, false);
    controls.movementSpeed = MOVESPEED;
    controls.lookSpeed = LOOKSPEED;
    controls.lookVertical = false; // Temporary solution; play on flat surfaces only
    controls.noFly = true;

    // Track mouse position so we know where to shoot
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Set the date we're counting down to
    var date = new Date().getTime();
    var countDownDate = date + DURATIONTIME;

    // Update the count down every 1 second
    var x = setInterval(function() {
        tempo -= 1;
        // Get the "now" date
        var now1 = new Date().getTime();

        if (overlayIsOn) {
            countDownDate += 1000;
        }

        // Find the distance between now an the count down date
        distance = countDownDate - now1;

        // var sec = Math.floor(distance / 1000);
        // document.getElementById("time").innerHTML = "<span style='font-family: Impact; font-size: 15px; color:#00FF00'>  Remaining time: " + sec + " sec" + "&nbsp&nbsp&nbsp Score: " + score + "&nbsp&nbsp&nbsp Zombies: " + (NZOMBIE + NZOMBIE_G + NZOMBIE_H - killed) + "</span>";

        // // If the count down is finished, write some text
        // if (distance < 0 || eaten || killed == NZOMBIE+NZOMBIE_G+NZOMBIE_H) {
        //   overlay_off();
        //   document.exitPointerLock();
        //   document.removeEventListener('click', function() {
        //       controls.lock();
        //   }, false);
        //   clearInterval(x);
        //   if (distance < 0) {
        //       document.getElementById("time").innerHTML = "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <h1>TIME OUT!</h1></span>";
        //   } else if (eaten) {
        //       document.getElementById("time").innerHTML = "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <h1>YOU HAVE BEEN EATEN!</h1></span>";
        //   } else if (killed == NZOMBIE+NZOMBIE_G+NZOMBIE_H) {
        //       document.getElementById("time").innerHTML = "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <h1>YOU HAVE SURVIVED!</h1></span>";
        //   }
        //   document.getElementById("ris").innerHTML = "<span style='font-family: Impact; font-size: 60px; color:#00FF00'><h1> Score:  " + score + "</span>" + "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>" + "<a href='index.html'> Restart</a>" + "</h1></span>";
        //   $(renderer.domElement).fadeOut();
        // }
    }, 1000);
    countDownDate += 1000;

    animate();
}


function onResourcesLoaded() {
    //_________________________________WEAPON SETTINGS_________________________
    meshes["playerweapon"] = models.uzi.mesh.clone();
    meshes["playerweapon"].position.set(0, 2, 0);
    meshes["playerweapon"].scale.set(10, 10, 10);
    scene.add(meshes["playerweapon"]);
    overlay_on();
}


function animate() {


    window.addEventListener('resize', onWindowResize, false);

    // ------------
    // Management of camera rotation
    var camerarotation_y;
    if (camera.rotation.z == 0)
        camerarotation_y = Math.PI - camera.rotation.y;
    else
        camerarotation_y = camera.rotation.y;
    //________________________________PLAYER COLLISION_________________________________

    box_player.position.set(camera.position.x,0,camera.position.z);
    bb_player.setFromObject(box_player);
	
	//Buildings collision walls collision
	for ( var i = 0; i < bb_side_walks.length; i++){
    	
    	if ( bb_map[i] != undefined){
    		if ( bb_player.intersectsBox( bb_map[i]) || bb_player.intersectsBox( bb_side_walks[i]))
    			camera.position.set(previous_position.x,previous_position.y,previous_position.z);
    	}

    	else{
    		if ( bb_player.intersectsBox( bb_side_walks[i]) )
    			camera.position.set(previous_position.x,previous_position.y,previous_position.z);
    	}
    }

    //______________________________ESSENTIAL FOR PLAYER COLLISION________________________________
    //It is first initialized as the camera position in the init() function. Hence, it is updated
    //only iff there is NO COLLISION.
    previous_position = new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z);

    if (!overlayIsOn) {
      if (NZOMBIE + NZOMBIE_G + NZOMBIE_H == killed + 1) 
        zombie_speed = zombie_max_speed;

      // ZOMBIE NORMAL ANIMATION
      for ( var i = 0; i < NZOMBIE; i++) {
        if (zombieLife[i] > 0) {
          if (zombies[i][zombieClassBig[i].body_Id].position.z != undefined) {
            var v = new THREE.Vector3();
            v.subVectors(zombies[i][zombieClassBig[i].body_Id].position, camera.position).add(zombies[i][zombieClassBig[i].body_Id].position);
            zombies[i][zombieClassBig[i].body_Id].lookAt(v);

            if (zombies[i][zombieClassBig[i].body_Id].position.x < camera.position.x - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x += zombie_speed;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.x > camera.position.x + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x -= zombie_speed;
            }
            if (zombies[i][zombieClassBig[i].body_Id].position.z < camera.position.z - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z += zombie_speed;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.z > camera.position.z + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z -= zombie_speed;
            }
          }

          //Bounding box updates
          bb_zombies[i].setFromObject(zombies[i][zombieClassBig[i].head_Id]);

          if (zombies[i][zombieClassBig[i].left_arm_Id].rotation.x > 1.8){
            tilt = true;
          } else if ( zombies[i][zombieClassBig[i].left_arm_Id].rotation.x < 1.1){
            tilt = false;
          }

        	if (tilt) {
            zombies[i][zombieClassBig[i].left_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y -= 0.002;
            zombies[i][zombieClassBig[i].right_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y += 0.002;
            zombies[i][zombieClassBig[i].left_leg_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].left_leg_Id].position.z += 0.003;
            // zombies[i][zombieClassBig[i].left_leg_Id].position.y += 0.001;
            zombies[i][zombieClassBig[i].right_leg_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].right_leg_Id].position.z -= 0.003;
            // zombies[i][zombieClassBig[i].right_leg_Id].position.y -= 0.001;
          } else {
        		zombies[i][zombieClassBig[i].left_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y += 0.002;
        		zombies[i][zombieClassBig[i].right_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y -= 0.002;
            zombies[i][zombieClassBig[i].left_leg_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].left_leg_Id].position.z -= 0.003;
            // zombies[i][zombieClassBig[i].left_leg_Id].position.y -= 0.001;
            zombies[i][zombieClassBig[i].right_leg_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].right_leg_Id].position.z += 0.003;
            // zombies[i][zombieClassBig[i].right_leg_Id].position.y += 0.001;
        	}

          if (bb_zombies[i].intersectsBox(bb_player)) {
            // eaten = true;
          }
        } else {
          zombies[i][zombieClassBig[i].body_Id].rotation.y += 0.1;

          if (Math.round(zombies[i][zombieClassBig[i].body_Id].rotation.y) >= 4) {
            scene.remove(zombies[i][zombieClassBig[i].body_Id]);
            //scene.remove(bb_zombies[i]);
          }
        }
      }
      // ZOMBIE GIANT ANIMATION
      for ( var i = NZOMBIE; i < NZOMBIE+NZOMBIE_G; i++) {
        if (zombieLife[i] > 0) {
          if (zombies[i][zombieClassBig[i].body_Id].position.z != undefined) {
            var v = new THREE.Vector3();
            v.subVectors(zombies[i][zombieClassBig[i].body_Id].position, camera.position).add(zombies[i][zombieClassBig[i].body_Id].position);
            zombies[i][zombieClassBig[i].body_Id].lookAt(v);

            if (zombies[i][zombieClassBig[i].body_Id].position.x < camera.position.x - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x += zombie_speed*2;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.x > camera.position.x + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x -= zombie_speed*2;
            }
            if (zombies[i][zombieClassBig[i].body_Id].position.z < camera.position.z - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z += zombie_speed*2;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.z > camera.position.z + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z -= zombie_speed*2;
            }
          }

          //Bounding box updates
          bb_zombies[i].setFromObject(zombies[i][zombieClassBig[i].left_leg_bottom_Id]);
          bb_zombies[i].union(new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].right_leg_bottom_Id]));

          if (zombies[i][zombieClassBig[i].left_arm_Id].rotation.x > 1.8){
            tiltG = true;
          } else if ( zombies[i][zombieClassBig[i].left_arm_Id].rotation.x < 1.1){
            tiltG = false;
          }

          if (tiltG) {
            zombies[i][zombieClassBig[i].left_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y -= 0.02;
            zombies[i][zombieClassBig[i].right_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y += 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].rotation.x -= 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.z += 0.03;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.y += 0.01;
            zombies[i][zombieClassBig[i].right_leg_top_Id].rotation.x += 0.02;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.z -= 0.03;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.y -= 0.01;
            if (zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x < 0) {
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x += 0.025;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.z -= 0.04;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.y -= 0.02;
            }
            if (zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x > -0.5) {
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x -= 0.025;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.z += 0.04;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.y += 0.02;
            }
          } else {
            zombies[i][zombieClassBig[i].left_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y += 0.02;
            zombies[i][zombieClassBig[i].right_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y -= 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].rotation.x += 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.z -= 0.03;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.y -= 0.01;
            zombies[i][zombieClassBig[i].right_leg_top_Id].rotation.x -= 0.02;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.z += 0.03;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.y += 0.01;
            if (zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x > -0.5) {
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x -= 0.025;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.z += 0.04;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.y += 0.02;
            }
            if (zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x < 0) {
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x += 0.025;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.z -= 0.04;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.y -= 0.02;
            }
          }

          // if (bb_zombies[i].intersectsBox(bb_player)) {
          //   eaten = true;
          // }
        } else {
          zombies[i][zombieClassBig[i].body_Id].rotation.y += 0.1;

          if (Math.round(zombies[i][zombieClassBig[i].body_Id].rotation.y) >= 4) {
            scene.remove(zombies[i][zombieClassBig[i].body_Id]);
            //scene.remove(bb_zombies[i]);
          }
        }
      }
      // ZOMBIE HULK ANIMATION
      for ( var i = NZOMBIE+NZOMBIE_G; i < NZOMBIE+NZOMBIE_G+NZOMBIE_H; i++) {
        if (zombieLife[i] > 0) {
          if (zombies[i][zombieClassBig[i].body_Id].position.z != undefined) {
            var v = new THREE.Vector3();
            v.subVectors(zombies[i][zombieClassBig[i].body_Id].position, camera.position).add(zombies[i][zombieClassBig[i].body_Id].position);
            zombies[i][zombieClassBig[i].body_Id].lookAt(v);

            if (zombies[i][zombieClassBig[i].body_Id].position.x < camera.position.x - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x += zombie_speed*1.5;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.x > camera.position.x + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.x -= zombie_speed*1.5;
            }
            if (zombies[i][zombieClassBig[i].body_Id].position.z < camera.position.z - 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z += zombie_speed*1.5;
            } else if (zombies[i][zombieClassBig[i].body_Id].position.z > camera.position.z + 0.05) {
              zombies[i][zombieClassBig[i].body_Id].position.z -= zombie_speed*1.5;
            }
          }

          //Bounding box updates
          bb_zombies[i].setFromObject(zombies[i][zombieClassBig[i].body_Id]);

          if (zombies[i][zombieClassBig[i].left_arm_Id].rotation.x > 1.8){
            tiltH = true;
          } else if ( zombies[i][zombieClassBig[i].left_arm_Id].rotation.x < 1.1){
            tiltH = false;
          }

          if (tiltH) {
            zombies[i][zombieClassBig[i].left_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y -= 0.004;
            zombies[i][zombieClassBig[i].right_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y += 0.004;
            zombies[i][zombieClassBig[i].left_leg_top_Id].rotation.x -= 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.z += 0.006;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.y += 0.002;
            zombies[i][zombieClassBig[i].right_leg_top_Id].rotation.x += 0.02;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.z -= 0.006;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.y -= 0.002;
            if (zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x < 0) {
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x += 0.025;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.z -= 0.008;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.y -= 0.004;
            }
            if (zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x > -0.5) {
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x -= 0.025;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.z += 0.008;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.y += 0.004;
            }
          } else {
            zombies[i][zombieClassBig[i].left_arm_Id].rotation.x += 0.01;
            zombies[i][zombieClassBig[i].left_arm_Id].position.y += 0.004;
            zombies[i][zombieClassBig[i].right_arm_Id].rotation.x -= 0.01;
            zombies[i][zombieClassBig[i].right_arm_Id].position.y -= 0.004;
            zombies[i][zombieClassBig[i].left_leg_top_Id].rotation.x += 0.02;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.z -= 0.006;
            zombies[i][zombieClassBig[i].left_leg_top_Id].position.y -= 0.002;
            zombies[i][zombieClassBig[i].right_leg_top_Id].rotation.x -= 0.02;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.z += 0.006;
            zombies[i][zombieClassBig[i].right_leg_top_Id].position.y += 0.002;
            if (zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x > -0.5) {
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].rotation.x -= 0.025;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.z += 0.008;
              zombies[i][zombieClassBig[i].left_leg_bottom_Id].position.y += 0.004;
            }
            if (zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x < 0) {
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].rotation.x += 0.025;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.z -= 0.008;
              zombies[i][zombieClassBig[i].right_leg_bottom_Id].position.y -= 0.004;
            }
          }

          if (bb_zombies[i].intersectsBox(bb_player)) {
            // eaten = true;
          }
        } else {
          zombies[i][zombieClassBig[i].body_Id].rotation.y += 0.1;

          if (Math.round(zombies[i][zombieClassBig[i].body_Id].rotation.y) >= 4) {
            scene.remove(zombies[i][zombieClassBig[i].body_Id]);
            //scene.remove(bb_zombies[i]);
          }
        }
      }
    }

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta(),
        speed = delta * BULLETMOVESPEED;
    var aispeed = delta * MOVESPEED * 0.1;

    // Play the loading screen until resources are loaded.
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    requestAnimationFrame(animate);

    castRays();

    // SHOOT BULLET
    for (var index = 0; index < bullets.length; index += 1) {
        if (bullets[index] === undefined) continue;
        if (bullets[index].alive == false) {
            bullets.splice(index, 1);
            continue;
        }

        //Bullet position updates
        bullets[index].position.add(bullets[index].velocity);

        //Bullet boundig box
        bb_bullet = new THREE.Box3().setFromObject(bullets[index]);
        //scene.add(bb_bullet);

        //Collision between bullets and zombies
      	for ( var i = 0; i < NZOMBIE+NZOMBIE_G+NZOMBIE_H; i++){
          if (zombieLife[i] > 0) {
        		if ( bb_bullet.intersectsBox(bb_zombies[i]) ){
        			//console.log("COLLISION DETECTED");
        			bullets[index].alive = false;
        			scene.remove(bullets[index]);
        			//scene.remove(bb_bullet);
              // zombie death rotation
              zombieLife[i] -= 1;
              if (zombieLife[i] == 0) {
                killed += 1;
                if (i >= NZOMBIE+NZOMBIE_G) {
                  score += zombie_hulk_life;
                } else if (i >= NZOMBIE) {
                  score += zombie_giant_life;
                } else {
                  score += zombie_life;
                }
              }
            }
      		}
        }
    }
    //________________________________WEAPON ZOOM___________________________
    var handGunRightPos = Math.PI / 6;
    var bulletRightPos = 0.5;
    if (meshes["playerweapon"] != undefined) {
        if (controls.zoom) {
            handGunRightPos = 0;
            meshes["playerweapon"].scale.set(11.5, 11.5, 11.5);
            bulletRightPos = 0;
        } else {
            handGunRightPos = Math.PI / 6;
            meshes["playerweapon"].scale.set(10, 10, 10);
            bulletRightPos = 0.5;
        }
    }
    //__________________________________________BULLET CREATION_____________________________________________
    if (controls.shoot && canShoot <= 0 && !overlayIsOn) {
        
        var bullet = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({color: 0xAF9B60}));
        
 		    bullet.position.set(meshes["playerweapon"].position.x /*- bulletRightPos*/, meshes["playerweapon"].position.y + 0.15, meshes["playerweapon"].position.z);
        bullet.velocity = new THREE.Vector3(-Math.sin(camerarotation_y), 0, Math.cos(camerarotation_y)).normalize();
        bullet.alive = true;
		
		    setTimeout(function() {       
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000);
        // add to scene, array, and set the delay to 10 frames
        
        bullets.push(bullet);
        scene.add(bullet);
        canShoot = 10;
    }
    
    if (canShoot > 0) canShoot -= 1;

    if (!overlayIsOn)
        controls.update(clock.getDelta()); // only if control is FirstPersonControls

    // Set gun in front of camera
    if (meshes["playerweapon"] != undefined) {
      meshes["playerweapon"].position.set(
          camera.position.x - Math.sin(camerarotation_y + handGunRightPos) * 0.75,
          camera.position.y - 0.3 + Math.sin(time * 4 + camera.position.x + camera.position.z) * 0.01,
          camera.position.z + Math.cos(camerarotation_y + handGunRightPos) * 0.75);
      meshes["playerweapon"].rotation.set(camera.rotation.x, camera.rotation.y - Math.PI, camera.rotation.z);
    }
    
    renderer.render(scene, camera);
}

function spawnZombie(){
  var zombieClassSpawn = new Zombie();
  zombie = zombieClassSpawn.zombie;
  for ( var i = 0; i < zombieClassSpawn.numNodes; i++)
    scene.add(zombie[i]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.head_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_leg_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_leg_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_arm_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_arm_Id]);

  zombie[zombieClassSpawn.left_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));
  zombie[zombieClassSpawn.right_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));

  var min = -20;
  var max = 20;
  var random_x = Math.random() * (+max - +min) + +min;
  var random_z = Math.random() * (+max - +min) + +min;
  var d = 1;

  if (random_x < d && random_x > -d) {
    if (Math.random() == 0) {
      random_x = d;
    } else {
      random_x = -d;
    }
  }
  if (random_z < d && random_z > -d) {
    if (Math.random() == 0) {
      random_z = d;
    } else {
      random_z = -d;
    }
  }

  zombie[zombieClassSpawn.body_Id].position.x = random_x;
  zombie[zombieClassSpawn.body_Id].position.z = random_z;
  zombieClassBig.push(zombieClassSpawn);
  zombies.push(zombie);
  zombieLife.push(zombie_life);
}


function spawnZombieGiant(){
  var zombieClassSpawn = new ZombieGiant();
  zombie = zombieClassSpawn.zombie;
  for ( var i = 0; i < zombieClassSpawn.numNodes; i++)
    scene.add(zombie[i]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.head_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_leg_top_Id]);
  zombie[zombieClassSpawn.left_leg_top_Id].attach(zombie[zombieClassSpawn.left_leg_bottom_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_leg_top_Id]);
  zombie[zombieClassSpawn.right_leg_top_Id].attach(zombie[zombieClassSpawn.right_leg_bottom_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_arm_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_arm_Id]);

  zombie[zombieClassSpawn.left_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));
  zombie[zombieClassSpawn.right_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));

  var min = -20;
  var max = 20;
  var random_x = Math.random() * (+max - +min) + +min;
  var random_z = Math.random() * (+max - +min) + +min;
  var d = 5;

  if (random_x < d && random_x > -d) {
    if (Math.random() == 0) {
      random_x = d;
    } else {
      random_x = -d;
    }
  }
  if (random_z < d && random_z > -d) {
    if (Math.random() == 0) {
      random_z = d;
    } else {
      random_z = -d;
    }
  }

  zombie[zombieClassSpawn.body_Id].position.x = random_x;
  zombie[zombieClassSpawn.body_Id].position.z = random_z;
  zombieClassBig.push(zombieClassSpawn);
  zombies.push(zombie);
  zombieLife.push(zombie_giant_life);
}

function spawnZombieHulk(){
  var zombieClassSpawn = new ZombieHulk();
  zombie = zombieClassSpawn.zombie;
  for ( var i = 0; i < zombieClassSpawn.numNodes; i++)
    scene.add(zombie[i]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.big_body_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.head_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_leg_top_Id]);
  zombie[zombieClassSpawn.left_leg_top_Id].attach(zombie[zombieClassSpawn.left_leg_bottom_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_leg_top_Id]);
  zombie[zombieClassSpawn.right_leg_top_Id].attach(zombie[zombieClassSpawn.right_leg_bottom_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.left_arm_Id]);
  zombie[zombieClassSpawn.body_Id].attach(zombie[zombieClassSpawn.right_arm_Id]);

  zombie[zombieClassSpawn.left_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));
  zombie[zombieClassSpawn.right_arm_Id].setRotationFromEuler(new THREE.Euler(-55,0,0, 'XYZ'));

  var min = -20;
  var max = 20;
  var random_x = Math.random() * (+max - +min) + +min;
  var random_z = Math.random() * (+max - +min) + +min;
  var d = 5;

  if (random_x < d && random_x > -d) {
    if (Math.random() == 0) {
      random_x = d;
    } else {
      random_x = -d;
    }
  }
  if (random_z < d && random_z > -d) {
    if (Math.random() == 0) {
      random_z = d;
    } else {
      random_z = -d;
    }
  }

  zombie[zombieClassSpawn.body_Id].position.x = random_x;
  zombie[zombieClassSpawn.body_Id].position.z = random_z;
  zombieClassBig.push(zombieClassSpawn);
  zombies.push(zombie);
  zombieLife.push(zombie_hulk_life);
}
 

function castRays(){
    //____________________NB: CAMERA ROTATES COUNTER CLOCKWISE__________________
    //_______NB: THE ORIGIN OF THE DIRECTION IS THE CAMERA CENTER. Z-AXIS ALWAYS POINTS UP, X-AXIS ALWAYS POINTS RIGHT________
    
    for ( var i = 0; i < 2; i++)
        raycaster = new THREE.Raycaster(camera.position, camera.position);
        var intersects = raycaster.intersectObjects(scene.children, true);
        
}


function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyDown(event) {keyboard[event.keyCode] = true;}
function keyUp(event) {keyboard[event.keyCode] = false;}
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
