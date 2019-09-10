namespace Soft3D {
    export class Device {
        // the back buffer size is equal to the number of pixels to draw
        // on screen (width*height) * 4 (R,G,B & Alpha values). 
        private backbuffer!: ImageData;
        private workingCanvas: HTMLCanvasElement;
        private workingContext: CanvasRenderingContext2D | null;
        private workingWidth: number;
        private workingHeight: number;
        // equals to backbuffer.data
        private backbufferdata: any;

        constructor(canvas: HTMLCanvasElement) {        
            this.workingCanvas = canvas;
            this.workingWidth = window.innerWidth;
            this.workingHeight = window.innerHeight;

            this.workingCanvas.width = this.workingWidth;
            this.workingCanvas.height = this.workingHeight;
            this.workingContext = this.workingCanvas.getContext("2d");
            
            window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        }
        
        resizeCanvas() {
            this.workingCanvas.width = window.innerWidth;
            this.workingCanvas.height = window.innerHeight;

            this.workingWidth = this.workingCanvas.width;
            this.workingHeight = this.workingCanvas.height;
            this.clear();
        }

        // This function is called to clear the back buffer with a specific color
        public clear(): void {
            // Clearing with black color by default
            if (this.workingContext) {
                this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
                // once cleared with black pixels, we're getting back the associated image data to 
                // clear out back buffer
                this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);                
            }
        }

        // Once everything is ready, we can flush the back buffer
        // into the front buffer. 
        public present(): void {
            if (this.workingContext) {
                this.workingContext.putImageData(this.backbuffer, 0, 0);                
            }
        }

        // Called to put a pixel on screen at a specific X,Y coordinates
        public putPixel(x: number, y: number, color: Color): void {
            this.backbufferdata = this.backbuffer.data;
            // As we have a 1-D Array for our back buffer
            // we need to know the equivalent cell index in 1-D based
            // on the 2D coordinates of the screen
            var index: number = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
    
            // RGBA color space is used by the HTML5 canvas
            this.backbufferdata[index] = color.r * 255;
            this.backbufferdata[index + 1] = color.g * 255;
            this.backbufferdata[index + 2] = color.b * 255;
            this.backbufferdata[index + 3] = color.a * 255;
        }

        // Project takes some 3D coordinates and transform them
        // in 2D coordinates using the transformation matrix
        public project(coord: Vector3, transMat: Matrix4): Vector2 {
            // transforming the coordinates
            var point = transMat.transformCoordinates(coord);
            // The transformed coordinates will be based on coordinate system
            // starting on the center of the screen. But drawing on screen normally starts
            // from top left. We then need to transform them again to have x:0, y:0 on top left.
            var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
            return new Vector2(x, y);
        }

        // drawPoint calls putPixel but does the clipping operation before
        public drawPoint(point: Vector2): void {
            // Clipping what's visible on screen
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth 
                                             && point.y < this.workingHeight) {
                // Drawing a yellow point
                this.putPixel(point.x, point.y, new Color(1, 1, 0, 1));
            }
        }

        public drawLine(point0: Vector2, point1: Vector2): void {
            
            // If the distance between the 2 points is less than 2 pixels
            // We're exiting
            if (Vector2.Distance(point0, point1) < 2) {
                return;
            }

            // Find the middle point between first & second point
            let middlePoint = new Vector2(point0.x, point0.y).add(point1).scale(0.5);
            // We draw this point on screen
            this.drawPoint(middlePoint);
            // Recursive algorithm launched between first & middle point
            // and between middle & second point
            this.drawLine(point0, middlePoint);
            this.drawLine(middlePoint, point1);
        }

        public drawBline(point0: Vector2, point1: Vector2): void {
            let x0 = point0.x >> 0;
            let y0 = point0.y >> 0;
            let x1 = point1.x >> 0;
            let y1 = point1.y >> 0;
            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while(true) {
                this.drawPoint(new Vector2(x0, y0));

                if ((x0 == x1) && (y0 == y1)) 
                    break;

                let e2 = 2 * err;

                if (e2 > -dy) { 
                    err -= dy; 
                    x0 += sx; 
                }

                if (e2 < dx) { 
                    err += dx; 
                    y0 += sy; 
                }
            }
        }

        // The main method of the engine that re-compute each vertex projection
        // during each frame
        public render(camera: Camera, meshes: Mesh[]): void {
            // To understand this part, please read the prerequisites resources
            var viewMatrix = new Matrix4().setLookAt(camera.position, camera.target, Vector3.UP);
            var projectionMatrix = new Matrix4()
                                    .setPerspective(60, this.workingWidth / this.workingHeight, 0.01, 1.0);

            for (var index = 0; index < meshes.length; index++) {
                // current mesh to work on
                var cMesh = meshes[index];
                // Beware to apply rotation before translation
                var worldMatrix = new Matrix4().setFromEulerAngles(
                    cMesh.rotation.x, cMesh.rotation.y, cMesh.rotation.z)
                        .multiply(new Matrix4()
                                .setTranlate(cMesh.position.x, cMesh.position.y, cMesh.position.z));

                var transformMatrix = projectionMatrix.multiply(viewMatrix).multiply(worldMatrix); //！！左乘

                for (let i = 0; i < cMesh.indices.length;) {
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
        }
    }
}