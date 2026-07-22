extends Node2D

const PLAYER_SCENE := preload("res://scenes/player.tscn")

const DAY_NIGHT_SCENES := ["village", "open_world"]
const COLOR_NIGHT := Color(0.62, 0.66, 0.9)
const COLOR_DAY := Color(1, 1, 1)
const COLOR_DUSK := Color(1.0, 0.87, 0.74)

var remote_players: Dictionary = {}
var _local_player = null
var _day_night: CanvasModulate

func _ready() -> void:
	global.player_in_range = false
	_setup_day_night()
	setup_multiplayer()

func _setup_day_night() -> void:
	if not DAY_NIGHT_SCENES.has(_network_scene_name()):
		return
	_day_night = CanvasModulate.new()
	add_child(_day_night)
	_apply_day_night()
	var timer := Timer.new()
	timer.wait_time = 5.0
	timer.autostart = true
	timer.timeout.connect(_apply_day_night)
	add_child(timer)

func _apply_day_night() -> void:
	var td := Time.get_time_dict_from_system()
	var h := float(td.hour) + float(td.minute) / 60.0 + float(td.second) / 3600.0
	_day_night.color = _day_night_color(h)

func _day_night_color(h: float) -> Color:
	if h < 5.0 or h >= 21.0:
		return COLOR_NIGHT
	if h < 7.0:
		return COLOR_NIGHT.lerp(COLOR_DAY, (h - 5.0) / 2.0)
	if h < 17.0:
		return COLOR_DAY
	if h < 19.0:
		return COLOR_DAY.lerp(COLOR_DUSK, (h - 17.0) / 2.0)
	return COLOR_DUSK.lerp(COLOR_NIGHT, (h - 19.0) / 2.0)

func _network_scene_name() -> String:
	return scene_file_path.get_file().get_basename()

func setup_multiplayer() -> void:
	if not NetworkManager.is_connected_to_server():
		_spawn_local(_default_spawn())
		return
	NetworkManager.scene_init.connect(_on_scene_init)
	NetworkManager.player_joined.connect(_on_player_joined)
	NetworkManager.player_moved.connect(_on_player_moved)
	NetworkManager.player_left.connect(_on_player_left)
	NetworkManager.player_skin_changed.connect(_on_player_skin_changed)
	NetworkManager.chat_message.connect(_on_chat)
	NetworkManager.emote_received.connect(_on_emote)
	NetworkManager.send_scene_change(_network_scene_name())
	await get_tree().create_timer(5.0).timeout
	if not is_instance_valid(_local_player):
		_spawn_local(_default_spawn())

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if ChatHud.is_typing() or Dialogue.is_open or global.ui_blocked():
		return
	var mp := get_global_mouse_position()
	var best_id := ""
	var best_d := 22.0
	for uid in remote_players:
		var rp = remote_players[uid]
		if not is_instance_valid(rp):
			continue
		var d: float = rp.global_position.distance_to(mp)
		if d < best_d:
			best_d = d
			best_id = uid
	if best_id != "":
		ProfileHud.open(best_id)
		get_viewport().set_input_as_handled()

func _default_spawn() -> Vector2:
	var marker = get_node_or_null(global.spawn_point)
	if marker == null:
		marker = get_node_or_null("PlayerSpawn")
	return marker.global_position if marker else Vector2.ZERO

func _spawn_local(pos: Vector2) -> void:
	if is_instance_valid(_local_player):
		_local_player.global_position = pos
		Loader.hide_loading()
		return
	var p = PLAYER_SCENE.instantiate()
	p.z_index = 10
	p.is_local = true
	p.global_position = pos
	add_child(p)
	_local_player = p
	Loader.hide_loading()

func _on_scene_init(your_id: String, your_pos: Vector2, others: Array, spawn_at_default: bool) -> void:
	if spawn_at_default:
		your_pos = _default_spawn()
	_spawn_local(your_pos)
	var seen := {}
	for p in others:
		var uid := String(p["userId"])
		if uid == your_id:
			continue
		seen[uid] = true
		_spawn_remote(uid, String(p["displayName"]), Vector2(p["posX"], p["posY"]), String(p.get("skin", "cvc:1")))
	for uid in remote_players.keys():
		if not seen.has(uid):
			_despawn_remote(uid)

func _on_player_joined(user_id: String, name: String, pos: Vector2, _direction: String, skin: String) -> void:
	if user_id == NetworkManager.user_id:
		return
	_spawn_remote(user_id, name, pos, skin)

func _on_player_moved(user_id: String, pos: Vector2, direction: String) -> void:
	if remote_players.has(user_id):
		remote_players[user_id].remote_update(pos, direction)

func _on_player_left(user_id: String) -> void:
	_despawn_remote(user_id)

func _on_player_skin_changed(user_id: String, skin: String) -> void:
	if user_id == NetworkManager.user_id:
		if is_instance_valid(_local_player):
			_local_player.set_skin(skin)
	elif remote_players.has(user_id):
		remote_players[user_id].set_skin(skin)

func _spawn_remote(user_id: String, name: String, pos: Vector2, skin: String = "cvc:1") -> void:
	if remote_players.has(user_id):
		remote_players[user_id].remote_update(pos, remote_players[user_id].current_dir)
		return
	var node = PLAYER_SCENE.instantiate()
	node.z_index = 10
	node.is_local = false
	node.player_name = name
	node.skin = skin
	node.global_position = pos
	add_child(node)
	remote_players[user_id] = node

func _on_chat(user_id: String, _display_name: String, text: String) -> void:
	var node = _local_player if user_id == NetworkManager.user_id else remote_players.get(user_id)
	if is_instance_valid(node):
		node.show_chat_bubble(text)

func _on_emote(user_id: String, key: String) -> void:
	var node = _local_player if user_id == NetworkManager.user_id else remote_players.get(user_id)
	if is_instance_valid(node):
		node.show_emote(key)

func _despawn_remote(user_id: String) -> void:
	if remote_players.has(user_id):
		remote_players[user_id].queue_free()
		remote_players.erase(user_id)
