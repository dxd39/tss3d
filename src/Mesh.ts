module Soft3D {
    export class Mesh {
        position: Vector3;
        rotation: Vector3;
        vertices: Vector3[];

        constructor(public name: string, verticesCount: number) {
            this.vertices = new Array(verticesCount);
            this.rotation = new Vector3(0, 0, 0);
            this.position = new Vector3(0, 0, 0);
        }
    }
}