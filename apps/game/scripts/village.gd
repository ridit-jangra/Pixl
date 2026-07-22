extends "res://scripts/multiplayer_world.gd"

var can_transition: bool = false
var _npcs: Array = []
var _npcs_by_id: Dictionary = {}
var _save_accum: float = 0.0

func _ready() -> void:
	super._ready()
	_spawn_npcs()
	if NetworkManager.is_connected_to_server():
		NetworkManager.npc_init.connect(_on_npc_init)
	await get_tree().create_timer(0.3).timeout
	can_transition = true
	GuideHud.maybe_show_intro()

func _exit_tree() -> void:
	_save_npcs()

func _spawn_npcs() -> void:
	for child in get_children():
		if child.has_method("npc_id"):
			_npcs.append(child)
			_npcs_by_id[child.npc_id()] = child

func _on_npc_init(scene: String, npcs: Array) -> void:
	if scene != _network_scene_name():
		return
	for saved in npcs:
		var n = _npcs_by_id.get(saved["id"])
		if n:
			n.apply_saved_position(saved["pos"])

func _save_npcs() -> void:
	if not NetworkManager.is_connected_to_server():
		return
	var payload: Array = []
	for n in _npcs:
		if is_instance_valid(n):
			payload.append({"id": n.npc_id(), "posX": n.position.x, "posY": n.position.y})
	NetworkManager.send_save_npcs(_network_scene_name(), payload)

func _process(delta: float) -> void:
	_save_accum += delta
	if _save_accum >= 5.0:
		_save_accum = 0.0
		_save_npcs()
	if global.player_in_range and can_transition and not Dialogue.is_open and not global.ui_blocked() and Input.is_action_just_pressed("interact"):
		if global.active_door_target == "shop":
			WebPages.open("shop")
			return
		can_transition = false
		_save_npcs()
		var door := Vector2i(global.active_door_pos.round())
		global.house_variant = absi(door.x * 928371 + door.y * 1237) % 4
		global.request_transition("house_interior", "PlayerSpawn")
		Loader.change_scene("res://scenes/house_interior.tscn", "Loading")
