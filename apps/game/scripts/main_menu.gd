extends Control

@onready var status_label: Label = $CenterContainer/VBoxContainer/StatusLabel
@onready var play_button: Button = $CenterContainer/VBoxContainer/PlayButton
@onready var lobbies_button: Button = $CenterContainer/VBoxContainer/LobbiesButton
@onready var friends_button: Button = $CenterContainer/VBoxContainer/FriendsButton
@onready var inbox_button: Button = $CenterContainer/VBoxContainer/InboxButton
@onready var character_button: Button = $CenterContainer/VBoxContainer/CharacterButton
@onready var settings_button: Button = $CenterContainer/VBoxContainer/SettingsButton
@onready var logout_button: Button = $CenterContainer/VBoxContainer/LogoutButton

const ACCENT_GOLD := Color(0.85098, 0.643137, 0.25098)

var _logout_armed := false
var _logout_revert: Timer
var _name_root: Control
var _name_edit: LineEdit
var _name_warn: Label
var _name_save: Button

func _ready() -> void:
	if NetworkManager.session_token == "":
		get_tree().change_scene_to_file("res://scenes/login.tscn")
		return

	status_label.text = "Signed in as " + NetworkManager.display_name

	play_button.pressed.connect(_on_play_pressed)
	lobbies_button.pressed.connect(_on_lobbies_pressed)
	friends_button.pressed.connect(_on_friends_pressed)
	inbox_button.pressed.connect(_on_inbox_pressed)
	_update_inbox_button(InboxHud.unread_count)
	InboxHud.unread_changed.connect(_update_inbox_button)
	character_button.pressed.connect(_on_character_pressed)
	settings_button.pressed.connect(_on_settings_pressed)
	logout_button.pressed.connect(_on_logout_pressed)

	_logout_revert = Timer.new()
	_logout_revert.one_shot = true
	_logout_revert.wait_time = 3.0
	_logout_revert.timeout.connect(_disarm_logout)
	add_child(_logout_revert)

	play_button.grab_focus()

	NetworkManager.disconnected_from_server.connect(_on_disconnected)
	NetworkManager.name_result.connect(_on_name_result)
	if NetworkManager.is_new_account:
		_show_name_prompt()

func _on_play_pressed() -> void:
	Loader.change_scene("res://scenes/village.tscn", "Entering village")

func _on_lobbies_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/lobby_menu.tscn")

func _on_friends_pressed() -> void:
	FriendsHud.open()

func _on_inbox_pressed() -> void:
	InboxHud.open()

func _update_inbox_button(unread: int) -> void:
	inbox_button.text = "Inbox (%d)" % unread if unread > 0 else "Inbox"

func _on_character_pressed() -> void:
	global.editor_return_scene = "res://scenes/main_menu.tscn"
	get_tree().change_scene_to_file("res://scenes/character_editor.tscn")

func _on_settings_pressed() -> void:
	PauseMenu.open_settings()

func _on_logout_pressed() -> void:
	if not _logout_armed:
		_logout_armed = true
		logout_button.text = "Confirm logout?"
		_logout_revert.start()
		return
	_logout_revert.stop()
	NetworkManager.logout()
	get_tree().change_scene_to_file("res://scenes/login.tscn")

func _disarm_logout() -> void:
	_logout_armed = false
	logout_button.text = "Logout"

func _show_name_prompt() -> void:
	_name_root = Control.new()
	_name_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(_name_root)

	var dim := ColorRect.new()
	dim.color = Color(0.039216, 0.023529, 0.007843, 0.85)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	_name_root.add_child(dim)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	_name_root.add_child(center)

	var wrap := VBoxContainer.new()
	wrap.add_theme_constant_override("separation", -22)
	center.add_child(wrap)

	var plate := PanelContainer.new()
	plate.theme_type_variation = &"TitlePlate"
	plate.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	plate.z_index = 1
	var plate_label := Label.new()
	plate_label.theme_type_variation = &"TitlePlateText"
	plate_label.text = "PICK A NAME"
	plate.add_child(plate_label)
	wrap.add_child(plate)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(460, 0)
	wrap.add_child(panel)

	var accents := Control.new()
	accents.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(accents)
	for i in 4:
		var dot := ColorRect.new()
		dot.color = ACCENT_GOLD
		dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var right := i % 2 == 1
		var bottom := i >= 2
		dot.anchor_left = 1.0 if right else 0.0
		dot.anchor_right = dot.anchor_left
		dot.anchor_top = 1.0 if bottom else 0.0
		dot.anchor_bottom = dot.anchor_top
		dot.offset_left = -17.0 if right else 9.0
		dot.offset_right = dot.offset_left + 8.0
		dot.offset_top = -17.0 if bottom else 9.0
		dot.offset_bottom = dot.offset_top + 8.0
		accents.add_child(dot)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 30)
	margin.add_theme_constant_override("margin_top", 34)
	margin.add_theme_constant_override("margin_right", 30)
	margin.add_theme_constant_override("margin_bottom", 24)
	panel.add_child(margin)

	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 10)
	margin.add_child(body)

	var info := Label.new()
	info.text = "Welcome to Pixl! What should other villagers call you?"
	info.theme_type_variation = &"InfoText"
	info.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_child(info)

	_name_edit = LineEdit.new()
	_name_edit.text = NetworkManager.display_name
	_name_edit.placeholder_text = "Your display name"
	_name_edit.max_length = 24
	_name_edit.text_submitted.connect(func(_t): _submit_name())
	body.add_child(_name_edit)

	_name_warn = Label.new()
	_name_warn.add_theme_color_override("font_color", Color(1, 0.419608, 0.419608))
	_name_warn.add_theme_font_size_override("font_size", 13)
	_name_warn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_name_warn.visible = false
	body.add_child(_name_warn)

	var buttons := HBoxContainer.new()
	buttons.add_theme_constant_override("separation", 12)
	body.add_child(buttons)

	var keep := Button.new()
	keep.theme_type_variation = &"GreyButton"
	keep.text = "Keep current"
	keep.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	keep.pressed.connect(_close_name_prompt)
	buttons.add_child(keep)

	_name_save = Button.new()
	_name_save.text = "Save"
	_name_save.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_name_save.pressed.connect(_submit_name)
	buttons.add_child(_name_save)

	_name_edit.grab_focus()
	_name_edit.select_all()

func _submit_name() -> void:
	var name := _name_edit.text.strip_edges()
	if name == "" or name == NetworkManager.display_name:
		_close_name_prompt()
		return
	_name_save.disabled = true
	_name_save.text = "Saving…"
	NetworkManager.submit_display_name(name)

func _on_name_result(ok: bool, text: String) -> void:
	if _name_root == null:
		return
	if ok:
		status_label.text = "Signed in as " + text
		_close_name_prompt()
		return
	_name_save.disabled = false
	_name_save.text = "Save"
	_name_warn.text = text
	_name_warn.visible = true
	_name_edit.grab_focus()

func _close_name_prompt() -> void:
	NetworkManager.is_new_account = false
	if _name_root:
		_name_root.queue_free()
		_name_root = null
	play_button.grab_focus()

func _on_disconnected() -> void:
	if NetworkManager.session_token == "":
		get_tree().change_scene_to_file("res://scenes/login.tscn")
