extends CharacterBody2D
var speed = 150
var current_dir = "none"
var is_on_stairs = false
@export var is_local: bool = true
## Display name for a remote player; set by the spawner before add_child().
var player_name: String = ""

var skin: String = "cvc:1"

var _last_sent_pos: Vector2 = Vector2.INF
var _last_sent_dir: String = ""

var _target_pos: Vector2 = Vector2.INF

var _prev_pos: Vector2 = Vector2.INF

var _base_frames: SpriteFrames

const BUBBLE_FONT := preload("res://assets/fonts/Monocraft.ttf")
const BUBBLE_MAX_WIDTH := 300.0
var _bubble: RichTextLabel
var _bubble_token: int = 0
var _bubble_img_regex := RegEx.create_from_string("\\[img\\b[^\\]]*\\][\\s\\S]*?\\[/img\\]")
var _bubble_tag_regex := RegEx.create_from_string("\\[/?[a-zA-Z][^\\]]*\\]")

func _ready() -> void:
	_base_frames = $AnimatedSprite2D.sprite_frames
	if is_local:
		$NameLabel.text = "You"
		skin = NetworkManager.local_skin
		_apply_zoom()
		Settings.zoom_changed.connect(_apply_zoom)
	else:
		$NameLabel.text = player_name
		$CollisionShape2D.disabled = true
	set_skin(skin)
	$AnimatedSprite2D.play("front_idle")
	_layout_name_label()

func _unhandled_input(event: InputEvent) -> void:
	if not is_local:
		return
	if event is InputEventMouseButton and event.pressed and event.ctrl_pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			Settings.set_zoom_level(Settings.zoom_level + 0.05)
			get_viewport().set_input_as_handled()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			Settings.set_zoom_level(Settings.zoom_level - 0.05)
			get_viewport().set_input_as_handled()

func _apply_zoom() -> void:
	if not has_node("Camera2d"):
		return
	$Camera2d.zoom = Vector2.ONE * 4.0 * Settings.zoom_level
	_layout_name_label()
	if _bubble != null:
		_bubble.scale = Vector2.ONE / _bubble_zoom()

func _layout_name_label() -> void:
	var nl: Label = $NameLabel
	nl.scale = Vector2.ONE / _bubble_zoom()
	nl.add_theme_font_size_override("font_size", 24)
	nl.set_anchors_preset(Control.PRESET_TOP_LEFT)
	nl.custom_minimum_size = Vector2.ZERO
	await get_tree().process_frame
	nl.reset_size()
	nl.position = Vector2(-nl.size.x * nl.scale.x / 2.0, -36.0 - nl.size.y * nl.scale.y)

func set_skin(desc: String) -> void:
	skin = desc
	var tex := SkinUtil.resolve_sheet(desc)
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
	if is_local:
		player_movement(delta)
	else:
		remote_movement(delta)

func player_movement(delta: float)-> void:
	if ChatHud.is_typing() or global.ui_blocked():
		velocity = Vector2.ZERO
		move_and_slide()
		return
	var before := global_position
	if Input.is_action_pressed("run") && !is_on_stairs:
		speed = 200
	elif !is_on_stairs:
		speed = 150
	var input := Vector2(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		Input.get_action_strength("move_bottom") - Input.get_action_strength("move_top")
	)
	if input != Vector2.ZERO:
		input = input.normalized()
		if input.x > 0.0:
			current_dir = "right"
		elif input.x < 0.0:
			current_dir = "left"
		elif input.y > 0.0:
			current_dir = "bottom"
		else:
			current_dir = "top"
		play_anim(1)
		velocity = input * speed
	else:
		play_anim(0)
		velocity = Vector2.ZERO
	move_and_slide()

	var max_step: float = speed * delta * 4.0
	if _prev_pos != Vector2.INF and global_position.distance_to(before) > maxf(max_step, 16.0):
		global_position = before
		velocity = Vector2.ZERO
	_prev_pos = global_position

	if global_position.distance_squared_to(_last_sent_pos) > 1.0 or current_dir != _last_sent_dir:
		_last_sent_pos = global_position
		_last_sent_dir = current_dir
		NetworkManager.send_move(global_position, current_dir)

func play_anim(movement: int) -> void:
	var dir = current_dir
	var anim = $AnimatedSprite2D
	if dir == "right":
		anim.flip_h = false
		if movement == 1:
			anim.play("side_walk")
		elif movement == 0:
			anim.play("side_idle")
	elif dir == "left":
		anim.flip_h = true
		if movement == 1:
			anim.play("side_walk")
		elif movement == 0:
			anim.play("side_idle")
	if dir == "bottom":
		if movement == 1:
			anim.play("front_walk")
		elif movement == 0:
			anim.play("front_idle")
	elif dir == "top":
		if movement == 1:
			anim.play("back_walk")
		elif movement == 0:
			anim.play("back_idle")

func remote_update(pos: Vector2, direction: String) -> void:
	_target_pos = pos
	current_dir = direction

func remote_movement(delta: float) -> void:
	if _target_pos == Vector2.INF:
		return
	var dist := global_position.distance_to(_target_pos)
	global_position = global_position.lerp(_target_pos, clampf(delta * 12.0, 0.0, 1.0))
	if dist > 2.0:
		play_anim(1)
	else:
		play_anim(0)

func _on_stair_trigger_body_entered(body: Node2D) -> void:
	is_on_stairs = true
	speed = 60
func _on_stair_trigger_body_exited(body: Node2D) -> void:
	is_on_stairs = false
	speed = 100
func player():
	pass

func show_emote(key: String) -> void:
	var tex := EmoteHud.texture_for(key)
	if tex == null:
		return
	var s := Sprite2D.new()
	s.texture = tex
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	s.z_index = 23
	s.position = Vector2(0, -52)
	var h := float(maxi(tex.get_height(), 1))
	var target := Vector2.ONE * (16.0 / h)
	s.scale = target * 0.3
	add_child(s)
	var pop := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	pop.tween_property(s, "scale", target, 0.35)
	var tw := create_tween()
	tw.tween_property(s, "position:y", -66.0, 1.6).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(s, "modulate:a", 0.0, 1.6).from(1.0)
	tw.tween_callback(s.queue_free)

func _bubble_zoom() -> float:
	if has_node("Camera2d"):
		return maxf($Camera2d.zoom.x, 0.01)
	return 3.5

func show_chat_bubble(text: String) -> void:
	if _bubble == null:
		_bubble = RichTextLabel.new()
		_bubble.bbcode_enabled = true
		_bubble.scroll_active = false
		_bubble.fit_content = true
		_bubble.z_index = 22
		_bubble.scale = Vector2.ONE / _bubble_zoom()
		var italic_shear := Transform2D(Vector2(1.0, 0.0), Vector2(0.22, 1.0), Vector2.ZERO)
		var bold_font := FontVariation.new()
		bold_font.base_font = BUBBLE_FONT
		bold_font.variation_embolden = 1.0
		var italic_font := FontVariation.new()
		italic_font.base_font = BUBBLE_FONT
		italic_font.variation_transform = italic_shear
		var bold_italic_font := FontVariation.new()
		bold_italic_font.base_font = BUBBLE_FONT
		bold_italic_font.variation_embolden = 1.0
		bold_italic_font.variation_transform = italic_shear
		_bubble.add_theme_font_override("normal_font", BUBBLE_FONT)
		_bubble.add_theme_font_override("bold_font", bold_font)
		_bubble.add_theme_font_override("italics_font", italic_font)
		_bubble.add_theme_font_override("bold_italics_font", bold_italic_font)
		_bubble.add_theme_font_size_override("normal_font_size", 24)
		_bubble.add_theme_font_size_override("bold_font_size", 24)
		_bubble.add_theme_font_size_override("italics_font_size", 24)
		_bubble.add_theme_color_override("default_color", Color(1, 1, 1))
		var bg := StyleBoxFlat.new()
		bg.bg_color = Color(0.05, 0.04, 0.03, 0.88)
		bg.content_margin_left = 10
		bg.content_margin_right = 10
		bg.content_margin_top = 6
		bg.content_margin_bottom = 6
		bg.set_corner_radius_all(8)
		_bubble.add_theme_stylebox_override("normal", bg)
		add_child(_bubble)
	var msg := _bubble_img_regex.sub(text, "", true)
	var plain := _bubble_tag_regex.sub(msg, "", true).replace("[lb]", "[").replace("[rb]", "]")
	var natural := BUBBLE_FONT.get_string_size(plain, HORIZONTAL_ALIGNMENT_LEFT, -1, 24).x + 24.0
	if natural > BUBBLE_MAX_WIDTH:
		_bubble.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		_bubble.custom_minimum_size.x = BUBBLE_MAX_WIDTH
	else:
		_bubble.autowrap_mode = TextServer.AUTOWRAP_OFF
		_bubble.custom_minimum_size.x = 0.0
	_bubble.text = msg
	_bubble.visible = true
	_bubble_token += 1
	var token := _bubble_token
	await get_tree().process_frame
	if token == _bubble_token and is_instance_valid(_bubble):
		var s := Vector2.ONE / _bubble_zoom()
		var ms := _bubble.get_minimum_size()
		_bubble.size = ms
		_bubble.pivot_offset = Vector2(ms.x / 2.0, ms.y)
		_bubble.position = Vector2(-ms.x / 2.0, -44.0 - ms.y)
		_bubble.scale = s * 0.6
		var pop := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		pop.tween_property(_bubble, "scale", s, 0.25)
	await get_tree().create_timer(5.0).timeout
	if token == _bubble_token and is_instance_valid(_bubble):
		_bubble.visible = false
