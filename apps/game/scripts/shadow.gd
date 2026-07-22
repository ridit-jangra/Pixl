extends Node2D

@export var radius: float = 6.0
@export var shadow_color: Color = Color(0, 0, 0, 0.35)

func _draw():
	draw_circle(Vector2.ZERO, radius, shadow_color)

func _ready():
	scale = Vector2(1.0, 0.5) 
	position = Vector2(0, -2.5)
