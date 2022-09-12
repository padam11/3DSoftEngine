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
        function Mesh(name, verticesCount, facesCount) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Faces = new Array(facesCount);
            this.Rotation = BABYLONTS.Vector3(0, 0, 0);
            this.Position = BABYLONTS.Vector3(0, 0, 0);
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

        Device.prototype.drawLine = function (point0, point1) {
            var dist = point1.subtract(point0).length();
        
            // If the distance between the 2 points is less than 2 pixels
            // We're exiting
            if(dist < 2) {
                return;
            }
        
            // Find the middle point between first & second point
            var middlePoint = point0.add((point1.subtract(point0)).scale(0.5));
            // We draw this point on screen
            this.drawPoint(middlePoint);
            // Recursive algorithm launched between first & middle point
            // and between middle & second point
            this.drawLine(point0, middlePoint);
            this.drawLine(middlePoint, point1);
        };

        Device.prototype.drawBline = function (point0, point1) { //bresehan algorithm
            var x0 = point0.x >> 0;
            var y0 = point0.y >> 0;
            var x1 = point1.x >> 0;
            var y1 = point1.y >> 0;
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;
            while(true) {
                this.drawPoint(new BABYLON.Vector2(x0, y0));
                if((x0 == x1) && (y0 == y1)) break;
                var e2 = 2 * err;
                if(e2 > -dy) { err -= dy; x0 += sx; }
                if(e2 < dx) { err += dx; y0 += sy; }
            }
        };

        device.prototype.render = function (camera, meshes) { //recompute each proj
            // projection matrix equation
            var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, 
                                           this.workingWidth / this.workingHeight, 0.01, 1.0);

            //for (var i = 0; i < cMesh.Vertices.length -1; i++){
                //var point0 = this.project(cMesh.Vertices[i], transformMatrix);
                //var point1 = this.project(cMesh.Vertices[i + 1], transformMatrix);
                //this.drawLine(point0, point1);
            //}

            for (var index = 0; index < meshes.length; index++) {
                // current mesh to work on
                var cMesh = meshes[index];
                // Beware to apply rotation before translation
                var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(
                    cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
                     .multiply(BABYLON.Matrix.Translation(
                       cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));

                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

                for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++)
                {
                    var currentFace = cMesh.Faces[indexFaces];
                    var vertexA = cMesh.Vertices[currentFace.A];
                    var vertexB = cMesh.Vertices[currentFace.B];
                    var vertexC = cMesh.Vertices[currentFace.C];

                    var pixelA = this.project(vertexA, transformMatrix);
                    var pixelB = this.project(vertexB, transformMatrix);
                    var pixelC = this.project(vertexC, transformMatrix);

                    this.drawBLine(pixelA, pixelB);
                    this.drawBLine(pixelB, pixelC);
                    this.drawBLine(pixelC, pixelA);
                }
            }
        };
        return device;
    })();
    engine.device = device;
})(engine || (engine = {}));