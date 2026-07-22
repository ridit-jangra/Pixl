extends Area2D

const MONOCRAFT := preload("res://assets/fonts/Monocraft.ttf")
const COLOR_ACCENT := Color(1, 0.819608, 0.4)

@export_enum("projects", "explore", "leaderboard", "shop") var action: String = "projects"
@export var sign_text: String = ""

var _player_in_range := false
var _prompt: Label
var _sign: Label

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_sign = _make_label(sign_text if sign_text != "" else action.to_upper(), -44.0, 20)
	_sign.visible = true
	_prompt = _make_label("[E] " + _action_verb(), -26.0, 24)
	_prompt.visible = false

func _action_verb() -> String:
	match action:
		"projects":
			return "Projects"
		"explore":
			return "Explore"
		"leaderboard":
			return "Leaderboard"
		"shop":
			return "Shop"
	return "Open"

func _make_label(text: String, y: float, size: int) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", MONOCRAFT)
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", COLOR_ACCENT)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", 6)
	l.scale = Vector2.ONE / 3.5
	add_child(l)
	l.reset_size()
	l.position = Vector2(-l.size.x * l.scale.x / 2.0, y)
	return l

func _on_body_entered(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_player_in_range = true
		_prompt.visible = true

func _on_body_exited(body: Node2D) -> void:
	if body.has_method("player") and body.is_local:
		_player_in_range = false
		_prompt.visible = false

func _process(_delta: float) -> void:
	if not _player_in_range or not Input.is_action_just_pressed("interact"):
		return
	if global.ui_blocked() or ChatHud.is_typing() or Dialogue.is_open:
		return
	match action:
		"projects":
			WebPages.open("projects")
		"explore":
			WebPages.open("explore")
		"leaderboard":
			WebPages.open("explore#leaderboard")
		"shop":
			WebPages.open("shop")
