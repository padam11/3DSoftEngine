const { PointsCloudSystem } = require("babylonjs");

var engine;
(function (engine) {

    var cameraEngine = (function () {
        function cameraEngine() {
            this.Position = BABYLON.Vector3.Zero();
            this.Target = BABYLON.Vector3.Zero();
        }
        return cameraEngine;
    })();
    engine.cameraEngine = cameraEngine;
    var Mesh = (function () {
        function Mesh(name, verticesCount) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Rotation = BABYLON.Vector3.Zero();
            this.Position = BABYLON.Vector3.Zero();
        }
        return Mesh;
    })();
    engine.Mesh = Mesh;

    var device = (function () {
        function device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            this.workingContext = this.workingCanvas.getContext("2d");
        }

        device.prototype.clear = function () { //clear backbuffer
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);

        };

        device.prototype.present = function () { //flush backbuffer into frontbuffer
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        };

        device.prototype.putPixel = function (x, y, color) {
            this.backbufferdata = this.backbuffer.data;
            var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;

            this.backbufferdata[index] = color.r * 255;
            this.backbufferdata[index + 1] = color.g * 255;
            this.backbufferdata[index + 2] = color.b * 255;
            this.backbufferdata[index + 3] = color.a * 255;
        };

        device.prototype.project = function (coord, transMat) {
            var point = BABYLON.Vector3.TransformCoordinates(coord, transMat)
            var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
            return (new BABYLON.Vector2(x, y));
        };

        device.prototype.drawPoint = function (point) {
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth
                && point.y < this.workingHeight) {
                    this.putPixel(point.x, point.y, new BABYLON.Color4(1, 1, 0, 1));
                } //above, draw a yellow point
        };

        device.prototype.render = function (camera, meshes) { //recompute each proj
            // projection matrix equation
            var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, 
                                           this.workingWidth / this.workingHeight, 0.01, 1.0);

            for (var index = 0; index < meshes.length; index++) {
                // current mesh to work on
                var cMesh = meshes[index];
                // Beware to apply rotation before translation
                var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(
                    cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
                     .multiply(BABYLON.Matrix.Translation(
                       cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));

                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

                for (var indexVertices = 0; indexVertices < cMesh.Vertices.length; indexVertices++) {
                    // First, we project the 3D coordinates into the 2D space
                    var projectedPoint = this.project(cMesh.Vertices[indexVertices], transformMatrix);
                    // Then we can draw on screen
                    this.drawPoint(projectedPoint);
                }
            }
        };
        return device;
    })();
    engine.device = device;
})(engine || (engine = {}));