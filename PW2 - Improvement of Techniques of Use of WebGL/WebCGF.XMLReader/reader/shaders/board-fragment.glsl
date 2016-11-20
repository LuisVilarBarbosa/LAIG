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
	ivec2 f = ivec2(floor(vTextureCoord * dim));
	ivec2 mod = f - 2 * (f / 2);	// mod(f, 2)
	vec4 color;

	if(f == ivec2(sel))
		color = cs;
	else if ((mod == ivec2(0, 0)) || (mod == ivec2(1, 1)))
		color = c1;
	else
		color = c2;

	gl_FragColor = color * texture2D(uSampler, vTextureCoord);
}
