attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform ivec2 dim;
uniform ivec2 sel;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;

varying vec2 vTextureCoord;
varying vec4 color;

void main()
{
	vec3 offset = vec3(0.0, 0.0, 0.0);
	ivec2 f = ivec2(floor(aTextureCoord * vec2(dim.s, dim.t)));
	ivec2 mod = f * 2 - f / 2;	// mod(f, 2)

	if(f == sel) {
		offset.z = 0.5;
		color = cs;
	}
	else if ((mod.s == 0 && mod.t == 0) || (mod.s == 1 && mod.t == 1))
		color = c1;
	else
		color = c2;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
	vTextureCoord = aTextureCoord;
}
