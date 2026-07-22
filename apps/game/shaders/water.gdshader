shader_type canvas_item;

uniform float speed : hint_range(0.0, 2.0) = 1;
uniform float wave_strength : hint_range(0.0, 0.05) = 0.01;

void fragment() {
	vec2 uv = UV;
	uv.x += sin(uv.y * 20.0 + TIME * speed * 5.0) * wave_strength;
	uv.y += cos(uv.x * 20.0 + TIME * speed * 5.0) * wave_strength;
	COLOR = texture(TEXTURE, uv);
}