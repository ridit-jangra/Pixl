extends "res://scripts/multiplayer_world.gd"

const VARIANTS := [
	{"shell": Color.WHITE, "rugs": Color.WHITE, "furniture": Color.WHITE},
	{"shell": Color(0.72, 0.85, 1.05), "rugs": Color(1.05, 0.9, 0.65), "furniture": Color(1.0, 0.95, 0.85)},
	{"shell": Color(0.8, 1.02, 0.8), "rugs": Color(1.05, 0.8, 0.85), "furniture": Color(0.95, 0.9, 1.0)},
	{"shell": Color(0.9, 0.8, 1.05), "rugs": Color(0.95, 0.85, 1.05), "furniture": Color(1.0, 0.9, 0.8)},
]

var can_transition: bool = false

func _ready() -> void:
	var v: Dictionary = VARIANTS[clampi(global.house_variant, 0, VARIANTS.size() - 1)]
	$TileMapLayer.modulate = v["shell"]
	$TileMapLayer2.modulate = v["rugs"]
	$TileMapLayer4.modulate = v["furniture"]
	super._ready()
	await get_tree().create_timer(0.3).timeout
	can_transition = true

func _on_scene_init(your_id: String, _your_pos: Vector2, others: Array, _spawn_at_default: bool) -> void:
	super._on_scene_init(your_id, Vector2.ZERO, others, true)

func _process(_delta: float) -> void:
	if global.player_in_range and can_transition and not Dialogue.is_open and not global.ui_blocked() and Input.is_action_just_pressed("interact"):
		can_transition = false
		global.request_transition("village", "PlayerSpawn")
		Loader.change_scene("res://scenes/village.tscn", "Loading")
