#ifdef GL_ES
precision highp float;
#endif

uniform vec2 dim;
uniform sampler2D uSampler;
uniform vec2 sel;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;

varying vec2 vTextureCoord;

void main()
{
	vec2 f = floor(vTextureCoord * dim);
	ivec2 modF = ivec2(mod(f, 2.0));
	vec4 color = c2;

	if(ivec2(f) == ivec2(sel))
		color = cs;
	else if ((modF == ivec2(0, 0)) || (modF == ivec2(1, 1)))
		color = c1;

	gl_FragColor = color * texture2D(uSampler, vTextureCoord);
}
