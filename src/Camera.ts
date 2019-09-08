module Soft3D {
    export class Camera {
        position: Vector3;
        target: Vector3;

        constructor() {
            this.position = new Vector3(0, 0, 0);
            this.target = new Vector3(0, 0, 0);
        }
    }
}