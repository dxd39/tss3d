module Soft3D {
    export class Vector2 {
        private data = new Float32Array(2);
        
        constructor(x: number, y: number) {
            this.data[0] = x;
            this.data[1] = y;
        }

        add(other: Vector2): Vector2 {
            this.x += other.x;
            this.y += other.y;

            return this;
        }

        subtract(other: Vector2): Vector2 {
            this.x -= other.x;
            this.y -= other.y;

            return this;
        }

        scale(scale: number): Vector2 {
            this.x *= scale;
            this.y *= scale;

            return this;
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

        static readonly ZERO = new Vector2(0, 0);
        static readonly ONE = new Vector2(1, 1);

        static Distance(a: Vector2, b: Vector2): number {
            let dx = a.x - b.x;
            let dy = a.y - b.y;

            return Math.sqrt(dx * dx + dy * dy);
        }

    }
}