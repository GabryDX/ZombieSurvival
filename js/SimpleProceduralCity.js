// You can find the full source code here: https://github.com/photonlines/Procedural-City-Generator

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

THREE.OrbitControls = function(object, domElement) {
	this.object = object;
  
	this.domElement = domElement !== undefined ? domElement : document;
  
	// Set to false to disable this control
	this.enabled = true;
  
	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();
  
	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;
  
	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;
  
	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians
  
	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = -Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians
  
	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;
  
	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;
  
	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;
  
	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false; // if true, pan in screen-space
	this.keyPanSpeed = 7.0; // pixels moved per arrow key push
  
	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
  
	// Set to false to disable use of the keys
	this.enableKeys = true;
  
	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
  
	// Mouse buttons
	this.mouseButtons = {
	  LEFT: THREE.MOUSE.LEFT,
	  MIDDLE: THREE.MOUSE.MIDDLE,
	  RIGHT: THREE.MOUSE.RIGHT
	};
  
	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;
  
	//
	// public methods
	//
  
	this.getPolarAngle = function() {
	  return spherical.phi;
	};
  
	this.getAzimuthalAngle = function() {
	  return spherical.theta;
	};
  
	this.saveState = function() {
	  scope.target0.copy(scope.target);
	  scope.position0.copy(scope.object.position);
	  scope.zoom0 = scope.object.zoom;
	};
  
	this.reset = function() {
	  scope.target.copy(scope.target0);
	  scope.object.position.copy(scope.position0);
	  scope.object.zoom = scope.zoom0;
  
	  scope.object.updateProjectionMatrix();
	  scope.dispatchEvent(changeEvent);
  
	  scope.update();
  
	  state = STATE.NONE;
	};
  
	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = (function() {
	  var offset = new THREE.Vector3();
  
	  // so camera.up is the orbit axis
	  var quat = new THREE.Quaternion().setFromUnitVectors(
		object.up,
		new THREE.Vector3(0, 1, 0)
	  );
	  var quatInverse = quat.clone().inverse();
  
	  var lastPosition = new THREE.Vector3();
	  var lastQuaternion = new THREE.Quaternion();
  
	  return function update() {
		var position = scope.object.position;
  
		offset.copy(position).sub(scope.target);
  
		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion(quat);
  
		// angle from z-axis around y-axis
		spherical.setFromVector3(offset);
  
		if (scope.autoRotate && state === STATE.NONE) {
		  rotateLeft(getAutoRotationAngle());
		}
  
		spherical.theta += sphericalDelta.theta;
		spherical.phi += sphericalDelta.phi;
  
		// restrict theta to be between desired limits
		spherical.theta = Math.max(
		  scope.minAzimuthAngle,
		  Math.min(scope.maxAzimuthAngle, spherical.theta)
		);
  
		// restrict phi to be between desired limits
		spherical.phi = Math.max(
		  scope.minPolarAngle,
		  Math.min(scope.maxPolarAngle, spherical.phi)
		);
  
		spherical.makeSafe();
  
		spherical.radius *= scale;
  
		// restrict radius to be between desired limits
		spherical.radius = Math.max(
		  scope.minDistance,
		  Math.min(scope.maxDistance, spherical.radius)
		);
  
		// move target to panned location
		scope.target.add(panOffset);
  
		offset.setFromSpherical(spherical);
  
		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion(quatInverse);
  
		position.copy(scope.target).add(offset);
  
		scope.object.lookAt(scope.target);
  
		if (scope.enableDamping === true) {
		  sphericalDelta.theta *= 1 - scope.dampingFactor;
		  sphericalDelta.phi *= 1 - scope.dampingFactor;
  
		  panOffset.multiplyScalar(1 - scope.dampingFactor);
		} else {
		  sphericalDelta.set(0, 0, 0);
  
		  panOffset.set(0, 0, 0);
		}
  
		scale = 1;
  
		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8
  
		if (
		  zoomChanged ||
		  lastPosition.distanceToSquared(scope.object.position) > EPS ||
		  8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
		) {
		  scope.dispatchEvent(changeEvent);
  
		  lastPosition.copy(scope.object.position);
		  lastQuaternion.copy(scope.object.quaternion);
		  zoomChanged = false;
  
		  return true;
		}
  
		return false;
	  };
	})();
  
	this.dispose = function() {
	  scope.domElement.removeEventListener("contextmenu", onContextMenu, false);
	  scope.domElement.removeEventListener("mousedown", onMouseDown, false);
	  scope.domElement.removeEventListener("wheel", onMouseWheel, false);
  
	  scope.domElement.removeEventListener("touchstart", onTouchStart, false);
	  scope.domElement.removeEventListener("touchend", onTouchEnd, false);
	  scope.domElement.removeEventListener("touchmove", onTouchMove, false);
  
	  document.removeEventListener("mousemove", onMouseMove, false);
	  document.removeEventListener("mouseup", onMouseUp, false);
  
	  window.removeEventListener("keydown", onKeyDown, false);
  
	  //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
	};
  
	//
	// internals
	//
  
	var scope = this;
  
	var changeEvent = { type: "change" };
	var startEvent = { type: "start" };
	var endEvent = { type: "end" };
  
	var STATE = {
	  NONE: -1,
	  ROTATE: 0,
	  DOLLY: 1,
	  PAN: 2,
	  TOUCH_ROTATE: 3,
	  TOUCH_DOLLY_PAN: 4
	};
  
	var state = STATE.NONE;
  
	var EPS = 0.000001;
  
	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();
  
	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;
  
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
  
	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
  
	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();
  
	function getAutoRotationAngle() {
	  return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}
  
	function getZoomScale() {
	  return Math.pow(0.95, scope.zoomSpeed);
	}
  
	function rotateLeft(angle) {
	  sphericalDelta.theta -= angle;
	}
  
	function rotateUp(angle) {
	  sphericalDelta.phi -= angle;
	}
  
	var panLeft = (function() {
	  var v = new THREE.Vector3();
  
	  return function panLeft(distance, objectMatrix) {
		v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
		v.multiplyScalar(-distance);
  
		panOffset.add(v);
	  };
	})();
  
	var panUp = (function() {
	  var v = new THREE.Vector3();
  
	  return function panUp(distance, objectMatrix) {
		if (scope.screenSpacePanning === true) {
		  v.setFromMatrixColumn(objectMatrix, 1);
		} else {
		  v.setFromMatrixColumn(objectMatrix, 0);
		  v.crossVectors(scope.object.up, v);
		}
  
		v.multiplyScalar(distance);
  
		panOffset.add(v);
	  };
	})();
  
	// deltaX and deltaY are in pixels; right and down are positive
	var pan = (function() {
	  var offset = new THREE.Vector3();
  
	  return function pan(deltaX, deltaY) {
		var element =
		  scope.domElement === document
			? scope.domElement.body
			: scope.domElement;
  
		if (scope.object.isPerspectiveCamera) {
		  // perspective
		  var position = scope.object.position;
		  offset.copy(position).sub(scope.target);
		  var targetDistance = offset.length();
  
		  // half of the fov is center to top of screen
		  targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);
  
		  // we use only clientHeight here so aspect ratio does not distort speed
		  panLeft(
			2 * deltaX * targetDistance / element.clientHeight,
			scope.object.matrix
		  );
		  panUp(
			2 * deltaY * targetDistance / element.clientHeight,
			scope.object.matrix
		  );
		} else if (scope.object.isOrthographicCamera) {
		  // orthographic
		  panLeft(
			deltaX *
			  (scope.object.right - scope.object.left) /
			  scope.object.zoom /
			  element.clientWidth,
			scope.object.matrix
		  );
		  panUp(
			deltaY *
			  (scope.object.top - scope.object.bottom) /
			  scope.object.zoom /
			  element.clientHeight,
			scope.object.matrix
		  );
		} else {
		  // camera neither orthographic nor perspective
		  console.warn(
			"WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
		  );
		  scope.enablePan = false;
		}
	  };
	})();
  
	function dollyIn(dollyScale) {
	  if (scope.object.isPerspectiveCamera) {
		scale /= dollyScale;
	  } else if (scope.object.isOrthographicCamera) {
		scope.object.zoom = Math.max(
		  scope.minZoom,
		  Math.min(scope.maxZoom, scope.object.zoom * dollyScale)
		);
		scope.object.updateProjectionMatrix();
		zoomChanged = true;
	  } else {
		console.warn(
		  "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
		);
		scope.enableZoom = false;
	  }
	}
  
	function dollyOut(dollyScale) {
	  if (scope.object.isPerspectiveCamera) {
		scale *= dollyScale;
	  } else if (scope.object.isOrthographicCamera) {
		scope.object.zoom = Math.max(
		  scope.minZoom,
		  Math.min(scope.maxZoom, scope.object.zoom / dollyScale)
		);
		scope.object.updateProjectionMatrix();
		zoomChanged = true;
	  } else {
		console.warn(
		  "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
		);
		scope.enableZoom = false;
	  }
	}
  
	//
	// event callbacks - update the object state
	//
  
	function handleMouseDownRotate(event) {
	  //console.log( 'handleMouseDownRotate' );
  
	  rotateStart.set(event.clientX, event.clientY);
	}
  
	function handleMouseDownDolly(event) {
	  //console.log( 'handleMouseDownDolly' );
  
	  dollyStart.set(event.clientX, event.clientY);
	}
  
	function handleMouseDownPan(event) {
	  //console.log( 'handleMouseDownPan' );
  
	  panStart.set(event.clientX, event.clientY);
	}
  
	function handleMouseMoveRotate(event) {
	  //console.log( 'handleMouseMoveRotate' );
  
	  rotateEnd.set(event.clientX, event.clientY);
  
	  rotateDelta
		.subVectors(rotateEnd, rotateStart)
		.multiplyScalar(scope.rotateSpeed);
  
	  var element =
		scope.domElement === document ? scope.domElement.body : scope.domElement;
  
	  rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
  
	  rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
  
	  rotateStart.copy(rotateEnd);
  
	  scope.update();
	}
  
	function handleMouseMoveDolly(event) {
	  //console.log( 'handleMouseMoveDolly' );
  
	  dollyEnd.set(event.clientX, event.clientY);
  
	  dollyDelta.subVectors(dollyEnd, dollyStart);
  
	  if (dollyDelta.y > 0) {
		dollyIn(getZoomScale());
	  } else if (dollyDelta.y < 0) {
		dollyOut(getZoomScale());
	  }
  
	  dollyStart.copy(dollyEnd);
  
	  scope.update();
	}
  
	function handleMouseMovePan(event) {
	  //console.log( 'handleMouseMovePan' );
  
	  panEnd.set(event.clientX, event.clientY);
  
	  panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
  
	  pan(panDelta.x, panDelta.y);
  
	  panStart.copy(panEnd);
  
	  scope.update();
	}
  
	function handleMouseUp(event) {
	  // console.log( 'handleMouseUp' );
	}
  
	function handleMouseWheel(event) {
	  // console.log( 'handleMouseWheel' );
  
	  if (event.deltaY < 0) {
		dollyOut(getZoomScale());
	  } else if (event.deltaY > 0) {
		dollyIn(getZoomScale());
	  }
  
	  scope.update();
	}
  
	function handleKeyDown(event) {
	  // console.log( 'handleKeyDown' );
  
	  var needsUpdate = false;
  
	  switch (event.keyCode) {
		case scope.keys.UP:
		  pan(0, scope.keyPanSpeed);
		  needsUpdate = true;
		  break;
  
		case scope.keys.BOTTOM:
		  pan(0, -scope.keyPanSpeed);
		  needsUpdate = true;
		  break;
  
		case scope.keys.LEFT:
		  pan(scope.keyPanSpeed, 0);
		  needsUpdate = true;
		  break;
  
		case scope.keys.RIGHT:
		  pan(-scope.keyPanSpeed, 0);
		  needsUpdate = true;
		  break;
	  }
  
	  if (needsUpdate) {
		// prevent the browser from scrolling on cursor keys
		event.preventDefault();
  
		scope.update();
	  }
	}
  
	function handleTouchStartRotate(event) {
	  //console.log( 'handleTouchStartRotate' );
  
	  rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
	}
  
	function handleTouchStartDollyPan(event) {
	  //console.log( 'handleTouchStartDollyPan' );
  
	  if (scope.enableZoom) {
		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;
  
		var distance = Math.sqrt(dx * dx + dy * dy);
  
		dollyStart.set(0, distance);
	  }
  
	  if (scope.enablePan) {
		var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
		var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
  
		panStart.set(x, y);
	  }
	}
  
	function handleTouchMoveRotate(event) {
	  //console.log( 'handleTouchMoveRotate' );
  
	  rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
  
	  rotateDelta
		.subVectors(rotateEnd, rotateStart)
		.multiplyScalar(scope.rotateSpeed);
  
	  var element =
		scope.domElement === document ? scope.domElement.body : scope.domElement;
  
	  rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
  
	  rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
  
	  rotateStart.copy(rotateEnd);
  
	  scope.update();
	}
  
	function handleTouchMoveDollyPan(event) {
	  //console.log( 'handleTouchMoveDollyPan' );
  
	  if (scope.enableZoom) {
		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;
  
		var distance = Math.sqrt(dx * dx + dy * dy);
  
		dollyEnd.set(0, distance);
  
		dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
  
		dollyIn(dollyDelta.y);
  
		dollyStart.copy(dollyEnd);
	  }
  
	  if (scope.enablePan) {
		var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
		var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
  
		panEnd.set(x, y);
  
		panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
  
		pan(panDelta.x, panDelta.y);
  
		panStart.copy(panEnd);
	  }
  
	  scope.update();
	}
  
	function handleTouchEnd(event) {
	  //console.log( 'handleTouchEnd' );
	}
  
	//
	// event handlers - FSM: listen for events and reset state
	//
  
	function onMouseDown(event) {
	  if (scope.enabled === false) return;
  
	  // Prevent the browser from scrolling.
  
	  event.preventDefault();
  
	  // Manually set the focus since calling preventDefault above
	  // prevents the browser from setting it automatically.
  
	  scope.domElement.focus ? scope.domElement.focus() : window.focus();
  
	  switch (event.button) {
		case scope.mouseButtons.LEFT:
		  if (event.ctrlKey || event.metaKey || event.shiftKey) {
			if (scope.enablePan === false) return;
  
			handleMouseDownPan(event);
  
			state = STATE.PAN;
		  } else {
			if (scope.enableRotate === false) return;
  
			handleMouseDownRotate(event);
  
			state = STATE.ROTATE;
		  }
  
		  break;
  
		case scope.mouseButtons.MIDDLE:
		  if (scope.enableZoom === false) return;
  
		  handleMouseDownDolly(event);
  
		  state = STATE.DOLLY;
  
		  break;
  
		case scope.mouseButtons.RIGHT:
		  if (scope.enablePan === false) return;
  
		  handleMouseDownPan(event);
  
		  state = STATE.PAN;
  
		  break;
	  }
  
	  if (state !== STATE.NONE) {
		document.addEventListener("mousemove", onMouseMove, false);
		document.addEventListener("mouseup", onMouseUp, false);
  
		scope.dispatchEvent(startEvent);
	  }
	}
  
	function onMouseMove(event) {
	  if (scope.enabled === false) return;
  
	  event.preventDefault();
  
	  switch (state) {
		case STATE.ROTATE:
		  if (scope.enableRotate === false) return;
  
		  handleMouseMoveRotate(event);
  
		  break;
  
		case STATE.DOLLY:
		  if (scope.enableZoom === false) return;
  
		  handleMouseMoveDolly(event);
  
		  break;
  
		case STATE.PAN:
		  if (scope.enablePan === false) return;
  
		  handleMouseMovePan(event);
  
		  break;
	  }
	}
  
	function onMouseUp(event) {
	  if (scope.enabled === false) return;
  
	  handleMouseUp(event);
  
	  document.removeEventListener("mousemove", onMouseMove, false);
	  document.removeEventListener("mouseup", onMouseUp, false);
  
	  scope.dispatchEvent(endEvent);
  
	  state = STATE.NONE;
	}
  
	function onMouseWheel(event) {
	  if (
		scope.enabled === false ||
		scope.enableZoom === false ||
		(state !== STATE.NONE && state !== STATE.ROTATE)
	  )
		return;
  
	  event.preventDefault();
	  event.stopPropagation();
  
	  scope.dispatchEvent(startEvent);
  
	  handleMouseWheel(event);
  
	  scope.dispatchEvent(endEvent);
	}
  
	function onKeyDown(event) {
	  if (
		scope.enabled === false ||
		scope.enableKeys === false ||
		scope.enablePan === false
	  )
		return;
  
	  handleKeyDown(event);
	}
  
	function onTouchStart(event) {
	  if (scope.enabled === false) return;
  
	  event.preventDefault();
  
	  switch (event.touches.length) {
		case 1: // one-fingered touch: rotate
		  if (scope.enableRotate === false) return;
  
		  handleTouchStartRotate(event);
  
		  state = STATE.TOUCH_ROTATE;
  
		  break;
  
		case 2: // two-fingered touch: dolly-pan
		  if (scope.enableZoom === false && scope.enablePan === false) return;
  
		  handleTouchStartDollyPan(event);
  
		  state = STATE.TOUCH_DOLLY_PAN;
  
		  break;
  
		default:
		  state = STATE.NONE;
	  }
  
	  if (state !== STATE.NONE) {
		scope.dispatchEvent(startEvent);
	  }
	}
  
	function onTouchMove(event) {
	  if (scope.enabled === false) return;
  
	  event.preventDefault();
	  event.stopPropagation();
  
	  switch (event.touches.length) {
		case 1: // one-fingered touch: rotate
		  if (scope.enableRotate === false) return;
		  if (state !== STATE.TOUCH_ROTATE) return; // is this needed?
  
		  handleTouchMoveRotate(event);
  
		  break;
  
		case 2: // two-fingered touch: dolly-pan
		  if (scope.enableZoom === false && scope.enablePan === false) return;
		  if (state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?
  
		  handleTouchMoveDollyPan(event);
  
		  break;
  
		default:
		  state = STATE.NONE;
	  }
	}
  
	function onTouchEnd(event) {
	  if (scope.enabled === false) return;
  
	  handleTouchEnd(event);
  
	  scope.dispatchEvent(endEvent);
  
	  state = STATE.NONE;
	}
  
	function onContextMenu(event) {
	  if (scope.enabled === false) return;
  
	  event.preventDefault();
	}
  
	//
  
	scope.domElement.addEventListener("contextmenu", onContextMenu, false);
  
	scope.domElement.addEventListener("mousedown", onMouseDown, false);
	scope.domElement.addEventListener("wheel", onMouseWheel, false);
  
	scope.domElement.addEventListener("touchstart", onTouchStart, false);
	scope.domElement.addEventListener("touchend", onTouchEnd, false);
	scope.domElement.addEventListener("touchmove", onTouchMove, false);
  
	window.addEventListener("keydown", onKeyDown, false);
  
	// force an update at start
  
	this.update();
  };
  
  THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
  THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
  
  Object.defineProperties(THREE.OrbitControls.prototype, {
	center: {
	  get: function() {
		console.warn("THREE.OrbitControls: .center has been renamed to .target");
		return this.target;
	  }
	},
  
	// backward compatibility
  
	noZoom: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
		);
		return !this.enableZoom;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
		);
		this.enableZoom = !value;
	  }
	},
  
	noRotate: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
		);
		return !this.enableRotate;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
		);
		this.enableRotate = !value;
	  }
	},
  
	noPan: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
		);
		return !this.enablePan;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
		);
		this.enablePan = !value;
	  }
	},
  
	noKeys: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
		);
		return !this.enableKeys;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
		);
		this.enableKeys = !value;
	  }
	},
  
	staticMoving: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
		);
		return !this.enableDamping;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
		);
		this.enableDamping = !value;
	  }
	},
  
	dynamicDampingFactor: {
	  get: function() {
		console.warn(
		  "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
		);
		return this.dampingFactor;
	  },
  
	  set: function(value) {
		console.warn(
		  "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
		);
		this.dampingFactor = value;
	  }
	}
  });
  
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global) {
  var module = (global.noise = {});

  function Grad(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Grad.prototype.dot2 = function(x, y) {
    return this.x * x + this.y * y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x * x + this.y * y + this.z * z;
  };

  var grad3 = [
    new Grad(1, 1, 0),
    new Grad(-1, 1, 0),
    new Grad(1, -1, 0),
    new Grad(-1, -1, 0),
    new Grad(1, 0, 1),
    new Grad(-1, 0, 1),
    new Grad(1, 0, -1),
    new Grad(-1, 0, -1),
    new Grad(0, 1, 1),
    new Grad(0, -1, 1),
    new Grad(0, 1, -1),
    new Grad(0, -1, -1)
  ];

  var p = [
    151,
    160,
    137,
    91,
    90,
    15,
    131,
    13,
    201,
    95,
    96,
    53,
    194,
    233,
    7,
    225,
    140,
    36,
    103,
    30,
    69,
    142,
    8,
    99,
    37,
    240,
    21,
    10,
    23,
    190,
    6,
    148,
    247,
    120,
    234,
    75,
    0,
    26,
    197,
    62,
    94,
    252,
    219,
    203,
    117,
    35,
    11,
    32,
    57,
    177,
    33,
    88,
    237,
    149,
    56,
    87,
    174,
    20,
    125,
    136,
    171,
    168,
    68,
    175,
    74,
    165,
    71,
    134,
    139,
    48,
    27,
    166,
    77,
    146,
    158,
    231,
    83,
    111,
    229,
    122,
    60,
    211,
    133,
    230,
    220,
    105,
    92,
    41,
    55,
    46,
    245,
    40,
    244,
    102,
    143,
    54,
    65,
    25,
    63,
    161,
    1,
    216,
    80,
    73,
    209,
    76,
    132,
    187,
    208,
    89,
    18,
    169,
    200,
    196,
    135,
    130,
    116,
    188,
    159,
    86,
    164,
    100,
    109,
    198,
    173,
    186,
    3,
    64,
    52,
    217,
    226,
    250,
    124,
    123,
    5,
    202,
    38,
    147,
    118,
    126,
    255,
    82,
    85,
    212,
    207,
    206,
    59,
    227,
    47,
    16,
    58,
    17,
    182,
    189,
    28,
    42,
    223,
    183,
    170,
    213,
    119,
    248,
    152,
    2,
    44,
    154,
    163,
    70,
    221,
    153,
    101,
    155,
    167,
    43,
    172,
    9,
    129,
    22,
    39,
    253,
    19,
    98,
    108,
    110,
    79,
    113,
    224,
    232,
    178,
    185,
    112,
    104,
    218,
    246,
    97,
    228,
    251,
    34,
    242,
    193,
    238,
    210,
    144,
    12,
    191,
    179,
    162,
    241,
    81,
    51,
    145,
    235,
    249,
    14,
    239,
    107,
    49,
    192,
    214,
    31,
    181,
    199,
    106,
    157,
    184,
    84,
    204,
    176,
    115,
    121,
    50,
    45,
    127,
    4,
    150,
    254,
    138,
    236,
    205,
    93,
    222,
    114,
    67,
    29,
    24,
    72,
    243,
    141,
    128,
    195,
    78,
    66,
    215,
    61,
    156,
    180
  ];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed >> 8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;

  var F3 = 1 / 3;
  var G3 = 1 / 6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin) * F2; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin - j + t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1 = 1;
      j1 = 0;
    } else {
      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1 = 0;
      j1 = 1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i + perm[j]];
    var gi1 = gradP[i + i1 + perm[j + j1]];
    var gi2 = gradP[i + 1 + perm[j + 1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin + zin) * F3; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);

    var t = (i + j + k) * G3;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin - j + t;
    var z0 = zin - k + t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);
  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
      Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X;
    y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X + perm[Y]].dot2(x, y);
    var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
    var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
    var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
      Y = Math.floor(y),
      Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(
      x - 1,
      y - 1,
      z - 1
    );

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
      lerp(lerp(n000, n100, u), lerp(n001, n101, u), w),
      lerp(lerp(n010, n110, u), lerp(n011, n111, u), w),
      v
    );
  };
})(this);

// Color hex codes
const colors = {
  WHITE: 0xffffff,
  BLACK: 0x000000,
  DARK_BROWN: 0x736b5c,
  STREET: 0x999999,
  BUILDING: 0xe8e8e8,
  GREEN: 0x81a377,
  TREE: 0x216e41,
  DARK_GREY: 0x888888,
  WATER: 0x4b95de
};

// City attribute variables: the variables below control the properties of our generated city

// The number of blocks to include in our grid in dimensional format (i.e. the value of 10 will
// create a grid with 10 by 10 blocks)
var gridSize = 15;

// City road widths. Roads seperate our city grid blocks.
var roadWidth = 20;

// The maximum 'density' value to use when generating trees for our park blocks
var maximumTreeDensity = 70;

// City block size
var blockSize = 150;

// City block margin
var blockMargin = 10;

// Minimum and maximum building height values
var minBuildingHeight = 50;
var maxBuildingHeight = 250;

// Helper functions used to get our total city size
function getCityWidth() {
  return blockSize * gridSize;
}
function getCityLength() {
  return blockSize * gridSize;
}

// Maximum building height deviation allowed for buildings allocated within the same block
const maxBuildingHeightDeviation = 15;

// This is a percentage cut-off we use to serve as an indicator of whether we have a 'tall'
// building or not. Generally, we use 2 canvas elements - one for tall buildings and the other
// which is reserved for smaller ones.
const tallPercentageCutoff = 40;

// Initialize the smaller building canvas dimensions and generate the canvas for these buildings:

const smallBuildingCanvasWidth = 8;
const smallBuildingCanvasHeight = 16;

var smallBuildingCanvas = generateBuildingCanvas(
  smallBuildingCanvasWidth,
  smallBuildingCanvasHeight
);

// Initialize the larger building canvas dimensions and generate the canvas for these buildings:

const largeBuildingCanvasWidth = 16;
const largeBuildingCanvasHeight = 32;

var largeBuildingCanvas = generateBuildingCanvas(
  largeBuildingCanvasWidth,
  largeBuildingCanvasHeight
);

// Number of sub-divisions to apply to our short building blocks. As an example, a value of 2 will
// result in 2 block divisions and a total of 4 buildings assigned to each non-tall city block.
const blockSubdivisions = 2;

// This is our maximum building 'slice' deviation - i.e. whenever we have more than 1 building allocated
// in one building block, we allow the building width / depth deviation between the buildings to vary
// by this amount:
const maxBuildingSliceDeviation = 20;

// These are our city base heights
const groundHeight = 30;
const curbHeight = 1;

// Tree properties
const minTreeHeight = 4;
const maxTreeHeight = 10;

// Maps used to hold boolean indicators which show whether our grid coordinates represent a
// ground or building block.
var groundMap;
var buildingMap;

// Threshold value used to assign ground blocks. Any normalized values within the [0, 1] range that are
// between [0, groundThreshold] get assigned to a ground block which can can either be a building block
// or a park / parking block
const groundThreshold = 0.85;

// Threshold value used to assign park / parking blocks. Any normalized ground block values falling between the
// [0, parkThreshold] range are assigned to a park or parking block.
const parkThreshold = 0.2;

// Generate and return a hexidecimal string representation of the numeric input
// i.e. 0 will get converted to "#000000"
function getHexadecimalString(number) {
  var hexString = Number(number).toString(16);
  hexString = "#000000".substr(0, 7 - hexString.length) + hexString;
  return hexString;
}

// Generate a building canvas with the given width and height and return it
function generateBuildingCanvas(width, height) {
  // Build a small canvas we're going to use to create our window elements
  var smallCanvas = document.createElement("canvas");

  smallCanvas.width = width;
  smallCanvas.height = height;

  // Get a two-dimensional rendering context for our canvas
  var context = smallCanvas.getContext("2d");

  // Set the fill style to the same color as our building material
  context.fillStyle = getHexadecimalString(colors.BUILDING);

  // Draw a filled rectangle whose starting point is (0, 0) and whose size is specified by
  // the width and height variables.
  context.fillRect(0, 0, width, height);

  // Set the building window dimensions
  const windowWidth = 2;
  const windowHeight = 1;

  // Draw the building windows
  for (var y = 4; y < height - 2; y += 3) {
    for (var x = 0; x < width; x += 3) {
      // Here, we add slight color variations to vary the look of each window
      var colorValue = Math.floor(Math.random() * 64);
      context.fillStyle =
        "rgb(" + [colorValue, colorValue, colorValue].join(",") + ")";

      // Draw the window / rectangle at the given (x, y) position using our defined window dimensions
      context.fillRect(x, y, windowWidth, windowHeight);
    }
  }

  // Create a large canvas and copy the small one onto it. We do this to increase our original canvas
  // resolution:

  var largeCanvas = document.createElement("canvas");

  largeCanvas.width = 256;
  largeCanvas.height = 512;

  context = largeCanvas.getContext("2d");

  // Disable the smoothing in order to avoid blurring our original one
  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;

  // Copy the smaller canvas onto the larger one
  context.drawImage(smallCanvas, 0, 0, largeCanvas.width, largeCanvas.height);

  return largeCanvas;
}

// Return a random integer between min (inclusive) and max (exclusive)
function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random building height deviation value and return it. We use this to vary the
// building dimensions within the same block element.
function generateBuildingHeightDeviation() {
  return getRandomIntBetween(0, maxBuildingHeightDeviation);
}

// Generate the building scene and renderer
function generateScene() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    // Set the canvas alpha transparency to true
    alpha: true,
    // Perform anti-aliasing (smooth jagged edges)
    antialias: true,
    // Assume that the colors do not have a pre-multiplied alpha
    premultipliedAlpha: false
  });

  // Tell the renderer that we want to use shadow maps in our scene
  renderer.shadowMapEnabled = true;

  // Set the shadow map type to one which filters shadow maps using the Percentage-Closer
  // Soft Shadows (PCSS) algorithm.
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add the renderer canvas (where the renderer draws its output) to the page.
  document.body.appendChild(renderer.domElement);

  // Initialize the frustum variables to use for the perspective camera
  var fieldOfView = 60;
  var aspect = window.innerWidth / window.innerHeight;
  var nearPlane = 1;
  var farPlane = 4000;

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspect,
    nearPlane,
    farPlane
  );

  // Set the camera coordinates
  var x_position = 800;
  var y_position = 800;
  var z_position = 800;

  // Set the camera position in the world space.
  camera.position.set(x_position, y_position, z_position);

  // Rotate the camera to face the point / vector ( x, y, z ) in world space.
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Use orbit controls, which allow the camera to orbit around a target.
  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Enable damping (inertia), which can be used to give a sense of weight to the controls.
  controls.enableDamping = true;
  // Set the damping factor / inertia
  controls.dampingFactor = 0.25;
  // Set the upper limit to how high we can orbit vertically to 90 degrees (PI radians / 2)
  controls.maxPolarAngle = Math.PI / 2;

  // We want the resize function to be called on each window resize event
  window.addEventListener("resize", resize, false);
}

function generateLighting() {
  // Variables used to create the hemisphere light
  var skyColor = colors.WHITE;
  var groundColor = colors.WHITE;
  var colorIntensity = 0.4;

  // Create a light source positioned directly above the scene, with color fading from the sky color to the ground color.
  var hemisphereLight = new THREE.HemisphereLight(
    skyColor,
    groundColor,
    colorIntensity
  );

  // Create the directional lights which we use to simulate daylight:

  // Variables used to create the directional light
  var shadowLightColor = colors.WHITE;
  var shadowLightIntensity = 0.25;

  var shadowLight = new THREE.DirectionalLight(
    shadowLightColor,
    shadowLightIntensity
  );

  // Initialize the variables used to create the shadow light
  var x_position = getCityWidth() / 2;
  var y_position = 800;
  var z_position = getCityLength() / 2;

  // Set the shadow camera position ( x, y, z ) in world space.
  shadowLight.position.set(x_position, y_position, z_position);

  // Variables used to create the back light
  var backLightColor = colors.WHITE;
  var backLightIntensity = 0.1;

  var backLight = new THREE.DirectionalLight(
    backLightColor,
    backLightIntensity
  );

  // Set the back light position ( x, y, z ) in world space.
  backLight.position.set(-120, 180, 60);

  scene.add(backLight, shadowLight, hemisphereLight);
}

// Return a normalized version of the input array which maps the array elements to a range between 0 and 1
function normalizeArray(array) {
  var minValue = Math.min.apply(Math, array);
  var maxValue = Math.max.apply(Math, array);

  // Apply the function below to each array element (to generate a normalized value between 0 and 1)
  return array.map(function(value) {
    return (value - minValue) / (maxValue - minValue);
  });
}

// Split a 1-D array into a 2-D array containing the specified number of columns in each sub-array.
function generate2DArray(array, numberOfColumns) {
  var temp = array.slice(0);
  var results = [];

  while (temp.length) {
    results.push(temp.splice(0, numberOfColumns));
  }

  return results;
}

// Helper functions which can be used to transform our 1-D index -> 2-D coordinates
function getXCoordinateFromIndex(index) {
  return parseInt(index / gridSize);
}

function getZCoordinateFromIndex(index) {
  return index % gridSize;
}

// Fetch a value from our 2D perlin noise map and return it
function getNoiseValue(x, y, frequency) {
  return Math.abs(noise.perlin2(x / frequency, y / frequency));
}

// Generate the ground / building maps we're going to use to assign blocks to the city
function generatePreceduralMaps() {
  noise.seed(Math.random());

  // Noise frequency values we're using to generate our block distribution. The higher the value, the smoother the
  // distribution:

  // This is the general noise distribution used for the ground / water block assignments
  var generalNoiseFrequency = 15;

  // This is the ground noise distribution used for the building / park / parking block assignments
  var groundNoiseFrequency = 8;

  // Arrays to use in order to hold our generated noise values
  var generalNoiseDistribution = [];
  var groundNoiseDistribution = [];

  // Generate the ground / general noise arrays holding the perlin noise distribution
  for (i = 0; i < gridSize; i++) {
    for (j = 0; j < gridSize; j++) {
      generalNoiseDistribution.push(getNoiseValue(i, j, generalNoiseFrequency));
      groundNoiseDistribution.push(getNoiseValue(i, j, groundNoiseFrequency));
    }
  }

  // Generate a normalized noise array which holds a range of values between [0, 1]
  var normalizedDistribution = normalizeArray(generalNoiseDistribution);

  // Map our noises to an binary array which serves as an indicator showing whether the array element is a
  // ground block or a water block
  var groundDistributionMap = normalizedDistribution.map(function(arrayValue) {
    return arrayValue <= groundThreshold ? true : false;
  });

  // Transform the 1-D ground mapping into a 2-D array with (x, z) coordinates
  groundMap = generate2DArray(groundDistributionMap, gridSize);

  // Generate a normalized array for our ground distribution
  var normalizedGroundDistribution = normalizeArray(groundNoiseDistribution);

  // Map our noises to an array holding binary values which indicate whether it's a building or a park block
  var buildingDistributionMap = normalizedGroundDistribution.map(function(
    arrayValue,
    index
  ) {
    return groundDistributionMap[index] && arrayValue > parkThreshold
      ? true
      : false;
  });

  // Transform the 1-D building mapping into a 2-D array with (x, z) coordinates
  buildingMap = generate2DArray(buildingDistributionMap, gridSize);
}

// Create a mesh we're going to use to model our water elements
function getWaterMesh(boxGeometryParameters, position) {
  // Check if the position was provided. If not, initialize it to (0, 0, 0)
  if (typeof position === "undefined") position = { x: 0, y: 0, z: 0 };

  // Use a mesh phong meterial, which can be used for shiny surfaces with specular highlights
  material = new THREE.MeshPhongMaterial({
    color: colors.WATER,
    transparent: true,
    opacity: 0.6
  });

  // Create a box geometry ( made for rectangular shapes ) with the appropriate dimensions
  geometry = new THREE.BoxGeometry(
    boxGeometryParameters.width,
    boxGeometryParameters.height,
    boxGeometryParameters.depth
  );

  // Generate and return the mesh

  mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(position.x, position.y, position.z);

  mesh.receiveShadow = false;
  mesh.castShadow = false;

  return mesh;
}

// Create a box mesh with the given geometry, material and color. The cast shadow parameter is a
// boolean flag which controls whether we want our mesh to cast a shadow.
function getBoxMesh(boxGeometryParameters, position, color, castShadow) {
  // Check if the shadow parameter was provided. If not, initialize it to true
  if (typeof castShadow === "undefined") castShadow = true;

  // Use lambert mesh material which is made for non-shiny surfaces / is generally great for performance
  material = new THREE.MeshLambertMaterial({
    color: color
  });

  // Create a box geometry ( made for rectangular shapes ) with the given width, height, and depth parameters
  geometry = new THREE.BoxGeometry(
    boxGeometryParameters.width,
    boxGeometryParameters.height,
    boxGeometryParameters.depth
  );

  // Generate the mesh and return it

  mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(position.x, position.y, position.z);

  mesh.receiveShadow = true;
  mesh.castShadow = castShadow;

  return mesh;
}

// Take a list of meshes, merge their geometries into a single one and return it
function getMergedMesh(meshList, material) {
  // Check if the mesh material was provided, and if not, initialize it contain the same material as the
  // first item in our list of meshes we want to merge
  if (typeof material === "undefined") material = meshList[0].material;

  // Create a geometry object to hold our combined geometries
  var geometry = new THREE.Geometry();

  // Merge all of the meshes into one geometry:
  for (var i = 0; i < meshList.length; i++) {
    meshList[i].updateMatrix();
    geometry.merge(meshList[i].geometry, meshList[i].matrix);
  }

  // Once we have our merged geometry, create a mesh from it
  var mergedMesh = new THREE.Mesh(geometry, material);

  // We want our merged mesh to cast and receive shadows
  mergedMesh.castShadow = true;
  mergedMesh.receiveShadow = true;

  return mergedMesh;
}

// Translate the grid x coordinate into a THREE.js scene x coordinate and return it
function getSceneXCoordinate(x) {
  return x * blockSize + blockSize / 2 - getCityWidth() / 2;
}

// Translate the grid z coordinate into a THREE.js scene z coordinate and return it
function getSceneZCoordinate(z) {
  return z * blockSize + blockSize / 2 - getCityLength() / 2;
}

// Return true if the grid block located at (x, z) is a ground block; and false if
// it's a water block
function isGroundBlock(x, z) {
  return groundMap[x][z];
}

// Return true if the grid block located at (x, z) is a building block; and false if
// it's a block allocated for park / parking blocks.
function isBuildingBlock(x, z) {
  return buildingMap[x][z];
}

// Return the total amount of building blocks surrounding the block located at (x, z)
// on our grid. This is used to heuristically determine whether to build a park or
// parking in our city. We want parking to be located closer to our buildings, so we
// check to see the surrounding building count prior to deciding what to build.
function getSurroundingBuildingNumber(x, z) {
  buildingCount = 0;

  for (i = Math.max(0, x - 1); i <= Math.min(x + 1, gridSize - 1); i++) {
    for (j = Math.max(0, z - 1); j <= Math.min(z + 1, gridSize - 1); j++) {
      if (isBuildingBlock(i, j)) buildingCount = buildingCount + 1;
    }
  }

  return buildingCount;
}

// Generate the scene / city terrain
function generateCityTerrain() {
  var streetHeight = 2 * curbHeight;

  // Initialize the base mesh parameters and create the base mesh

  var baseColor = colors.DARK_BROWN;

  var baseGeometryParams = {
    width: getCityWidth(),
    height: groundHeight,
    depth: getCityLength()
  };

  var basePosition = {
    x: 0,
    y: -(groundHeight / 2) - streetHeight,
    z: 0
  };

  var baseMesh = getBoxMesh(baseGeometryParams, basePosition, baseColor);

  // Initialize the water mesh parameters and create the water mesh

  var waterGeometryParams = {
    width: getCityWidth() - 2,
    height: 0,
    depth: getCityLength() - 2
  };

  var waterPosition = {
    x: 0,
    y: -streetHeight,
    z: 0
  };

  var water = getWaterMesh(waterGeometryParams, waterPosition);

  // Create the ground level / street level meshes and add them to a list

  var groundMeshList = [];
  var streetMeshList = [];

  for (i = 0; i < groundMap.length; i++) {
    for (j = 0; j < groundMap[0].length; j++) {
      if (isGroundBlock(i, j)) {
        var x = getSceneXCoordinate(i);
        var z = getSceneZCoordinate(j);

        groundMeshList.push(
          getBoxMesh(
            // Geometry parameters
            {
              width: blockSize,
              height: 0,
              depth: blockSize
            },
            // Positional parameters
            {
              x: x,
              y: -streetHeight,
              z: z
            }, // Mesh color
            colors.DARK_BROWN
          )
        );

        streetMeshList.push(
          getBoxMesh(
            // Geometry parameters
            {
              width: blockSize,
              height: streetHeight,
              depth: blockSize
            },
            // Positional parameters
            {
              x: x,
              y: -streetHeight / 2,
              z: z
            }, // Mesh color
            colors.STREET
          )
        );
      }
    }
  }

  // Merge the street / ground level meshes and add them to the scene

  if (streetMeshList.length) scene.add(getMergedMesh(streetMeshList));
  if (groundMeshList.length) scene.add(getMergedMesh(groundMeshList));

  // Finally, add in the base and water meshes to finish off the terrain
  scene.add(baseMesh, water);
}

// Generate the ground / city blocks composed of buildings / parks / parking and add them
// to the scene
function generateGroundBlocks() {
  // Go through each one of our grid blocks
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      // Check if we have a ground block located on this grid (i, j) position
      if (isGroundBlock(i, j)) {
        // Translate our grid coordinates to the scene (x, z) coordinates

        var x = getSceneXCoordinate(i);
        var z = getSceneZCoordinate(j);

        // Calculate the total block curb width
        var curbWidth = blockSize - roadWidth;

        // Check if we have a building block allocated in on our grid (i, j) coordinates
        if (isBuildingBlock(i, j)) {

          // Generate the building curb mesh and add it to the scene

          var buildingCurbMesh = getBoxMesh(
            // Geometry parameters
            {
              width: curbWidth,
              height: curbHeight,
              depth: curbWidth
            },
            // Positional parameters
            {
              x: x,
              y: curbHeight / 2,
              z: z
            }, // Mesh color
            colors.DARK_GREY
          );

          scene.add(buildingCurbMesh);

          // Generate a building / buildings with a random height parameter and add it / them to the scene:

          var buildingHeight = getRandomIntBetween(
            minBuildingHeight,
            maxBuildingHeight
          );

          var buildingWidth = curbWidth - blockMargin * 2;

          buildingGeometryParameters = {
            width: buildingWidth,
            height: buildingHeight,
            depth: buildingWidth
          };

          buildingPosition = {
            x: x,
            z: z
          };

          generateBuildingBlock(
            buildingGeometryParameters,
            buildingPosition,
            blockSubdivisions,
            []
          );
        } else {
          // Otherwise, we don't have a building block, so we use a heuristic approach to deciding whether to
          // use the block to either construct a park or parking. If the block is surrounded by less than 5
          // buildings, we build a park. Otherwise, we build an empty 'parking' lot / block.

          numberOfSurroundingBuildings = getSurroundingBuildingNumber(i, j);

          // If the building block is surrounded by less than 5 buildings, we allocate it to a park:
          if (numberOfSurroundingBuildings < 5) {
            // Generate the green park mesh and add it to the scene:

            var parkMesh = getBoxMesh(
              // Geometry parameters
              {
                width: curbWidth,
                height: curbHeight,
                depth: curbWidth
              },
              // Positional parameters
              {
                x: x,
                y: curbHeight / 2,
                z: z
              }, // Mesh color
              colors.GREEN
            );

            scene.add(parkMesh);

						// Generate the trees to add to our park mesh
						
						var buildingWidth = curbWidth - blockMargin * 2;

						generateTrees(x, z, buildingWidth);
						
          } else {
            // Otherwise, we assign the block to hold parking, which is essentially an empty curb we add
            // to our scene

            var parkingMesh = getBoxMesh(
              // Geometry parameters
              {
                width: curbWidth,
                height: curbHeight,
                depth: curbWidth
              },
              // Positional parameters
              {
                x: x,
                y: curbHeight / 2,
                z: z
              }, // Mesh color
              colors.DARK_GREY
            );

						scene.add(parkingMesh);
						
          }
        }
      }
    }
  }
}

// Create a cylinder mesh and return it
function getCylinderMesh(color, cylinderGeometryParameters, position) {
  // We set default values to some of our cylinder geometry parameters if they're undefined

  if (cylinderGeometryParameters.radialSegments === "undefined")
    cylinderGeometryParameters.radialSegments = 4;
  if (cylinderGeometryParameters.heightSegments === "undefined")
    cylinderGeometryParameters.heightSegments = 1;

  // Use lambert mesh material which is made for non-shiny surfaces / great for performance
  material = new THREE.MeshLambertMaterial({
    color: color
  });

  // Create a box geometry ( made for rectangular shapes ) with the given width, height, and depth parameters
  geometry = new THREE.CylinderGeometry(
    cylinderGeometryParameters.radiusTop,
    cylinderGeometryParameters.radiusBottom,
    cylinderGeometryParameters.height,
    cylinderGeometryParameters.radialSegments,
    cylinderGeometryParameters.heightSegments
  );

  // Generate the new mesh and return it

  mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(position.x, position.y, position.z);

  mesh.rotation.y = Math.PI / 4;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

// Generate a tree on the scene (x, y) coordinate
var Tree = function(x, z) {
  // Array we use to hold the components which compose the tree
  this.components = [];

  // Generate a random height for our tree
  var treeHeight = getRandomIntBetween(minTreeHeight, maxTreeHeight);

  trunkMesh = getBoxMesh(
    // Geometry parameters
    {
      width: 2,
      height: treeHeight,
      depth: 2
    },
    // Positional parameters
    {
      x: x,
      y: treeHeight / 2 + curbHeight,
      z: z
    }, // Mesh color
    colors.DARK_BROWN
  );

  branchMesh = getCylinderMesh(
    // Mesh color
    colors.TREE,
    // Geometry parameters
    {
      radiusTop: 0,
      radiusBottom: 5,
      height: maxTreeHeight * 1.5
    },
    // Positional parameters
    {
      x: x,
      y: treeHeight + curbHeight + 5,
      z: z
    }
  );

  // Rotate the tree in a random direction
  branchMesh.rotation.y = Math.random();

  // Add the branch / trunk to the tree components list
  this.components.push(branchMesh, trunkMesh);

  // Function which merges the tree branch and trunk components and returns them
  this.getMergedMesh = function() {
    return getMergedMesh(this.components);
  };
};

// Generate trees centered within our scene (x, z) coordiante and laying within the given
// park size parameter
function generateTrees(x, z, parkSize) {
  var trees = [];

  // Generate a random number from [0 -> maximum tree density] to allocate to this park block
  var numberOfTrees = getRandomIntBetween(0, maximumTreeDensity);

  // Generate the park tree elements
  for (var i = 0; i < numberOfTrees; i++) {
    // Generate a random (x, z) coordinate for our tree and generate the tree

    var tree_x_coord = getRandomIntBetween(x - parkSize / 2, x + parkSize / 2);
    var tree_z_coord = getRandomIntBetween(z - parkSize / 2, z + parkSize / 2);

    // Generate a tree at the generated (x, z) coordiante and it to our array of trees
    tree = new Tree(tree_x_coord, tree_z_coord);
    trees.push(tree.getMergedMesh());
  }

  // Merge the generated tree meshes and add them to the scene
  if (trees.length) scene.add(getMergedMesh(trees));
}

// Create a mesh we're going to use for our buildings
function getBuildingMesh(boxGeometryParameters, position, color) {
  // Use lambert mesh material which is made for non-shiny surfaces / is generally great for performance
  var sideBuildingMaterial = new THREE.MeshLambertMaterial({
    color: color,
    // Check if our building qualifies as being tall, and if it does, use the large building canvas,
    // otherwise, we use the small one
    map: new THREE.Texture(
      isTall(boxGeometryParameters.height)
        ? this.largeBuildingCanvas
        : this.smallBuildingCanvas
    )
  });

  // We need to flag our side textures as needing an update, since we're using different canvas elements
  // for this material
  sideBuildingMaterial.map.needsUpdate = true;

  // We use a regular non-textured lambert mesh for our top / bottom faces
  var topBottomMaterial = new THREE.MeshLambertMaterial({
    color: color
  });

  // Set the materials we're going to use for each building side separately
  var materials = [
    sideBuildingMaterial, // Left side
    sideBuildingMaterial, // Right side
    topBottomMaterial, // Top side
    topBottomMaterial, // Bottom side
    sideBuildingMaterial, // From side
    sideBuildingMaterial // Back side
  ];

  // Create a box geometry ( made for rectangular shapes ) with the given width, height, and depth parameters
  geometry = new THREE.BoxGeometry(
    boxGeometryParameters.width,
    boxGeometryParameters.height,
    boxGeometryParameters.depth
  );

  // Create the building mesh and return it

  mesh = new THREE.Mesh(geometry, materials);

  mesh.position.set(position.x, position.y, position.z);

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

// Create a new building element with the specified geometry / position parameters
var Building = function(geometryParameters, position) {
  // Array used to hold the building components
  this.components = [];

  // Generate a new mesh for out building and add it to our components array

  buildingMesh = getBuildingMesh(geometryParameters, position, colors.BUILDING);

  this.components.push(buildingMesh);

  // Function which merges the building components and returns them
  this.getMergedMesh = function() {
    return getMergedMesh(this.components);
  };
};

// Returns true if the input height parameter qualifies a scructure or building as being 'tall' and
// false otherwise. To generate this value, we generally use a 'tall percentage cutoff' thershold which
// uses our maximum building height in order to make the proper assignment.
function isTall(height) {
  return Math.round(height / maxBuildingHeight * 100) >= tallPercentageCutoff;
}

// Generate a building block which holds the input geometry / position parameters and sub-divide
// it by the 'numOfDivisions' assigned. The last buildings parameter is an array holding the
// generated buildings created and assigned to this block.
function generateBuildingBlock(
  geometryParameters,
  position,
  numOfDivisions,
  buildings
) {
  // If the building is tall or if we have less than 1 sub-division to generate, create a building
  if (isTall(geometryParameters.height) || numOfDivisions < 1) {
    // Generate a randomized maximum height deviation to use for our building
    var maxHeightDeviation = generateBuildingHeightDeviation();

    // Generate a random building height falling within our generated deviation
    var buildingHeight = getRandomIntBetween(
      geometryParameters.height - maxHeightDeviation,
      geometryParameters.height + maxHeightDeviation
    );

    // Generate the geometry and position maps to use when constructing our building

    var buildingGeometryParameters = {
      width: geometryParameters.width,
      height: buildingHeight,
      depth: geometryParameters.depth
    };

    var buildingPosition = {
      x: position.x,
      y: buildingGeometryParameters.height / 2 + curbHeight,
      z: position.z
    };

    // Generate a new building with the assigned position and geometry and add it to our
    // array of buildings
    var building = new Building(buildingGeometryParameters, buildingPosition);
    buildings.push(building.getMergedMesh());

    // Calculate the amount of buildings we've already generated
    var totalBuildingsBuilt = buildings.length;

    // Calculate the total number of buildings we're targeting to build (according to the amount of
    // sub-divisions assigned to our block)
    var totalBuildingsToBuild = Math.pow(2, blockSubdivisions);

    // If our block has no more buildings which need to be built, or if our building qualifies as
    // being a tall structure, we're done and we can merge the building mesh and add it to the scene
    if (
      totalBuildingsBuilt >= totalBuildingsToBuild ||
      isTall(buildingGeometryParameters.height)
    ) {
      scene.add(getMergedMesh(buildings));
    }
  } else {
    // Otherwise, we sub-divide our block into different components and generate a building whithin
    // each sub component block

    // Generate a randomized block 'slice' deviation to use
    var sliceDeviation = Math.abs(
      getRandomIntBetween(0, maxBuildingSliceDeviation)
    );

    // If our geometry depth is larger than our width, we slice the depth dimension in 2 and generate
    // 2 sub-divisions / building elements spread across our depth dimension
    if (geometryParameters.width <= geometryParameters.depth) {
      // Calculate the new depth geometry parameters we need to use to sub-divide this block
      var depth1 =
        Math.abs(geometryParameters.depth / 2 - sliceDeviation) -
        blockMargin / 2;
      var depth2 =
        Math.abs(-(geometryParameters.depth / 2) - sliceDeviation) -
        blockMargin / 2;

      // Calculate the new z coordinates we're going to use for our sub-division
      var z1 =
        position.z +
        sliceDeviation / 2 +
        geometryParameters.depth / 4 +
        blockMargin / 4;
      var z2 =
        position.z +
        sliceDeviation / 2 -
        geometryParameters.depth / 4 -
        blockMargin / 4;

      // Recursively generate the new sub-divided block elements and add them to the scene

      generateBuildingBlock(
        // Building geometry parameters
        {
          width: geometryParameters.width,
          height: geometryParameters.height,
          depth: depth1
        },
        // Building position
        {
          x: position.x,
          z: z1
        },
        // Decrement the total number of sub-divisions we need to perform
        numOfDivisions - 1,
        buildings
      );

      generateBuildingBlock(
        // Building geometry parameters
        {
          width: geometryParameters.width,
          height: geometryParameters.height,
          depth: depth2
        },
        // Building position
        {
          x: position.x,
          z: z2
        },
        // Decrement the total number of sub-divisions we need to perform
        numOfDivisions - 1,
        buildings
      );
    } else {
      // Slice the width dimension in 2 and generate 2 sub-divisions / building elements spread across our
      // width dimension

      // Calculate the new width geometry parameters we need to use to sub-divide this block
      var width1 =
        Math.abs(geometryParameters.width / 2 - sliceDeviation) -
        blockMargin / 2;
      var width2 =
        Math.abs(-(geometryParameters.width / 2) - sliceDeviation) -
        blockMargin / 2;

      // Calculate the new x coordinates to use as part of our positional parameters
      var x1 =
        position.x +
        sliceDeviation / 2 +
        geometryParameters.width / 4 +
        blockMargin / 4;
      var x2 =
        position.x +
        sliceDeviation / 2 -
        geometryParameters.width / 4 -
        blockMargin / 4;

      // Recursively generate the new sub-divided block elements and add them to the scene

      generateBuildingBlock(
        // Building geometry parameters
        {
          width: width1,
          height: geometryParameters.height,
          depth: geometryParameters.depth
        },
        // Building position
        {
          x: x1,
          z: position.z
        },
        // Decrement the total number of sub-divisions we need to perform
        numOfDivisions - 1,
        buildings
      );

      generateBuildingBlock(
        // Building geometry parameters
        {
          width: width2,
          height: geometryParameters.height,
          depth: geometryParameters.depth
        },
        // Building position
        {
          x: x2,
          z: position.z
        },
        // Decrement the total number of sub-divisions we need to perform
        numOfDivisions - 1,
        buildings
      );
    }
  }
}

// Function called on window resize events.
function resize() {
  renderer.setSize(window.innerHeight, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Update the global city option variables to contain the user input specified within our html page
function updateCityOptions() {
  this.gridSize = document.getElementById("grid_size").value;
  this.blockSize = document.getElementById("block_size").value;
  this.blockMargin = document.getElementById("block_margin").value;
  this.roadWidth = document.getElementById("road_width").value;
  this.maximumTreeDensity = document.getElementById("tree_density").value;
}

// Remove the existing canvas and re-initialize the scene
function reset() {
  var canvas = document.getElementsByTagName("CANVAS")[0];
  document.body.removeChild(canvas);

  init();
}

// Whenever the regenerate button is clicked, update our city option variables and
// regenerate the scene
document.getElementById("regenerate").addEventListener(
  "click",
  function() {
    updateCityOptions();
    reset();
  },
  false
);

// This event handles our ability to toggle the visibility of the city options menu.
document.getElementById("options").addEventListener(
  "click",
  function() {
    document.querySelector(".options").classList.toggle("hidden");
  },
  false
);

// This is our main animation loop
var render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  controls.update();
};

// Function which initializes all of our city / scene elements
function init() {
  generateScene();
  generateLighting();
  generatePreceduralMaps();
  generateCityTerrain();
  generateGroundBlocks();
}

// Initialize and render the scene
init();
render();

