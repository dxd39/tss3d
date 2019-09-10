"use strict";
var Soft3D;
(function (Soft3D) {
    var Camera = /** @class */ (function () {
        function Camera() {
            this.position = new Soft3D.Vector3(0, 0, 0);
            this.target = new Soft3D.Vector3(0, 0, 0);
        }
        return Camera;
    }());
    Soft3D.Camera = Camera;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            this.values = new Float32Array(4);
            this.values[0] = r;
            this.values[1] = g;
            this.values[2] = b;
            this.values[3] = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            get: function () {
                return this.values[0];
            },
            set: function (value) {
                this.values[0] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () {
                return this.values[1];
            },
            set: function (value) {
                this.values[1] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () {
                return this.values[2];
            },
            set: function (value) {
                this.values[2] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () {
                return this.values[3];
            },
            set: function (value) {
                this.values[3] = value;
            },
            enumerable: true,
            configurable: true
        });
        return Color;
    }());
    Soft3D.Color = Color;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Device = /** @class */ (function () {
        function Device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = window.innerWidth;
            this.workingHeight = window.innerHeight;
            this.workingCanvas.width = this.workingWidth;
            this.workingCanvas.height = this.workingHeight;
            this.workingContext = this.workingCanvas.getContext("2d");
            window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        }
        Device.prototype.resizeCanvas = function () {
            this.workingCanvas.width = window.innerWidth;
            this.workingCanvas.height = window.innerHeight;
            this.workingWidth = this.workingCanvas.width;
            this.workingHeight = this.workingCanvas.height;
            this.clear();
        };
        // This function is called to clear the back buffer with a specific color
        Device.prototype.clear = function () {
            // Clearing with black color by default
            if (this.workingContext) {
                this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
                // once cleared with black pixels, we're getting back the associated image data to 
                // clear out back buffer
                this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
            }
        };
        // Once everything is ready, we can flush the back buffer
        // into the front buffer. 
        Device.prototype.present = function () {
            if (this.workingContext) {
                this.workingContext.putImageData(this.backbuffer, 0, 0);
            }
        };
        // Called to put a pixel on screen at a specific X,Y coordinates
        Device.prototype.putPixel = function (x, y, color) {
            this.backbufferdata = this.backbuffer.data;
            // As we have a 1-D Array for our back buffer
            // we need to know the equivalent cell index in 1-D based
            // on the 2D coordinates of the screen
            var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
            // RGBA color space is used by the HTML5 canvas
            this.backbufferdata[index] = color.r * 255;
            this.backbufferdata[index + 1] = color.g * 255;
            this.backbufferdata[index + 2] = color.b * 255;
            this.backbufferdata[index + 3] = color.a * 255;
        };
        // Project takes some 3D coordinates and transform them
        // in 2D coordinates using the transformation matrix
        Device.prototype.project = function (coord, transMat) {
            // transforming the coordinates
            var point = transMat.transformCoordinates(coord);
            // The transformed coordinates will be based on coordinate system
            // starting on the center of the screen. But drawing on screen normally starts
            // from top left. We then need to transform them again to have x:0, y:0 on top left.
            var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
            return new Soft3D.Vector2(x, y);
        };
        // drawPoint calls putPixel but does the clipping operation before
        Device.prototype.drawPoint = function (point) {
            // Clipping what's visible on screen
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth
                && point.y < this.workingHeight) {
                // Drawing a yellow point
                this.putPixel(point.x, point.y, new Soft3D.Color(1, 1, 0, 1));
            }
        };
        Device.prototype.drawLine = function (point0, point1) {
            // If the distance between the 2 points is less than 2 pixels
            // We're exiting
            if (Soft3D.Vector2.Distance(point0, point1) < 2) {
                return;
            }
            // Find the middle point between first & second point
            var middlePoint = new Soft3D.Vector2(point0.x, point0.y).add(point1).scale(0.5);
            // We draw this point on screen
            this.drawPoint(middlePoint);
            // Recursive algorithm launched between first & middle point
            // and between middle & second point
            this.drawLine(point0, middlePoint);
            this.drawLine(middlePoint, point1);
        };
        Device.prototype.drawBline = function (point0, point1) {
            var x0 = point0.x >> 0;
            var y0 = point0.y >> 0;
            var x1 = point1.x >> 0;
            var y1 = point1.y >> 0;
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;
            while (true) {
                this.drawPoint(new Soft3D.Vector2(x0, y0));
                if ((x0 == x1) && (y0 == y1))
                    break;
                var e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        };
        // The main method of the engine that re-compute each vertex projection
        // during each frame
        Device.prototype.render = function (camera, meshes) {
            // To understand this part, please read the prerequisites resources
            var viewMatrix = new Soft3D.Matrix4().setLookAt(camera.position, camera.target, Soft3D.Vector3.UP);
            var projectionMatrix = new Soft3D.Matrix4()
                .setPerspective(60, this.workingWidth / this.workingHeight, 0.01, 1.0);
            for (var index = 0; index < meshes.length; index++) {
                // current mesh to work on
                var cMesh = meshes[index];
                // Beware to apply rotation before translation
                var worldMatrix = new Soft3D.Matrix4().setFromEulerAngles(cMesh.rotation.x, cMesh.rotation.y, cMesh.rotation.z)
                    .multiply(new Soft3D.Matrix4()
                    .setTranlate(cMesh.position.x, cMesh.position.y, cMesh.position.z));
                var transformMatrix = projectionMatrix.multiply(viewMatrix).multiply(worldMatrix); //！！左乘
                for (var i = 0; i < cMesh.indices.length;) {
                    var vertexA = cMesh.vertices[cMesh.indices[i++]];
                    var vertexB = cMesh.vertices[cMesh.indices[i++]];
                    var vertexC = cMesh.vertices[cMesh.indices[i++]];
                    var pixelA = this.project(vertexA, transformMatrix);
                    var pixelB = this.project(vertexB, transformMatrix);
                    var pixelC = this.project(vertexC, transformMatrix);
                    this.drawBline(pixelA, pixelB);
                    this.drawBline(pixelB, pixelC);
                    this.drawBline(pixelC, pixelA);
                }
            }
        };
        return Device;
    }());
    Soft3D.Device = Device;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Matrix4 = /** @class */ (function () {
        function Matrix4() {
            this.data = new Float32Array(16);
            var data = new Float32Array(16);
            data[0] = data[5] = data[10] = data[15] = 1;
            this.data = data;
        }
        Matrix4.prototype.multiply = function (rhs) {
            var a = this.data;
            var b = rhs.data;
            var r = new Float32Array(16);
            var ai0, ai1, ai2, ai3;
            for (var i = 0; i < 4; i++) {
                ai0 = a[i];
                ai1 = a[i + 4];
                ai2 = a[i + 8];
                ai3 = a[i + 12];
                r[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
                r[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
                r[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
                r[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
            }
            this.data = r;
            return this;
        };
        Matrix4.prototype.transformCoordinates = function (vec) {
            var m = this.data;
            var x = vec.x, y = vec.y, z = vec.z;
            var rx = x * m[0] + y * m[4] + z * m[8] + m[12];
            var ry = x * m[1] + y * m[5] + z * m[9] + m[13];
            var rz = x * m[2] + y * m[6] + z * m[10] + m[14];
            var rw = 1 / (x * m[3] + y * m[7] + z * m[11] + m[15]);
            return new Soft3D.Vector3(rx * rw, ry * rw, rz * rw);
        };
        Matrix4.prototype.setIdentity = function () {
            var m = this.data;
            m[0] = 1;
            m[4] = 0;
            m[8] = 0;
            m[12] = 0;
            m[1] = 0;
            m[5] = 1;
            m[9] = 0;
            m[13] = 0;
            m[2] = 0;
            m[6] = 0;
            m[10] = 1;
            m[14] = 0;
            m[3] = 0;
            m[7] = 0;
            m[11] = 0;
            m[15] = 1;
            return this;
        };
        Matrix4.prototype.setLookAt = function (eye, target, up) {
            var y = new Soft3D.Vector3(up.x, up.y, up.z).normalize();
            var z = Soft3D.Vector3.Subtract(eye, target).normalize();
            var x = Soft3D.Vector3.Cross(y, z).normalize();
            y = Soft3D.Vector3.Cross(z, x);
            var m = this.data;
            m[0] = x.x;
            m[1] = x.y;
            m[2] = x.z;
            m[3] = 0;
            m[4] = y.x;
            m[5] = y.y;
            m[6] = y.z;
            m[7] = 0;
            m[8] = z.x;
            m[9] = z.y;
            m[10] = z.z;
            m[11] = 0;
            m[12] = -Soft3D.Vector3.Dot(x, eye);
            m[13] = -Soft3D.Vector3.Dot(y, eye);
            m[14] = -Soft3D.Vector3.Dot(z, eye);
            m[15] = 1;
            return this;
        };
        ///  r = right, l = left, b = bottom, t = top, n = near, f = far
        ///  
        ///  2*n/(r-l)   0           (r+l)/(r-l)    0
        ///  0           2*n/(t-b)   (t+b)/(t-b)    0
        ///  0           0           -(f+n)/(f-n)   -2*f*n/(f-n)
        ///  0           0           -1             0
        Matrix4.prototype.setPerspective = function (fov, aspect, znear, zfar) {
            var c = 1.0 / Math.tan(fov * Math.PI / 360);
            var a = aspect, f = zfar, n = znear;
            var m = this.data;
            m[0] = c / a;
            m[4] = 0;
            m[8] = 0;
            m[12] = 0;
            m[1] = 0;
            m[5] = c;
            m[9] = 0;
            m[13] = 0;
            m[2] = 0;
            m[6] = 0;
            m[10] = -(f + n) / (f - n);
            m[14] = -2 * f * n / (f - n);
            m[3] = 0;
            m[7] = 0;
            m[11] = -1;
            m[15] = 0;
            return this;
        };
        Matrix4.prototype.setTranlate = function (x, y, z) {
            var m = this.data;
            m[0] = 1;
            m[4] = 0;
            m[8] = 0;
            m[12] = x;
            m[1] = 0;
            m[5] = 1;
            m[9] = 0;
            m[13] = y;
            m[2] = 0;
            m[6] = 0;
            m[10] = 1;
            m[14] = z;
            m[3] = 0;
            m[7] = 0;
            m[11] = 0;
            m[15] = 1;
            return this;
        };
        Matrix4.prototype.setFromEulerAngles = function (ex, ey, ez) {
            var s1, c1, s2, c2, s3, c3, m;
            var DEG_TO_RAD = Math.PI / 180;
            ex *= DEG_TO_RAD;
            ey *= DEG_TO_RAD;
            ez *= DEG_TO_RAD;
            // Solution taken from http://en.wikipedia.org/wiki/Euler_angles#Matrix_orientation
            s1 = Math.sin(-ex);
            c1 = Math.cos(-ex);
            s2 = Math.sin(-ey);
            c2 = Math.cos(-ey);
            s3 = Math.sin(-ez);
            c3 = Math.cos(-ez);
            m = this.data;
            // Set rotation elements
            m[0] = c2 * c3;
            m[1] = -c2 * s3;
            m[2] = s2;
            m[3] = 0;
            m[4] = c1 * s3 + c3 * s1 * s2;
            m[5] = c1 * c3 - s1 * s2 * s3;
            m[6] = -c2 * s1;
            m[7] = 0;
            m[8] = s1 * s3 - c1 * c3 * s2;
            m[9] = c3 * s1 + c1 * s2 * s3;
            m[10] = c1 * c2;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;
            return this;
        };
        Matrix4.Identity = new Matrix4().setIdentity();
        return Matrix4;
    }());
    Soft3D.Matrix4 = Matrix4;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Mesh = /** @class */ (function () {
        function Mesh(name, verticesCount, facesCount) {
            this.name = name;
            this.vertices = new Array(verticesCount);
            this.indices = new Array(facesCount);
            this.rotation = new Soft3D.Vector3(0, 0, 0);
            this.position = new Soft3D.Vector3(0, 0, 0);
        }
        return Mesh;
    }());
    Soft3D.Mesh = Mesh;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Vector2 = /** @class */ (function () {
        function Vector2(x, y) {
            this.data = new Float32Array(2);
            this.data[0] = x;
            this.data[1] = y;
        }
        Vector2.prototype.add = function (other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        };
        Vector2.prototype.subtract = function (other) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        };
        Vector2.prototype.scale = function (scale) {
            this.x *= scale;
            this.y *= scale;
            return this;
        };
        Object.defineProperty(Vector2.prototype, "x", {
            get: function () {
                return this.data[0];
            },
            set: function (value) {
                this.data[0] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "y", {
            get: function () {
                return this.data[1];
            },
            set: function (value) {
                this.data[1] = value;
            },
            enumerable: true,
            configurable: true
        });
        Vector2.Distance = function (a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        Vector2.ZERO = new Vector2(0, 0);
        Vector2.ONE = new Vector2(1, 1);
        return Vector2;
    }());
    Soft3D.Vector2 = Vector2;
})(Soft3D || (Soft3D = {}));
var Soft3D;
(function (Soft3D) {
    var Vector3 = /** @class */ (function () {
        function Vector3(x, y, z) {
            this.data = new Float32Array(3);
            this.data[0] = x;
            this.data[1] = y;
            this.data[2] = z;
        }
        Vector3.prototype.add = function (other) {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
            return this;
        };
        Vector3.prototype.subtract = function (other) {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
            return this;
        };
        Vector3.prototype.normalize = function () {
            var lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
            if (lengthSq > 0) {
                var invLength = 1 / Math.sqrt(lengthSq);
                this.x *= invLength;
                this.y *= invLength;
                this.z *= invLength;
            }
            return this;
        };
        Vector3.prototype.setLookAt = function (position, target, up) {
        };
        Object.defineProperty(Vector3.prototype, "x", {
            get: function () {
                return this.data[0];
            },
            set: function (value) {
                this.data[0] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "y", {
            get: function () {
                return this.data[1];
            },
            set: function (value) {
                this.data[1] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "z", {
            get: function () {
                return this.data[2];
            },
            set: function (value) {
                this.data[2] = value;
            },
            enumerable: true,
            configurable: true
        });
        Vector3.Add = function (a, b) {
            var res = new Vector3(0, 0, 0);
            res.x = a.x + b.x;
            res.y = a.y + b.y;
            res.z = a.z + b.z;
            return res;
        };
        Vector3.Subtract = function (a, b) {
            var res = new Vector3(0, 0, 0);
            res.x = a.x - b.x;
            res.y = a.y - b.y;
            res.z = a.z - b.z;
            return res;
        };
        Vector3.Cross = function (a, b) {
            var res = new Vector3(0, 0, 0);
            res.x = a.y * b.z - b.y * a.z;
            res.y = a.z * b.x - b.z * a.x;
            res.z = a.x * b.y - b.x * a.y;
            return res;
        };
        Vector3.Dot = function (a, b) {
            return (a.x * b.x + a.y * b.y + a.z * b.z);
        };
        Vector3.ZERO = new Vector3(0, 0, 0);
        Vector3.ONE = new Vector3(1, 1, 1);
        Vector3.UP = new Vector3(0, 1, 0);
        Vector3.RIGHT = new Vector3(1, 0, 0);
        Vector3.FORWARD = new Vector3(0, 0, 1);
        return Vector3;
    }());
    Soft3D.Vector3 = Vector3;
})(Soft3D || (Soft3D = {}));
var canvas;
var device;
var mesh;
var meshes = [];
var mera;
document.addEventListener("DOMContentLoaded", init, false);
function init() {
    canvas = document.getElementById("frontBuffer");
    mesh = new Soft3D.Mesh("Cube", 8, 12);
    meshes.push(mesh);
    mera = new Soft3D.Camera();
    device = new Soft3D.Device(canvas);
    mesh.vertices[0] = new Soft3D.Vector3(-1, 1, 1);
    mesh.vertices[1] = new Soft3D.Vector3(1, 1, 1);
    mesh.vertices[2] = new Soft3D.Vector3(-1, -1, 1);
    mesh.vertices[3] = new Soft3D.Vector3(1, -1, 1);
    mesh.vertices[4] = new Soft3D.Vector3(-1, 1, -1);
    mesh.vertices[5] = new Soft3D.Vector3(1, 1, -1);
    mesh.vertices[6] = new Soft3D.Vector3(1, -1, -1);
    mesh.vertices[7] = new Soft3D.Vector3(-1, -1, -1);
    mesh.indices = [
        0, 1, 2,
        1, 2, 3,
        1, 3, 6,
        1, 5, 6,
        0, 1, 4,
        1, 4, 5,
        2, 3, 7,
        3, 6, 7,
        0, 2, 7,
        0, 4, 7,
        4, 5, 6,
        4, 6, 7
    ];
    mera.position = new Soft3D.Vector3(0, 0, -10);
    mera.target = new Soft3D.Vector3(0, 0, 0);
    // Calling the HTML5 rendering loop
    requestAnimationFrame(render);
}
function render() {
    device.clear();
    // rotating slightly the cube during each frame rendered
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    // Doing the various matrix operations
    device.render(mera, meshes);
    // Flushing the back buffer into the front buffer
    device.present();
    // Calling the HTML5 rendering loop recursively
    requestAnimationFrame(render);
}
//# sourceMappingURL=bundle.js.map