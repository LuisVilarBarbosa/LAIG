#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D vSampler;
varying vec4 color;

void main()
{
	gl_FragColor = color * texture2D(vSampler, vTextureCoord);
}
