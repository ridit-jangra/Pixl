extends Node

const GAMEPLAY_SCENES := ["village", "open_world", "house_interior"]
const WEB_BASE_URL := "https://play.pixl.rsvp"

const _open_js := """(function(u){
	if (window.open(u, 'pixl_web')) return;
	var id = 'pixl-popup-fallback';
	var old = document.getElementById(id); if (old) old.remove();
	var wrap = document.createElement('div');
	wrap.id = id;
	wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:system-ui,-apple-system,sans-serif';
	var card = document.createElement('div');
	card.style.cssText = 'background:#16161d;color:#f4f4f5;border:1px solid #2a2a35;border-radius:16px;padding:26px 30px;max-width:320px;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,.55)';
	var msg = document.createElement('div');
	msg.textContent = 'Your browser blocked the pop-up. Tap to open it.';
	msg.style.cssText = 'font-size:15px;line-height:1.5;margin-bottom:18px';
	var btn = document.createElement('button');
	btn.textContent = 'OPEN';
	btn.style.cssText = 'cursor:pointer;border:0;border-radius:11px;padding:11px 26px;font-weight:700;font-size:14px;letter-spacing:.03em;background:#f4b942;color:#16161d';
	var close = function(){ wrap.remove(); document.removeEventListener('keydown', onKey); };
	var onKey = function(e){ if (e.key === 'Escape') close(); };
	btn.onclick = function(){ window.open(u, 'pixl_web'); close(); };
	wrap.onclick = function(e){ if (e.target === wrap) close(); };
	document.addEventListener('keydown', onKey);
	card.appendChild(msg); card.appendChild(btn); wrap.appendChild(card);
	document.body.appendChild(wrap);
})(%s);"""

func open(path: String) -> void:
	var url := _build_url(path)
	if OS.has_feature("web"):
		JavaScriptBridge.eval(_open_js % JSON.stringify(url), true)
	else:
		OS.shell_open(url)

func _build_url(path: String) -> String:
	var base := path
	var fragment := ""
	var hash_pos := path.find("#")
	if hash_pos != -1:
		base = path.substr(0, hash_pos)
		fragment = path.substr(hash_pos)
	var url := WEB_BASE_URL + "/" + base + "/"
	var sep := "?"
	if NetworkManager.session_token != "":
		url += sep + "token=" + NetworkManager.session_token.uri_encode()
		sep = "&"
	url += sep + "embed=1"
	url += fragment
	return url

func _in_gameplay() -> bool:
	var cur := get_tree().current_scene
	return cur != null and GAMEPLAY_SCENES.has(cur.scene_file_path.get_file().get_basename())

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
	if not _in_gameplay() or global.ui_blocked() or ChatHud.is_typing() or Dialogue.is_open:
		return
	match event.keycode:
		KEY_H:
			open("projects")
		KEY_B:
			open("shop")
		KEY_J:
			open("quests")
		_:
			return
	get_viewport().set_input_as_handled()
