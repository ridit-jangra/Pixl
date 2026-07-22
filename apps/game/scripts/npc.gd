extends CharacterBody2D

const MONOCRAFT := preload("res://assets/fonts/Monocraft.ttf")

@export var npc_name: String = "Villager"
@export_multiline var dialogue: String = "Hello there!"
@export var skin: String = "cvc:1"
@export var custom_hair: String = ""
@export var custom_sheet: String = ""
@export var opens_projects: bool = false
@export var opens_explore: bool = false
@export var quest_project: bool = false
@export_multiline var quest_offer: String = ""
@export_multiline var quest_done: String = ""
@export var wanders: bool = true
@export var speed: float = 50.0
@export var wander_radius: float = 56.0
@export var min_wait: float = 1.2
@export var max_wait: float = 4.5
@export var route_path: NodePath

var _in_range := false
var _prompt: Label
var _quest_pending := false
var _base_frames: SpriteFrames
var _home: Vector2
var _target: Vector2
var _state: String = "idle"
var _dir: String = "bottom"
var _walk_timeout: float = 0.0
var _route: Path2D
var _route_offset: float = 0.0
var _stuck_time: float = 0.0
var _last_pos: Vector2

func _ready() -> void:
	_base_frames = $AnimatedSprite2D.sprite_frames
	set_skin(skin)
	_home = position
	_target = position
	_route = get_node_or_null(route_path) as Path2D
	if _route and (_route.curve == null or _route.curve.point_count < 2):
		_route = null
	if _route:
		_route_offset = _route.curve.get_closest_offset(_route.to_local(global_position))
	_play_anim(false)
	var nl: Label = $NameLabel
	nl.text = npc_name
	nl.add_theme_font_override("font", MONOCRAFT)
	nl.add_theme_font_size_override("font_size", 24)
	nl.add_theme_color_override("font_color", Color(1, 0.819608, 0.4))
	nl.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	nl.add_theme_constant_override("outline_size", 6)
	nl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	nl.scale = Vector2.ONE / 3.5
	$InteractArea.body_entered.connect(_on_body_entered)
	$InteractArea.body_exited.connect(_on_body_exited)
	Dialogue.closed.connect(_update_prompt)
	_prompt = Label.new()
	_prompt.text = "[E] talk"
	_prompt.add_theme_font_override("font", MONOCRAFT)
	_prompt.add_theme_font_size_override("font_size", 20)
	_prompt.add_theme_color_override("font_color", Color(0.956863, 0.890196, 0.760784))
	_prompt.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	_prompt.add_theme_constant_override("outline_size", 6)
	_prompt.scale = Vector2.ONE / 3.5
	_prompt.z_index = 21
	_prompt.visible = false
	add_child(_prompt)
	await get_tree().process_frame
	nl.reset_size()
	nl.position = Vector2(-nl.size.x * nl.scale.x / 2.0, -42.0 - nl.size.y * nl.scale.y)
	if wanders:
		_wait_then_move()

func npc_id() -> String:
	return npc_name

func apply_saved_position(p: Vector2) -> void:
	var dest := p
	if _route:
		_route_offset = _route.curve.get_closest_offset(_route.to_local(p))
		dest = _route.to_global(_route.curve.sample_baked(_route_offset))
	elif _home.distance_to(p) > wander_radius:
		dest = _home + (p - _home).normalized() * wander_radius
	position = dest
	_target = dest
	_state = "idle"

func set_skin(desc: String) -> void:
	skin = desc
	var tex: Texture2D
	if custom_sheet != "":
		tex = load(custom_sheet)
	elif custom_hair != "":
		tex = SkinUtil.bake_with_hair(desc, custom_hair)
	else:
		tex = SkinUtil.resolve_sheet(desc)
	if tex == null:
		return
	var frames: SpriteFrames = _base_frames.duplicate(true)
	for anim in frames.get_animation_names():
		for i in frames.get_frame_count(anim):
			var frame_tex = frames.get_frame_texture(anim, i)
			if frame_tex is AtlasTexture:
				frame_tex.atlas = tex
	$AnimatedSprite2D.sprite_frames = frames

func _physics_process(delta: float) -> void:
	if not wanders or _state != "walk":
		return
	if _in_range and Dialogue.is_open:
		velocity = Vector2.ZERO
		_play_anim(false)
		return
	var to_target := _target - position
	_walk_timeout -= delta
	if to_target.length() < 2.0 or _walk_timeout <= 0.0:
		velocity = Vector2.ZERO
		_state = "idle"
		_play_anim(false)
		_wait_then_move()
		return
	var move := to_target.normalized()
	velocity = move * speed
	_dir = _dir_from_vec(move)
	_play_anim(true)
	move_and_slide()
	if global_position.distance_to(_last_pos) < speed * delta * 0.3:
		_stuck_time += delta
		if _stuck_time >= 0.5:
			velocity = Vector2.ZERO
			_state = "idle"
			_play_anim(false)
			_wait_then_move()
			return
	else:
		_stuck_time = 0.0
	_last_pos = global_position

func _wait_then_move() -> void:
	await get_tree().create_timer(randf_range(min_wait, max_wait)).timeout
	if not is_inside_tree():
		return
	if _route:
		var length := _route.curve.get_baked_length()
		var step := randf_range(20.0, 60.0) * (1.0 if randf() < 0.7 else -1.0)
		_route_offset = fposmod(_route_offset + step, length)
		_target = _route.to_global(_route.curve.sample_baked(_route_offset))
	else:
		var ang := randf() * TAU
		var r := wander_radius * sqrt(randf())
		_target = _home + Vector2(cos(ang), sin(ang)) * r
	_walk_timeout = position.distance_to(_target) / speed + 1.5
	_stuck_time = 0.0
	_last_pos = global_position
	_state = "walk"

func _dir_from_vec(v: Vector2) -> String:
	if absf(v.x) > absf(v.y):
		return "right" if v.x > 0.0 else "left"
	return "bottom" if v.y > 0.0 else "top"

func _play_anim(moving: bool) -> void:
	var anim := $AnimatedSprite2D
	match _dir:
		"right":
			anim.flip_h = false
			anim.play("side_walk" if moving else "side_idle")
		"left":
			anim.flip_h = true
			anim.play("side_walk" if moving else "side_idle")
		"top":
			anim.play("back_walk" if moving else "back_idle")
		_:
			anim.play("front_walk" if moving else "front_idle")

func _on_body_entered(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_in_range = true
		_update_prompt()

func _on_body_exited(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_in_range = false
		_update_prompt()

func _update_prompt() -> void:
	if _prompt == null:
		return
	var show := _in_range and not Dialogue.is_open
	if show == _prompt.visible:
		return
	_prompt.visible = show
	if show:
		var ms := _prompt.get_minimum_size()
		_prompt.size = ms
		var target_scale := Vector2.ONE / 3.5
		_prompt.pivot_offset = ms / 2.0
		_prompt.position = Vector2(-ms.x / 2.0, -41.0 - ms.y * 0.5 * (1.0 - target_scale.y))
		_prompt.scale = target_scale * 0.6
		var tw := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		tw.tween_property(_prompt, "scale", target_scale, 0.2)

func _unhandled_input(event: InputEvent) -> void:
	if not _in_range or Dialogue.is_open or global.ui_blocked():
		return
	if event.is_action_pressed("interact"):
		get_viewport().set_input_as_handled()
		if opens_projects:
			WebPages.open("projects")
		elif opens_explore:
			WebPages.open("explore")
		elif quest_project:
			_start_project_quest()
		else:
			Dialogue.open(npc_name, dialogue.split("\n"))
		_update_prompt()

func _start_project_quest() -> void:
	if _quest_pending:
		return
	_quest_pending = true
	var req := HTTPRequest.new()
	add_child(req)
	var url := NetworkManager.SERVER_HTTP_URL + "/api/projects?token=" + NetworkManager.session_token.uri_encode()
	req.request_completed.connect(func(_result, code, _headers, data):
		_quest_pending = false
		req.queue_free()
		if not _in_range:
			return
		var json = null
		if data.size() > 0:
			json = JSON.parse_string(data.get_string_from_utf8())
		var projects: Array = []
		if code == 200 and typeof(json) == TYPE_DICTIONARY and json.get("ok", false):
			projects = json.get("projects", [])
		if projects.is_empty():
			Dialogue.open(npc_name, quest_offer.split("\n"))
			Dialogue.closed.connect(func(): WebPages.open("projects"), CONNECT_ONE_SHOT)
		else:
			Dialogue.open(npc_name, quest_done.split("\n"))
		_update_prompt()
	)
	if req.request(url) != OK:
		_quest_pending = false
		req.queue_free()
		Dialogue.open(npc_name, dialogue.split("\n"))
