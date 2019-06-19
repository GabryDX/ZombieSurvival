var overlayIsOn = false;

function overlay_on() {
  document.getElementById("overlay").style.display = "block";
  overlayIsOn = true;
}

function overlay_off() {
  document.getElementById("overlay").style.display = "none";
  overlayIsOn = false;
}