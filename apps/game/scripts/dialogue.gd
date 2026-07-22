extends CanvasLayer

signal closed

const THEME := preload("res://themes/main_theme.tres")

var is_open := false
var _wrap: Control
var _speaker: Label
var _body: Label
var _hint: Label
var _lines: PackedStringArray = PackedStringArray()
var _index := 0

func _ready() -> void:
	layer = 110
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_ui()

func _build_ui() -> void:
	_wrap = Control.new()
	_wrap.set_anchors_preset(Control.PRESET_FULL_RECT)
	_wrap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_wrap.theme = THEME
	_wrap.visible = false
	add_child(_wrap)

	var panel := PanelContainer.new()
	panel.anchor_left = 0.5
	panel.anchor_right = 0.5
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = -330
	panel.offset_right = 330
	panel.offset_top = -160
	panel.offset_bottom = -28
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical = Control.GROW_DIRECTION_BEGIN
	_wrap.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 22)
	margin.add_theme_constant_override("margin_right", 22)
	margin.add_theme_constant_override("margin_top", 16)
	margin.add_theme_constant_override("margin_bottom", 14)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8)
	margin.add_child(vbox)

	_speaker = Label.new()
	_speaker.theme_type_variation = &"TitleText"
	_speaker.add_theme_font_size_override("font_size", 18)
	vbox.add_child(_speaker)

	_body = Label.new()
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(_body)

	_hint = Label.new()
	_hint.theme_type_variation = &"InfoText"
	_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	vbox.add_child(_hint)

func open(speaker: String, lines) -> void:
	var arr := PackedStringArray()
	for l in lines:
		var s := String(l).strip_edges()
		if s != "":
			arr.append(s)
	if arr.is_empty():
		return
	_lines = arr
	_index = 0
	is_open = true
	_speaker.text = speaker
	_body.text = _lines[0]
	_hint.text = "[E] next" if _lines.size() > 1 else "[E] close"
	_wrap.visible = true

func advance() -> void:
	_index += 1
	if _index >= _lines.size():
		close()
		return
	_body.text = _lines[_index]
	_hint.text = "[E] close" if _index == _lines.size() - 1 else "[E] next"

func close() -> void:
	is_open = false
	_wrap.visible = false
	closed.emit()

func _unhandled_input(event: InputEvent) -> void:
	if not is_open:
		return
	if event.is_action_pressed("interact"):
		get_viewport().set_input_as_handled()
		advance()
