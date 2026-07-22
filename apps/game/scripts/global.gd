extends Node

const PLAYER_SCENE = preload("res://scenes/player.tscn")

var current_scene: String = "village"
var transition_scene: bool = false
var spawn_point: String = "PlayerSpawn"
var player_in_range: bool = false
var active_door_pos: Vector2 = Vector2.ZERO
var active_door_target: String = "house"
var house_variant: int = 0

var editor_return_scene: String = "res://scenes/main_menu.tscn"

var ui_blockers: int = 0

func push_ui_blocker() -> void:
	ui_blockers += 1

func pop_ui_blocker() -> void:
	ui_blockers = maxi(0, ui_blockers - 1)

func ui_blocked() -> bool:
	return ui_blockers > 0

func day_phase() -> Dictionary:
	var td := Time.get_time_dict_from_system()
	var h := float(td.hour) + float(td.minute) / 60.0
	if h < 5.0 or h >= 21.0:
		return {"name": "Night", "next": "dawn 05:00", "color": Color(0.55, 0.62, 0.95)}
	if h < 7.0:
		return {"name": "Dawn", "next": "day 07:00", "color": Color(1.0, 0.65, 0.35)}
	if h < 17.0:
		return {"name": "Day", "next": "dusk 17:00", "color": Color(1, 0.819608, 0.4)}
	return {"name": "Dusk", "next": "night 21:00", "color": Color(1.0, 0.65, 0.35)}

func request_transition(target_scene: String, spawn_name: String = "PlayerSpawn") -> void:
	transition_scene = true
	current_scene = target_scene
	spawn_point = spawn_name
