extends CanvasLayer

signal unread_changed(count: int)

const THEME := preload("res://themes/main_theme.tres")
const GAMEPLAY_SCENES := ["village", "open_world", "house_interior", "shop_interior"]
const ACCENT_GOLD := Color(0.85098, 0.643137, 0.25098)

var unread_count := 0

var _root: Control
var _list: VBoxContainer
var _open := false
var _ui_font: SystemFont
var _load_retried := false

func _rfont() -> SystemFont:
	if _ui_font == null:
		_ui_font = SystemFont.new()
		_ui_font.font_names = PackedStringArray(["Sans-Serif", "Noto Sans", "DejaVu Sans", "Arial"])
	return _ui_font

func _readable(c: Control, size: int) -> void:
	c.add_theme_font_override("font", _rfont())
	c.add_theme_font_size_override("font_size", Settings.fs(size))

func _ready() -> void:
	layer = 104
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_ui()
	_root.visible = false
	var poll := Timer.new()
	poll.wait_time = 60.0
	poll.autostart = true
	poll.timeout.connect(_poll_unread)
	add_child(poll)
	NetworkManager.logged_in.connect(func(_n): _poll_unread())
	_poll_unread()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_N:
		if ChatHud.is_typing() or Dialogue.is_open or (not _open and global.ui_blocked()):
			return
		_toggle()
		get_viewport().set_input_as_handled()
	elif _open and event.is_action_pressed("ui_cancel"):
		close()
		get_viewport().set_input_as_handled()

func is_open() -> bool:
	return _open

func _toggle() -> void:
	if _open:
		close()
		return
	var current := get_tree().current_scene
	if current and GAMEPLAY_SCENES.has(current.scene_file_path.get_file().get_basename()):
		open()

func open() -> void:
	if _open:
		return
	_open = true
	global.push_ui_blocker()
	_root.visible = true
	refresh()

func close() -> void:
	if not _open:
		return
	_open = false
	global.pop_ui_blocker()
	_root.visible = false

func _build_ui() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.theme = THEME
	add_child(_root)

	var backdrop := ColorRect.new()
	backdrop.color = Color(0.039216, 0.023529, 0.007843, 0.66)
	backdrop.set_anchors_preset(Control.PRESET_FULL_RECT)
	backdrop.mouse_filter = Control.MOUSE_FILTER_STOP
	_root.add_child(backdrop)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.add_child(center)

	var wrap := VBoxContainer.new()
	wrap.add_theme_constant_override("separation", -22)
	center.add_child(wrap)

	var plate := PanelContainer.new()
	plate.theme_type_variation = &"TitlePlate"
	plate.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	plate.z_index = 1
	var plate_label := Label.new()
	plate_label.theme_type_variation = &"TitlePlateText"
	plate_label.text = "INBOX"
	plate.add_child(plate_label)
	wrap.add_child(plate)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(820, 0)
	wrap.add_child(panel)

	var accents := Control.new()
	accents.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(accents)
	for i in 4:
		var corner := ColorRect.new()
		corner.color = ACCENT_GOLD
		corner.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var right := i % 2 == 1
		var bottom := i >= 2
		corner.anchor_left = 1.0 if right else 0.0
		corner.anchor_right = corner.anchor_left
		corner.anchor_top = 1.0 if bottom else 0.0
		corner.anchor_bottom = corner.anchor_top
		corner.offset_left = -17.0 if right else 9.0
		corner.offset_right = corner.offset_left + 8.0
		corner.offset_top = -17.0 if bottom else 9.0
		corner.offset_bottom = corner.offset_top + 8.0
		accents.add_child(corner)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 30)
	margin.add_theme_constant_override("margin_top", 34)
	margin.add_theme_constant_override("margin_right", 30)
	margin.add_theme_constant_override("margin_bottom", 24)
	panel.add_child(margin)

	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 10)
	margin.add_child(body)

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0, 560)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	body.add_child(scroll)
	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_list.add_theme_constant_override("separation", 6)
	scroll.add_child(_list)

	var close_button := Button.new()
	close_button.theme_type_variation = &"GreyButton"
	close_button.text = "Close"
	close_button.pressed.connect(close)
	body.add_child(close_button)

func refresh() -> void:
	_load_retried = false
	for child in _list.get_children():
		child.queue_free()
	_list.add_child(_muted("Loading your messages…"))
	_api(HTTPClient.METHOD_GET, "/api/notifications", _on_list)

func _poll_unread() -> void:
	if NetworkManager.session_token == "":
		return
	_api(HTTPClient.METHOD_GET, "/api/notifications", func(code, json):
		if code == 200 and typeof(json) == TYPE_DICTIONARY and json.get("ok", false):
			_set_unread(int(json.get("unread", 0)))
	)

func _set_unread(n: int) -> void:
	if n == unread_count:
		return
	unread_count = n
	emit_signal("unread_changed", n)

func _on_list(code: int, json: Variant) -> void:
	for child in _list.get_children():
		child.queue_free()
	if code != 200 or typeof(json) != TYPE_DICTIONARY or not json.get("ok", false):
		if not _load_retried and _open:
			_load_retried = true
			_list.add_child(_muted("Loading your messages…"))
			get_tree().create_timer(2.5).timeout.connect(func():
				if _open:
					_api(HTTPClient.METHOD_GET, "/api/notifications", _on_list))
			return
		_list.add_child(_muted("Couldn't load your inbox. Try reopening in a moment."))
		return
	var notes: Array = json.get("notifications", [])
	if notes.is_empty():
		_list.add_child(_muted("No messages yet."))
		_set_unread(0)
		return
	for n in notes:
		_list.add_child(_note_row(n))
	_api(HTTPClient.METHOD_POST, "/api/notifications/read", func(_c, _j): _set_unread(0))

func _note_row(n: Dictionary) -> Control:
	var shell := PanelContainer.new()
	shell.theme_type_variation = &"RowPanel"
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 2)
	shell.add_child(box)
	var title_row := HBoxContainer.new()
	title_row.add_theme_constant_override("separation", 8)
	box.add_child(title_row)
	if not bool(n.get("read", false)):
		var dot := ColorRect.new()
		dot.color = ACCENT_GOLD
		dot.custom_minimum_size = Vector2(8, 8)
		dot.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		title_row.add_child(dot)
	var title := Label.new()
	title.text = String(n.get("title", "Message"))
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_readable(title, 21)
	title_row.add_child(title)
	var when := Label.new()
	when.theme_type_variation = &"InfoText"
	var created := String(n.get("created_at", ""))
	when.text = created.substr(0, 10) if created.length() >= 10 else ""
	_readable(when, 16)
	title_row.add_child(when)
	var body := Label.new()
	body.text = String(n.get("body", ""))
	body.theme_type_variation = &"InfoText"
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_readable(body, 18)
	box.add_child(body)
	return shell

func _muted(text: String) -> Label:
	var l := Label.new()
	l.theme_type_variation = &"InfoText"
	l.text = text
	_readable(l, 18)
	return l

func _api(method: int, path: String, cb: Callable) -> void:
	var req := HTTPRequest.new()
	add_child(req)
	var url := NetworkManager.SERVER_HTTP_URL + path + "?token=" + NetworkManager.session_token.uri_encode()
	req.request_completed.connect(func(_result, code, _headers, data):
		var json = null
		if data.size() > 0:
			json = JSON.parse_string(data.get_string_from_utf8())
		cb.call(code, json)
		req.queue_free()
	)
	req.request(url, PackedStringArray(["Content-Type: application/json"]), method, "")
