module Soft3D {
    export class Mesh {
        position: Vector3;
        rotation: Vector3;
        vertices: Vector3[];
        indices: number[];

        constructor(public name: string, verticesCount: number, facesCount: number) {
            this.vertices = new Array(verticesCount);
            this.indices = new Array(facesCount);
            this.rotation = new Vector3(0, 0, 0);
            this.position = new Vector3(0, 0, 0);
        }
    }
}