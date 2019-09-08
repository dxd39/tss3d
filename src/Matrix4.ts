module Soft3D {
    export class Matrix4 {

        static readonly Identity = new Matrix4().setIdentity();

        private data = new Float32Array(16);
        
        constructor() {
            let data = new Float32Array(16);
            data[0] = data[5] = data[10] = data[15] = 1;
            this.data = data;
        }

        multiply(rhs: Matrix4): Matrix4 {
            let a = this.data;
            let b = rhs.data;
            
            let r = new Float32Array(16);
            let ai0, ai1, ai2, ai3;
            for (let i = 0; i < 4; i++) {
                ai0 = a[i];
			    ai1 = a[i+4];
			    ai2 = a[i+8];
			    ai3 = a[i+12];
			    r[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
			    r[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
			    r[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
			    r[i + 12]= ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 *b[15];                
            }

            this.data = r;

            return this;
        }

        transformCoordinates(vec: Vector3): Vector3 {
            let m = this.data;            
            let x = vec.x, y = vec.y, z = vec.z;

            let rx = x * m[0] + y * m[4] + z * m[8] + m[12];
            let ry = x * m[1] + y * m[5] + z * m[9] + m[13];
            let rz = x * m[2] + y * m[6] + z * m[10] + m[14];
            let rw = 1 / (x * m[3] + y * m[7] + z * m[11] + m[15]);

            return new Vector3(rx * rw, ry * rw, rz * rw);
        }

        setIdentity(): Matrix4 {
            let m = this.data;

            m[0] = 1;   m[4] = 0;   m[8] = 0;   m[12] = 0;
            m[1] = 0;   m[5] = 1;   m[9] = 0;   m[13] = 0;
            m[2] = 0;   m[6] = 0;   m[10] = 1;  m[14] = 0;
            m[3] = 0;   m[7] = 0;   m[11] = 0;  m[15] = 1;
    
            return this;
        }

        setLookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
            let y = new Vector3(up.x, up.y, up.z).normalize();
            let z = Vector3.Sub(eye, target).normalize();
            let x = Vector3.Cross(y, z).normalize();            
            y = Vector3.Cross(z, x);

            let m = this.data;

            m[0]  = x.x;
            m[1]  = x.y;
            m[2]  = x.z;
            m[3]  = 0;
            m[4]  = y.x;
            m[5]  = y.y;
            m[6]  = y.z;
            m[7]  = 0;
            m[8]  = z.x;
            m[9]  = z.y;
            m[10] = z.z;
            m[11] = 0;
            m[12] = -Vector3.Dot(x, eye);
            m[13] = -Vector3.Dot(y, eye);
            m[14] = -Vector3.Dot(z, eye);
            m[15] = 1;

            return this;
        }

        ///  r = right, l = left, b = bottom, t = top, n = near, f = far
        ///  
        ///  2*n/(r-l)   0           (r+l)/(r-l)    0
        ///  0           2*n/(t-b)   (t+b)/(t-b)    0
        ///  0           0           -(f+n)/(f-n)   -2*f*n/(f-n)
        ///  0           0           -1             0
        setPerspective(fov: number, aspect: number, znear: number, zfar: number): Matrix4 {
            let c = 1 / Math.tan(fov * Math.PI / 360);
            let a = aspect, f = zfar, n = znear;

            let m = this.data;
            m[0] = c / a;   m[4] = 0;   m[8] = 0; m[12] = 0;
            m[1] = 0;   m[5] = c;   m[9] = 0; m[13] = 0;
            m[2] = 0;   m[6] = 0;   m[10] = -(f + n) / (f - n);    m[14] = -2 * f * n / (f - n);
            m[3] = 0;   m[7] = 0;   m[11] = -1; m[15] = 0;

            return this;
        }

        setTranlate(x: number, y: number, z: number): Matrix4 {
            let m = this.data;

            m[0] = 1;   m[4] = 0;   m[8] = 0;   m[12] = x;
            m[1] = 0;   m[5] = 1;   m[9] = 0;   m[13] = y;
            m[2] = 0;   m[6] = 0;   m[10] = 1;  m[14] = z;
            m[3] = 0;   m[7] = 0;   m[11] = 0;  m[15] = 1;

            return this;
        }

        setFromEulerAngles(ex: number, ey: number, ez: number): Matrix4 {
            let s1, c1, s2, c2, s3, c3, m;

            let DEG_TO_RAD = Math.PI / 180;
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
        }
    }
}