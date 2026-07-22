extends CanvasLayer

const THEME := preload("res://themes/main_theme.tres")
const ACCENT_GOLD := Color(0.85098, 0.643137, 0.25098)
const COLOR_ONLINE := Color(0.290196, 0.870588, 0.501961)

var _root: Control
var _portrait: TextureRect
var _name_label: Label
var _info_label: Label
var _action_button: Button
var _block_button: Button
var _open := false
var _user_id := ""
var _friend_status := "none"

func _readable_theme() -> Theme:
	var f := SystemFont.new()
	f.font_names = PackedStringArray(["Sans-Serif", "Noto Sans", "DejaVu Sans", "Arial"])
	var t: Theme = THEME.duplicate(true)
	t.default_font = f
	t.default_font_size = Settings.fs(20)
	return t

func _ready() -> void:
	layer = 105
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_ui()
	_root.visible = false

func _unhandled_input(event: InputEvent) -> void:
	if _open and event.is_action_pressed("ui_cancel"):
		close()
		get_viewport().set_input_as_handled()

func is_open() -> bool:
	return _open

func open(user_id: String) -> void:
	if _open or user_id == "" or user_id == NetworkManager.user_id:
		return
	_user_id = user_id
	_open = true
	global.push_ui_blocker()
	_root.visible = true
	_portrait.texture = null
	_name_label.text = "Loading"
	_info_label.text = ""
	_action_button.visible = false
	_block_button.visible = false
	_api(HTTPClient.METHOD_GET, "/api/players/profile", {"userId": user_id}, _on_profile)

func close() -> void:
	if not _open:
		return
	_open = false
	global.pop_ui_blocker()
	_root.visible = false

func _build_ui() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.theme = _readable_theme()
	Settings.font_scale_changed.connect(func(): _root.theme = _readable_theme())
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
	plate_label.text = "PLAYER"
	plate.add_child(plate_label)
	wrap.add_child(plate)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(400, 0)
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

	_portrait = TextureRect.new()
	_portrait.custom_minimum_size = Vector2(96, 96)
	_portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_portrait.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	body.add_child(_portrait)

	_name_label = Label.new()
	_name_label.theme_type_variation = &"TitleText"
	_name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(_name_label)

	_info_label = Label.new()
	_info_label.theme_type_variation = &"InfoText"
	_info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_info_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_child(_info_label)

	_action_button = Button.new()
	_action_button.pressed.connect(_on_action)
	body.add_child(_action_button)

	_block_button = Button.new()
	_block_button.theme_type_variation = &"GreyButton"
	_block_button.visible = false
	_block_button.pressed.connect(_on_block)
	body.add_child(_block_button)
	if not NetworkManager.blocks_updated.is_connected(_refresh_block_button):
		NetworkManager.blocks_updated.connect(_refresh_block_button)

	var close_button := Button.new()
	close_button.theme_type_variation = &"GreyButton"
	close_button.text = "Close"
	close_button.pressed.connect(close)
	body.add_child(close_button)

func _on_profile(code: int, json: Variant) -> void:
	if not _open:
		return
	if code != 200 or typeof(json) != TYPE_DICTIONARY or not json.get("ok", false):
		_name_label.text = "Couldn't load profile."
		return
	_name_label.text = String(json.get("name", "Player"))
	_portrait.texture = SkinUtil.portrait(String(json.get("skin", "cvc:1")))
	var joined := String(json.get("createdAt", ""))
	if joined.length() >= 10:
		joined = joined.substr(0, 10)
	var online := "online" if bool(json.get("online", false)) else "offline"
	_info_label.text = "Joined %s  •  %d project(s)  •  %s" % [joined, int(json.get("projects", 0)), online]
	_friend_status = String(json.get("friendStatus", "none"))
	_action_button.visible = true
	match _friend_status:
		"none":
			_action_button.text = "Add Friend"
			_action_button.disabled = false
		"outgoing":
			_action_button.text = "Request Sent"
			_action_button.disabled = true
		"incoming":
			_action_button.text = "Accept Friend Request"
			_action_button.disabled = false
		"friends":
			_action_button.text = "Remove Friend"
			_action_button.disabled = false
		_:
			_action_button.visible = false
	_refresh_block_button()

func _refresh_block_button(_ids: Array = []) -> void:
	if not _open or _user_id == "":
		return
	_block_button.visible = true
	_block_button.text = "Unblock" if NetworkManager.is_blocked(_user_id) else "Block"

func _on_block() -> void:
	if NetworkManager.is_blocked(_user_id):
		NetworkManager.send_unblock(_user_id)
	else:
		NetworkManager.send_block(_user_id)

func _on_action() -> void:
	var path := ""
	match _friend_status:
		"none":
			path = "/api/friends/request"
		"incoming":
			path = "/api/friends/accept"
		"friends":
			path = "/api/friends/remove"
		_:
			return
	_action_button.disabled = true
	_api(HTTPClient.METHOD_POST, path, {"userId": _user_id}, func(_code, _json):
		if _open:
			_api(HTTPClient.METHOD_GET, "/api/players/profile", {"userId": _user_id}, _on_profile)
	)

func _api(method: int, path: String, params: Dictionary, cb: Callable) -> void:
	var req := HTTPRequest.new()
	add_child(req)
	var url := NetworkManager.SERVER_HTTP_URL + path + "?token=" + NetworkManager.session_token.uri_encode()
	var body := ""
	if method == HTTPClient.METHOD_GET:
		for k in params:
			url += "&%s=%s" % [k, String(params[k]).uri_encode()]
	else:
		body = JSON.stringify(params)
	req.request_completed.connect(func(_result, code, _headers, data):
		var json = null
		if data.size() > 0:
			json = JSON.parse_string(data.get_string_from_utf8())
		cb.call(code, json)
		req.queue_free()
	)
	req.request(url, PackedStringArray(["Content-Type: application/json"]), method, body)
