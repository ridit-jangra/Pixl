extends Area2D

const MONOCRAFT := preload("res://assets/fonts/Monocraft.ttf")

@export var target: String = "house"

@onready var label: Label = $Label

func _ready() -> void:
	label.add_theme_font_override("font", MONOCRAFT)
	label.add_theme_font_size_override("font_size", 24)
	label.add_theme_color_override("font_color", Color(1, 0.819608, 0.4))
	label.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	label.add_theme_constant_override("outline_size", 6)
	label.scale = Vector2.ONE / 3.5
	label.reset_size()
	label.position = Vector2(-label.size.x * label.scale.x / 2.0, -26.0)

func _on_body_entered(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		global.player_in_range = true
		global.active_door_pos = global_position
		global.active_door_target = target
		label.visible = true


func _on_body_exited(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		global.player_in_range = false
		label.visible = false
