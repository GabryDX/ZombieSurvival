export function Zombie(){
	
	var geometry = new THREE.BoxGeometry( 1, 5, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var parallelepiped = new THREE.Mesh( geometry, material);

	return parallelepiped;

}