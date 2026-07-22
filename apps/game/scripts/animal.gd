extends CharacterBody2D

const MONOCRAFT := preload("res://assets/fonts/Monocraft.ttf")

@export var speed: float = 40.0
@export var wander_radius: float = 80.0
@export var min_wait: float = 1.0
@export var max_wait: float = 3.0
@export var sit_chance: float = 0.3
@export var eat_chance: float = 0.2
@export var route_path: NodePath

var _spawn_pos: Vector2
var _target_pos: Vector2
var _state: String = "idle"
var _route: Path2D
var _route_offset: float = 0.0
var _walk_timeout: float = 0.0
var _stuck_time: float = 0.0
var _last_pos: Vector2

var _player_in_range := false
var _prompt: Label
var _prompt_y: float = -38.0

func _ready() -> void:
	_spawn_pos = global_position
	_route = get_node_or_null(route_path) as Path2D
	if _route and (_route.curve == null or _route.curve.point_count < 2):
		_route = null
	if _route:
		_route_offset = _route.curve.get_closest_offset(_route.to_local(global_position))
	_setup_pet_area()
	_setup_prompt()
	_play_idle()
	_wait_then_move()

func _process(_delta: float) -> void:
	if _prompt == null:
		return
	var show := _player_in_range and not Dialogue.is_open and not ChatHud.is_typing()
	_prompt.visible = show
	if show:
		var bob := sin(Time.get_ticks_msec() / 150.0) * 2.0
		_prompt.position = Vector2(round(-_prompt.size.x * _prompt.scale.x / 2.0), round(_prompt_y + bob))

func _physics_process(delta: float) -> void:
	if _state == "walk":
		var direction = (_target_pos - global_position)
		_walk_timeout -= delta
		if direction.length() < 2.0 or _walk_timeout <= 0.0:
			velocity = Vector2.ZERO
			_enter_rest_state()
		else:
			direction = direction.normalized()
			velocity = direction * speed
			$AnimatedSprite2D.flip_h = direction.x < 0
			$AnimatedSprite2D.play("walk")
	else:
		velocity = Vector2.ZERO
	move_and_slide()
	if _state == "walk":
		if global_position.distance_to(_last_pos) < speed * delta * 0.3:
			_stuck_time += delta
			if _stuck_time >= 0.5:
				velocity = Vector2.ZERO
				_enter_rest_state()
		else:
			_stuck_time = 0.0
		_last_pos = global_position

func _enter_rest_state() -> void:
	var roll = randf()
	if roll < sit_chance:
		_state = "sit"
		$AnimatedSprite2D.play("sit")
	elif roll < sit_chance + eat_chance:
		_state = "eat"
		$AnimatedSprite2D.play("eat")
	else:
		_state = "idle"
		_play_idle()
	_wait_then_move()

func _play_idle() -> void:
	_state = "idle"
	$AnimatedSprite2D.play("idle")

func _wait_then_move() -> void:
	var wait_time = randf_range(min_wait, max_wait)
	await get_tree().create_timer(wait_time).timeout
	_pick_new_target()

func _pick_new_target() -> void:
	if _route:
		var length := _route.curve.get_baked_length()
		var step := randf_range(20.0, 60.0) * (1.0 if randf() < 0.7 else -1.0)
		_route_offset = fposmod(_route_offset + step, length)
		_target_pos = _route.to_global(_route.curve.sample_baked(_route_offset))
	else:
		var offset = Vector2(
			randf_range(-wander_radius, wander_radius),
			randf_range(-wander_radius, wander_radius)
		)
		_target_pos = _spawn_pos + offset
	_walk_timeout = global_position.distance_to(_target_pos) / speed + 1.5
	_stuck_time = 0.0
	_last_pos = global_position
	_state = "walk"

func _setup_pet_area() -> void:
	var area := Area2D.new()
	area.collision_mask = 2
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 26.0
	shape.shape = circle
	shape.position = Vector2(0, -8)
	area.add_child(shape)
	add_child(area)
	area.body_entered.connect(_on_pet_body_entered)
	area.body_exited.connect(_on_pet_body_exited)

func _setup_prompt() -> void:
	var th := 32.0
	var fr: SpriteFrames = $AnimatedSprite2D.sprite_frames
	if fr and fr.get_animation_names().size() > 0:
		var t0: Texture2D = fr.get_frame_texture(fr.get_animation_names()[0], 0)
		if t0:
			th = float(t0.get_height())
	_prompt_y = -th - 6.0
	_prompt = Label.new()
	_prompt.z_index = 30
	_prompt.text = "[%s] Pet" % _interact_key_label()
	_prompt.add_theme_font_override("font", MONOCRAFT)
	_prompt.add_theme_font_size_override("font_size", 24)
	_prompt.add_theme_color_override("font_color", Color(1, 0.819608, 0.4))
	_prompt.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	_prompt.add_theme_constant_override("outline_size", 6)
	_prompt.scale = Vector2.ONE / 3.5
	_prompt.visible = false
	add_child(_prompt)
	_prompt.reset_size()

func _interact_key_label() -> String:
	for e in InputMap.action_get_events("interact"):
		if e is InputEventKey:
			var kc: int = e.physical_keycode if e.physical_keycode != 0 else e.keycode
			return OS.get_keycode_string(kc)
	return "E"

func _on_pet_body_entered(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_player_in_range = true

func _on_pet_body_exited(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_player_in_range = false

func _unhandled_input(event: InputEvent) -> void:
	if not _player_in_range or Dialogue.is_open or ChatHud.is_typing():
		return
	if event.is_action_pressed("interact"):
		get_viewport().set_input_as_handled()
		pet()

func pet() -> void:
	_pop_heart()

func _pop_heart() -> void:
	var tex := EmoteHud.texture_for("heart")
	if tex == null:
		return
	var s := Sprite2D.new()
	s.texture = tex
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	s.z_index = 31
	var start_y := _prompt_y + 2.0
	s.position = Vector2(0, start_y)
	var h := float(maxi(tex.get_height(), 1))
	var target_scale := Vector2.ONE * (12.0 / h)
	s.scale = target_scale * 0.6
	add_child(s)
	var tw := create_tween()
	tw.tween_property(s, "position:y", start_y - 14.0, 0.75).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(s, "modulate:a", 0.0, 0.75).from(1.0)
	tw.parallel().tween_property(s, "scale", target_scale, 0.75)
	tw.tween_callback(s.queue_free)
