/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, scene, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	//this.domElement = ( domElement !== undefined ) ? domElement : document;
	//this.domElement = (document) ? document.body : domElement;
	this.domElement = domElement || document.body;

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	this.shoot = false;
	this.zoom = false;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', - 1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				// case 0: this.moveForward = true; break;
				// case 2: this.moveBackward = true; break;
				case 0: /*left*/ this.shoot = true; break;
				case 2: /*right*/ this.zoom = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				// case 0: this.moveForward = false; break;
				// case 2: this.moveBackward = false; break;
				case 0: /*left*/ this.shoot = false; break;
				case 2: /*right*/ this.zoom = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	var PI_2 = Math.PI / 2;
	this.onMouseMove = function ( event ) {

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		//var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		//euler.setFromQuaternion( camera.quaternion );
		euler.setFromQuaternion( object.quaternion );

		euler.y -= movementX * 0.002;
		//euler.x -= movementY * 0.002;

		//euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		object.quaternion.setFromEuler( euler );

		/*
		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}*/

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 32: /*space*/ this.shoot = true; break;

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

		}

		if ( event.shiftKey ) {
			this.movementSpeed = 70;//300.0;
		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 32: /*space*/ this.shoot = false; break;

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

		if ( !event.shiftKey ) {
			this.movementSpeed = 30.0;
		}

	};

	this.update = function ( delta ) {

		if ( this.enabled === false ) return;

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;
		
		/*
		//Update position and also avoid collisions!
		if ( this.moveForward && this.moveRight){
			
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x + actualMoveSpeed, 1.8, this.object.position.z - actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3)){
				this.object.translateZ( - actualMoveSpeed);
				this.object.translateX(   actualMoveSpeed);
			}

		} else if (this.moveForward && this.moveLeft){
			
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x - actualMoveSpeed, 1.8, this.object.position.z - actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) ){
				
				this.object.translateZ( - actualMoveSpeed);
				this.object.translateX( - actualMoveSpeed);
			}

		} else if (this.moveBackward && this.moveRight){
			
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x + actualMoveSpeed, 1.8, this.object.position.z + actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) ){
			
				this.object.translateZ( actualMoveSpeed);
				this.object.translateX( actualMoveSpeed);
			}

		} else if (this.moveBackward && this.moveLeft){
			
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x - actualMoveSpeed, 1.8, this.object.position.z + actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) ){
				
				this.object.translateZ(   actualMoveSpeed);
				this.object.translateX( - actualMoveSpeed);
			}

		} else if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ){
			
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, 1.8, this.object.position.z - actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) )
				
				this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			
		
		} else if ( this.moveBackward ) {
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, 1.8, this.object.position.z + actualMoveSpeed) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) )
				this.object.translateZ( actualMoveSpeed );
		
		} else if ( this.moveLeft ){
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x - actualMoveSpeed, 1.8, 0) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) )
				this.object.translateX( - actualMoveSpeed );
		}
		
		else if ( this.moveRight ){
			var raycast = new THREE.Raycaster(this.object.position, new THREE.Vector3(this.object.position.x + actualMoveSpeed, 1.8, 0) );
			var intersects = raycast.intersectObjects(scene.children, true);
			if ( !(intersects.length > 0 && intersects[0].distance <= 3) )
				this.object.translateX( actualMoveSpeed );
		}

		else if ( this.moveDown ){
		 	this.object.translateY( - actualMoveSpeed );
		}
		*/
		if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) )
			this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			
		if ( this.moveBackward ) 
			this.object.translateZ( actualMoveSpeed );
		
		if ( this.moveLeft )
			this.object.translateX( - actualMoveSpeed );
	
		if ( this.moveRight )
			this.object.translateX( actualMoveSpeed );

		if ( this.moveDown )
		 	this.object.translateY( - actualMoveSpeed );
		
		


		var actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}
/*
		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		*/
		/*if (this.mouseX > 0) {
			this.mouseX -= Math.abs(this.mouseX)*0.03;
		} else if (this.mouseX < 0) {
			this.mouseX += Math.abs(this.mouseX)*0.03;
		}*/
		/*
		if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );
		*/

	};

	function contextmenu( event ) {
		event.preventDefault();
	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};

	var _onMouseMove = bind( this, this.onMouseMove );
	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );
	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}

	this.handleResize();

	this.domElement = domElement || document.body;

	this.lock = function () {
		this.domElement.requestPointerLock();
	};

	this.unlock = function () {
		document.exitPointerLock();
	};

	var lockEvent = { type: 'lock' };
	this.dispatchEvent(lockEvent);
};

THREE.FirstPersonControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.FirstPersonControls.prototype.constructor = THREE.FirstPersonControls;