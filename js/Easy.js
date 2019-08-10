import {Zombie} from './Zombie.js';

var nBlockX	= 10;
var nBlockZ	= 10;
var blockSizeX	= 50;
var blockSizeZ	= 50;
var roadW	= 8;
var roadD	= 8;
var sidewalkH	= 0.1;

var scene, camera, renderer, mesh, clock, controls;
var raycaster = [];

var bullets = [];
var canShoot = 0;
var keyboard = {};
var pun = 0;
var tempo = 10;
var MOVESPEED = 30;
var LOOKSPEED = 1;
var BULLETMOVESPEED = MOVESPEED * 5;
var DURATIONTIME = 150000; //in millisec
var NZOMBIE = 10;
var zombie;
var zombies = [];
var zombie_speed = 0.03;
var width = window.innerWidth;
var height = window.innerHeight;
var bb_side_walks = [],bb_zombies = [], bb_map = [];
var bb_player,box_player;
var previous_position;
var bb_bullet;

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
    /*
        city: {
          //obj:"models/city1/Street environment_V01.obj",
          //mtl:"models/city1/Street environment_V01.mtl",
          obj:"models/city5/sehir.obj",
          mtl:"models/city5/sehir.mtl",
          mesh: null,
          castShadow: false
        }*/
};
var zombieClass;
var zombieClassBig = [];

window.onload = init();


function init() {


    //____________________________SCENE & CAMERA_______________________________________
    scene = new THREE.Scene();
    //scene.setGravity( new THREE.Vector3(0, -30, 0));
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.3, 1000);
    
    var texture_scene = new THREE.TextureLoader().load('resources/cielo_rosso.jpg', function(texture) {scene.background = texture;});
    scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);
    
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

    var i = 0;
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
	var buildingMesh = new THREE.Mesh(geometry);
    for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				// set position
				buildingMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX
				buildingMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ

				buildingMesh.scale.x	= blockSizeX-roadW
				buildingMesh.scale.y	= sidewalkH*3;
				buildingMesh.scale.z	= blockSizeZ-roadD

				//bb_array[i] = new THREE.BoxHelper(buildingMesh,0xffff00);
				bb_side_walks[i] = new THREE.Box3().setFromObject(buildingMesh);

				scene.add(bb_side_walks[i]);
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

    for ( var i = 0; i < NZOMBIE; i++){
     	spawnZombie();
     	bb_zombies[i] = new THREE.Box3().setFromObject(zombies[i][zombieClassBig[i].head_Id]);
     	scene.add(bb_zombies[i]);
    }

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));
    scene.add(camera);

    box_player = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), new THREE.MeshBasicMaterial({transparent: true})   );
    box_player.position.set(0,0,-5);
    bb_player = new THREE.Box3().setFromObject(box_player);

    //Player previous position
    previous_position = new THREE.Vector3(camera.position);

    scene.add(box_player);
    scene.add(bb_player);

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
  		scene.add(bb_map[i])
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
        if (distance > 0) {
            controls.lock();
        }
        overlay_off();
    }, false);
    document.addEventListener('pointerlockchange', function() {
        //controls.unlock();
        if (document.pointerLockElement == null && distance > 0) {
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

        var sec = Math.floor(distance / 1000);
        document.getElementById("time").innerHTML = "<span style='font-family: Impact; font-size: 15px; color:#00FF00'>  Remaining time: " + sec + " sec" + "&nbsp&nbsp&nbsp Score: " + pun + "</span>";

        // If the count down is finished, write some text
        if (distance < 0) {
            overlay_off();
            document.exitPointerLock();
            document.removeEventListener('click', function() {
                controls.lock();
            }, false);
            clearInterval(x);
            document.getElementById("time").innerHTML = "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <h1>TIME OUT!</h1></span>";
            document.getElementById("ris").innerHTML = "<span style='font-family: Impact; font-size: 60px; color:#00FF00'><h1> Score:  " + pun + "</span>" + "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>" + "<a href='index.html'> Restart</a>" + "</h1></span>";
            $(renderer.domElement).fadeOut();
        }
    }, 1000);

    //scene.simulate();
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

var tilt = false;
function animate() {


    window.addEventListener('resize', onWindowResize, false);


    //__________________________END GAME_____________________
    if ( NZOMBIE == 0){

    } 

    // ------------
    // Management of camera rotation
    var camerarotation_y;
    if (camera.rotation.z == 0)
        camerarotation_y = Math.PI - camera.rotation.y;
    else
        camerarotation_y = camera.rotation.y;

    //_________________________________________PLAYER COLLISION_________________________________

    box_player.position.set(camera.position.x,0,camera.position.z);
    bb_player.setFromObject(box_player);
	
	//Buildings collision
	for ( var i = 0; i < bb_side_walks.length; i++){
    	
    	if ( bb_player.intersectsBox( bb_side_walks[i]) )
    		camera.position.set(previous_position.x,previous_position.y,previous_position.z);
    }


    //Bound walls collision
	for ( var i = 0; i < bb_map.length; i++){
    	
    	if ( bb_player.intersectsBox( bb_map[i]) )
    		camera.position.set(previous_position.x,previous_position.y,previous_position.z);
    }    
    
    //______________________________ESSENTIAL FOR PLAYER COLLISION________________________________
    //It is first initialized as the camera position in the init() function. Hence, it is updated
    //only iff there is NO COLLISION.
    previous_position = new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z);

    
    for ( var i = 0; i < NZOMBIE; i++) {
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

      if ( zombies[i][zombieClassBig[i].left_arm_Id].rotation.x > 1.8){
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
        zombies[i][zombieClassBig[i].right_leg_Id].rotation.x += 0.01;
        zombies[i][zombieClassBig[i].right_leg_Id].position.z -= 0.003;
      } else {
    		zombies[i][zombieClassBig[i].left_arm_Id].rotation.x += 0.01;
        zombies[i][zombieClassBig[i].left_arm_Id].position.y += 0.002;
    		zombies[i][zombieClassBig[i].right_arm_Id].rotation.x -= 0.01;
        zombies[i][zombieClassBig[i].right_arm_Id].position.y -= 0.002;
        zombies[i][zombieClassBig[i].left_leg_Id].rotation.x += 0.01;
        zombies[i][zombieClassBig[i].left_leg_Id].position.z -= 0.003;
        zombies[i][zombieClassBig[i].right_leg_Id].rotation.x -= 0.01;
        zombies[i][zombieClassBig[i].right_leg_Id].position.z += 0.003;
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
        scene.add(bb_bullet);

        //Collision between bullets and zombies
      	for ( var i = 0; i < bb_zombies.length; i++){
        		if ( bb_bullet.intersectsBox(bb_zombies[i]) ){
        			//console.log("COLLISION DETECTED");
        			bullets[index].alive = false;
        			scene.remove(bullets[index]);
        			scene.remove(bb_bullet);
        			scene.remove(zombies[i][zombieClassBig[i].body_Id]);
        			scene.remove(bb_zombies[i]);
        			NZOMBIE--;
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
        //console.log("DOVREI SPARARE");
        // creates a bullet as a Mesh object
        var bullet = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({color: 0xAF9B60}));
        // must change to weapon position later
        bullet.position.set(meshes["playerweapon"].position.x /*- bulletRightPos*/, meshes["playerweapon"].position.y + 0.15, meshes["playerweapon"].position.z);
        // set the velocity of the bullet
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

  var min = -100;
  var max = 100;
  var random_x = Math.random() * (+max - +min) + +min;
  var random_z = Math.random() * (+max - +min) + +min;

  zombie[zombieClassSpawn.body_Id].position.x = random_x;
  zombie[zombieClassSpawn.body_Id].position.z = random_z;
  zombieClassBig.push(zombieClassSpawn);
  zombies.push(zombie);

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
