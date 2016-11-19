#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D vSampler;
varying vec4 color;

void main()
{
	gl_FragColor = color;
	//gl_FragColor = vec4(1, 0, 0, 1) * texture2D(vSampler, vTextureCoord);
}
