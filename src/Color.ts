module Soft3D {
    export class Color {
        get r() {
            return this.values[0]
        }

        set r(value: number) {
            this.values[0] = value;
        }

        get g() {
            return this.values[1]
        }

        set g(value: number) {
            this.values[1] = value;
        }

        get b() {
            return this.values[2]
        }

        set b(value: number) {
            this.values[2] = value;
        }

        get a() {
            return this.values[3]
        }

        set a(value: number) {
            this.values[3] = value;
        }

        private values = new Float32Array(4);

        constructor(r: number, g: number, b: number, a: number) {
            this.values[0] = r;
            this.values[1] = g;
            this.values[2] = b;
            this.values[3] = a;
        }
    }
}