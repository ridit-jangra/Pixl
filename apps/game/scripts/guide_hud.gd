extends CanvasLayer

const THEME := preload("res://themes/main_theme.tres")
const GAMEPLAY_SCENES := ["village", "open_world", "house_interior", "shop_interior"]
const SEEN_PATH := "user://guide_seen.dat"
const ACCENT_GOLD := Color(0.85098, 0.643137, 0.25098)
const COLOR_ACCENT := Color(1, 0.819608, 0.4)
const COLOR_DIM := Color(0.788235, 0.694118, 0.54902)

var _root: Control
var _plate_label: Label
var _page_holder: Control
var _pages: Array[Control] = []
var _dots: Array[ColorRect] = []
var _back_button: Button
var _next_button: Button
var _page := 0
var _open := false

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
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
	if event.keycode == KEY_F1:
		if ChatHud.is_typing() or Dialogue.is_open or (not _open and global.ui_blocked()):
			return
		_toggle()
		get_viewport().set_input_as_handled()
	elif _open and event.keycode == KEY_ESCAPE:
		close()
		get_viewport().set_input_as_handled()
	elif _open and (event.keycode == KEY_RIGHT or event.keycode == KEY_D):
		_step(1)
		get_viewport().set_input_as_handled()
	elif _open and (event.keycode == KEY_LEFT or event.keycode == KEY_A):
		_step(-1)
		get_viewport().set_input_as_handled()

func maybe_show_intro() -> void:
	if FileAccess.file_exists(SEEN_PATH):
		return
	var f := FileAccess.open(SEEN_PATH, FileAccess.WRITE)
	if f:
		f.store_string("1")
		f.close()
	open()

func _toggle() -> void:
	if _open:
		close()
		return
	var current := get_tree().current_scene
	if current and GAMEPLAY_SCENES.has(current.scene_file_path.get_file().get_basename()):
		open()

func is_open() -> bool:
	return _open

func open() -> void:
	if _open:
		return
	_open = true
	global.push_ui_blocker()
	_root.visible = true
	_show_page(0)

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
	backdrop.color = Color(0.039216, 0.023529, 0.007843, 0.78)
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
	_plate_label = Label.new()
	_plate_label.theme_type_variation = &"TitlePlateText"
	_plate_label.text = "WELCOME TO PIXL"
	plate.add_child(_plate_label)
	wrap.add_child(plate)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(640, 400)
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
	margin.add_theme_constant_override("margin_bottom", 22)
	panel.add_child(margin)

	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 10)
	margin.add_child(body)

	_page_holder = Control.new()
	_page_holder.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_child(_page_holder)

	_build_pages()

	var footer := HBoxContainer.new()
	footer.add_theme_constant_override("separation", 12)
	body.add_child(footer)

	_back_button = Button.new()
	_back_button.theme_type_variation = &"GreyButton"
	_back_button.text = "Back"
	_back_button.custom_minimum_size = Vector2(130, 0)
	_back_button.pressed.connect(_step.bind(-1))
	footer.add_child(_back_button)

	var dots_row := HBoxContainer.new()
	dots_row.add_theme_constant_override("separation", 8)
	dots_row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dots_row.alignment = BoxContainer.ALIGNMENT_CENTER
	footer.add_child(dots_row)
	for i in _pages.size():
		var d := ColorRect.new()
		d.custom_minimum_size = Vector2(10, 10)
		d.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		dots_row.add_child(d)
		_dots.append(d)

	_next_button = Button.new()
	_next_button.text = "Next"
	_next_button.custom_minimum_size = Vector2(130, 0)
	_next_button.pressed.connect(_step.bind(1))
	footer.add_child(_next_button)

func _step(dir: int) -> void:
	if dir > 0 and _page == _pages.size() - 1:
		close()
		return
	_show_page(clampi(_page + dir, 0, _pages.size() - 1))

func _show_page(n: int) -> void:
	_page = n
	for i in _pages.size():
		_pages[i].visible = i == n
	for i in _dots.size():
		_dots[i].color = COLOR_ACCENT if i == n else Color(COLOR_DIM, 0.35)
	var titles := ["WELCOME TO PIXL", "GETTING AROUND", "HANG OUT", "SIDEQUESTS", "HANDY KEYS"]
	_plate_label.text = titles[n]
	_back_button.visible = n > 0
	_next_button.text = "Let's go!" if n == _pages.size() - 1 else "Next"
	_next_button.grab_focus()

	var page := _pages[n]
	page.pivot_offset = page.size / 2.0
	page.scale = Vector2(0.94, 0.94)
	page.modulate.a = 0.0
	var tw := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(page, "scale", Vector2.ONE, 0.18)
	tw.parallel().tween_property(page, "modulate:a", 1.0, 0.12)

func _build_pages() -> void:
	_pages.append(_page_body([
		_para("Pixl is a tiny multiplayer world where you build real projects to level up and unlock real-world rewards."),
		_para("Walk around the village, meet other hack clubbers, and turn the hours you spend coding into pixels."),
		_spacer(),
		_hint("Use Next (or the arrow keys) to flip through this guide. Press F1 any time to open it again.")
	]))
	_pages.append(_page_body([
		_row("WASD / Arrows", "Move around"),
		_row("Shift", "Hold to run"),
		_row("E", "Talk to villagers, pet animals, enter houses"),
		_spacer(),
		_hint("Look for the little [E] prompt above villagers and doors.")
	]))
	_pages.append(_page_body([
		_row("Enter", "Chat with everyone in your world"),
		_row("T  /  1-5", "Open reactions, or fire a quick one"),
		_row("Tab", "See who's online"),
		_spacer(),
		_hint("Lobbies from the main menu get you a private world with its own code.")
	]))
	_pages.append(_page_body([
		_para("Ship projects, earn pixels. Press H to open your Projects page in a browser tab — create a project, link your Hackatime, journal as you build, then Ship it for review."),
		_para("Approved hours pay out in pixels at $4-6/hr — a flat $4/hr base plus a bonus that climbs as you level up (1 hour approved = 1 XP = 1 level, up to level 100; level shows in the top-left)."),
		_spacer(),
		_row("H  /  Pip", "Open Projects (new tab)"),
		_spacer(),
		_hint("Reviewers check your repo, demo and journal — real work only, AI use must be declared.")
	]))
	_pages.append(_page_body([
		_para("Spend pixels in the Shop — stickers, licenses, plushies, hardware, all real. It opens in a new browser tab."),
		_row("B", "Open the shop (or walk into the shop house)"),
		_spacer(),
		_para("Sidequests are themed challenges from NPCs with special rewards on top."),
		_row("J", "Quest log — see every sidequest and who unlocks it"),
	]))
	_pages.append(_page_body([
		_para("Explore what everyone's making — player cards, projects and the leaderboard."),
		_row("E", "Explore (players / projects / leaderboard)"),
		_spacer(),
		_hint("Your player card shows your level, pixels and photo — set the photo in Settings from the pause menu.")
	]))
	_pages.append(_page_body([
		_row("N", "Inbox"),
		_row("H", "Projects"),
		_row("B", "Shop"),
		_row("J", "Quest log"),
		_row("E", "Explore"),
		_row("F1", "This guide"),
		_row("Esc", "Pause / settings"),
		_spacer(),
		_para("That's everything. Go say hi!")
	]))

func _page_body(children: Array) -> Control:
	var page := VBoxContainer.new()
	page.set_anchors_preset(Control.PRESET_FULL_RECT)
	page.add_theme_constant_override("separation", 10)
	page.visible = false
	for c in children:
		page.add_child(c)
	_page_holder.add_child(page)
	return page

func _para(text: String) -> Label:
	var l := Label.new()
	l.text = text
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return l

func _hint(text: String) -> Label:
	var l := _para(text)
	l.theme_type_variation = &"InfoText"
	return l

func _spacer() -> Control:
	var s := Control.new()
	s.custom_minimum_size = Vector2(0, 4)
	return s

func _row(key: String, desc: String) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	var k := Label.new()
	k.text = key
	k.custom_minimum_size = Vector2(150, 0)
	k.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	k.add_theme_color_override("font_color", COLOR_ACCENT)
	row.add_child(k)
	var d := Label.new()
	d.text = desc
	d.theme_type_variation = &"InfoText"
	d.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	row.add_child(d)
	return row
