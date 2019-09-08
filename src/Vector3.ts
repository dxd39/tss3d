module Soft3D {
    export class Vector3 {

        private data = new Float32Array(3);

        constructor(x: number, y: number, z: number) {
            this.data[0] = x;
            this.data[1] = y;
            this.data[2] = z;
        }

        add(other: Vector3): Vector3 {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
            return this;
        }

        sub(other: Vector3): Vector3 {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
            return this;
        }

        normalize(): Vector3 {
            var lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
            if (lengthSq > 0) {
                var invLength = 1 / Math.sqrt(lengthSq);
                this.x *= invLength;
                this.y *= invLength;
                this.z *= invLength;
            } 
            
            return this;
        }

        setLookAt(position: Vector3, target: Vector3, up: Vector3) {

        }
        
        get x() {
            return this.data[0]
        }

        set x(value: number) {
            this.data[0] = value;
        }

        get y() {
            return this.data[1]
        }

        set y(value: number) {
            this.data[1] = value;
        }

        get z() {
            return this.data[2]
        }

        set z(value: number) {
            this.data[2] = value;
        }

        static readonly ZERO = new Vector3(0, 0, 0)
        static readonly ONE = new Vector3(1, 1, 1)
        static readonly UP = new Vector3(0, 1, 0)
        static readonly RIGHT = new Vector3(1, 0, 0)
        static readonly FORWARD = new Vector3(0, 0, 1)   
        
        static Add(a: Vector3, b: Vector3): Vector3 {
            var res = new Vector3(0, 0, 0);
            res.x = a.x + b.x;
            res.y = a.y + b.y;
            res.z = a.z + b.z;
            return res;
        }

        static Sub(a: Vector3, b: Vector3): Vector3 {
            var res = new Vector3(0, 0, 0);
            res.x = a.x - b.x;
            res.y = a.y - b.y;
            res.z = a.z - b.z;
            return res;
        }

        static Cross(a: Vector3, b: Vector3): Vector3 {
            var res = new Vector3(0, 0, 0);
            res.x = a.y * b.z - b.y * a.z;
            res.y = a.z * b.x - b.z * a.x;
            res.z = a.x * b.y - b.x * a.y;
            return res;
        }

        static Dot(a: Vector3, b: Vector3): number {
            return (a.x * b.x + a.y * b.y + a.z * b.z);
        }
    }
}