var canvas: HTMLCanvasElement; 
var device: Soft3D.Device;
var mesh: Soft3D.Mesh;
var meshes: Soft3D.Mesh[] = [];
var mera: Soft3D.Camera;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = <HTMLCanvasElement> document.getElementById("frontBuffer");
    mesh = new Soft3D.Mesh("Cube", 8);
    meshes.push(mesh);
    mera = new Soft3D.Camera();
    device = new Soft3D.Device(canvas);

    mesh.vertices[0] = new Soft3D.Vector3(-1, 1, 1);
    mesh.vertices[1] = new Soft3D.Vector3(1, 1, 1);
    mesh.vertices[2] = new Soft3D.Vector3(-1, -1, 1);
    mesh.vertices[3] = new Soft3D.Vector3(-1, -1, -1);
    mesh.vertices[4] = new Soft3D.Vector3(-1, 1, -1);
    mesh.vertices[5] = new Soft3D.Vector3(1, 1, -1);
    mesh.vertices[6] = new Soft3D.Vector3(1, -1, 1);
    mesh.vertices[7] = new Soft3D.Vector3(1, -1, -1);

    mera.position = new Soft3D.Vector3(0, 0, -10);
    mera.target = new Soft3D.Vector3(0, 0, 0);

    // Calling the HTML5 rendering loop
    requestAnimationFrame(render);
}

function render() {
    device.clear();

    // rotating slightly the cube during each frame rendered
    mesh.rotation.x += 0.1;
    mesh.rotation.y += 0.1;

    // Doing the various matrix operations
    device.render(mera, meshes);
    // Flushing the back buffer into the front buffer
    device.present();

    // Calling the HTML5 rendering loop recursively
    requestAnimationFrame(render);
}