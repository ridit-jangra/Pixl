class_name MarkdownUtil

static var _img_cache: Dictionary = {}

static func split_images(md: String) -> Dictionary:
	var re := RegEx.new()
	re.compile("!\\[[^\\]]*\\]\\((https?://[^)\\s]+)\\)")
	var images: Array = []
	for m in re.search_all(md):
		images.append(m.get_string(1))
	return {"text": re.sub(md, "", true).strip_edges(), "images": images}

static func to_bbcode(md: String) -> String:
	var lines := PackedStringArray()
	for line in md.replace("[", "[lb]").split("\n"):
		var l := String(line)
		if l.begins_with("### "):
			l = "[b]" + l.substr(4) + "[/b]"
		elif l.begins_with("## "):
			l = "[font_size=20][b]" + l.substr(3) + "[/b][/font_size]"
		elif l.begins_with("# "):
			l = "[font_size=24][b]" + l.substr(2) + "[/b][/font_size]"
		elif l.begins_with("- ") or l.begins_with("* "):
			l = "  • " + l.substr(2)
		lines.append(l)
	var text := "\n".join(lines)
	text = _re_sub(text, "\\*\\*(.+?)\\*\\*", "[b]$1[/b]")
	text = _re_sub(text, "\\*(.+?)\\*", "[i]$1[/i]")
	text = _re_sub(text, "`(.+?)`", "[code]$1[/code]")
	text = _re_sub(text, "\\[lb\\]([^\\]]+?)\\]\\((https?://[^)\\s]+)\\)", "[url=$2]$1[/url]")
	return text

static func build_body(md: String) -> Control:
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation", 6)
	var parts := split_images(md)
	var text := String(parts["text"])
	if text != "":
		var rt := RichTextLabel.new()
		rt.bbcode_enabled = true
		rt.fit_content = true
		rt.selection_enabled = true
		rt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		rt.text = to_bbcode(text)
		rt.meta_clicked.connect(func(meta): OS.shell_open(String(meta)))
		box.add_child(rt)
	for url in parts["images"]:
		var rect := TextureRect.new()
		rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		rect.custom_minimum_size = Vector2(0, 180)
		rect.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		box.add_child(rect)
		_load_image(rect, String(url))
	return box

static func _load_image(rect: TextureRect, url: String) -> void:
	if _img_cache.has(url):
		rect.texture = _img_cache[url]
		return
	var req := HTTPRequest.new()
	req.ready.connect(func(): req.request(url))
	req.request_completed.connect(func(_result, code, _headers, data: PackedByteArray):
		req.queue_free()
		if code != 200 or data.size() == 0:
			return
		var img := Image.new()
		var err := img.load_png_from_buffer(data)
		if err != OK:
			err = img.load_jpg_from_buffer(data)
		if err != OK:
			err = img.load_webp_from_buffer(data)
		if err != OK:
			return
		var tex := ImageTexture.create_from_image(img)
		_img_cache[url] = tex
		if is_instance_valid(rect):
			rect.texture = tex
	)
	rect.add_child(req)

static func format_hours(hours: float) -> String:
	var hs := String.num(hours, 2)
	if hs.contains("."):
		hs = hs.rstrip("0").rstrip(".")
	return hs

static func _re_sub(text: String, pattern: String, replacement: String) -> String:
	var re := RegEx.new()
	re.compile(pattern)
	return re.sub(text, replacement, true)
