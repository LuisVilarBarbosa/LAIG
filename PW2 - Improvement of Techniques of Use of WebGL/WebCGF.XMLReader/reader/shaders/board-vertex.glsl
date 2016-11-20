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
	vec2 f = floor(aTextureCoord * dim);

	if(f.s >= sel.s && f.t >= sel.t && f.s <= sel.s + 1.0 && f.t <= sel.t + 1.0)
		offset.z = 0.025;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
	vTextureCoord = aTextureCoord;
}
