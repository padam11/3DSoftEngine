window.requestAnimationFrame = (function () {
   return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function (callback) {
             window.setTimeout(callback, 1000 / 60);
         };
     })();

var canvas;
var device;
var mesh;
var meshes = [];
var mera;
document.addEventListener("DOMContentLoaded", init, false);
function init() {
    canvas = document.getElementById("frontBuffer");
    mesh = new engine.Mesh("Cube", 8);
    meshes.push(mesh);
    mera = new engine.Camera();
    device = new engine.Device(canvas);
    mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1);
    mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1);
    mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1);
    mesh.Vertices[3] = new BABYLON.Vector3(-1, -1, -1);
    mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1);
    mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1);
    mesh.Vertices[6] = new BABYLON.Vector3(1, -1, 1);
    mesh.Vertices[7] = new BABYLON.Vector3(1, -1, -1);
    mera.Position = new BABYLON.Vector3(0, 0, 10);
    mera.Target = new BABYLON.Vector3(0, 0, 0);
    requestAnimationFrame(drawingLoop); //call html5 rendering loop
}
function drawingLoop() {
    device.clear(); //clear screen
    mesh.Rotation.x += 0.01; //contiously update
    mesh.Rotation.y += 0.01;
    device.render(mera, meshes); //render by doing the required matrix ops
    device.present(); //diplay
    requestAnimationFrame(drawingLoop);
}