attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec2 dim;
uniform vec2 sel;

varying vec2 vTextureCoord;

void main()
{
	vec3 offset = vec3(0.0, 0.0, 0.0);
	ivec2 f = ivec2(floor(aTextureCoord * dim));
	ivec2 mod = f - 2 * (f / 2);	// mod(f, 2)

	if(f == ivec2(sel))
		offset.z = 0.1;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
	vTextureCoord = aTextureCoord;
}
