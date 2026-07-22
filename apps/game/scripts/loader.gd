extends CanvasLayer
## Fullscreen loading overlay. Autoloaded so it survives `change_scene_to_file`,
## covering the gap between leaving the menu and the new scene spawning the
## player (which waits on a `scene_init` round-trip from the server).

const LOADING_SCREEN := preload("res://scenes/loading_screen.tscn")
## Safety net: hide even if the new scene never reports ready (e.g. the server
## never sends scene_init), so the player is never stuck on the loading screen.
const TIMEOUT_SEC := 8.0

var _screen: CanvasLayer
var _timeout := 0.0
var _active := false
var _pending_path := ""
var _shown := 0.0

func _ready() -> void:
	layer = 128
	process_mode = Node.PROCESS_MODE_ALWAYS
	_screen = LOADING_SCREEN.instantiate()
	_screen.visible = false
	add_child(_screen)

## Show the overlay and switch scenes. The scene loads on a background thread
## so the overlay keeps animating instead of freezing on the swap.
func change_scene(path: String, message: String = "Loading") -> void:
	show_loading(message)
	_pending_path = path
	ResourceLoader.load_threaded_request(path)

func show_loading(message: String = "Loading") -> void:
	_timeout = 0.0
	_active = true
	_shown = 0.0
	_screen.base_text = message.to_upper()
	_screen.set_progress(0.0)
	_screen.visible = true

func hide_loading() -> void:
	_active = false
	_screen.visible = false

func _process(delta: float) -> void:
	if _pending_path != "":
		var progress: Array = []
		var status := ResourceLoader.load_threaded_get_status(_pending_path, progress)
		if progress.size() > 0:
			_shown = maxf(_shown, progress[0] * 90.0)
		if status == ResourceLoader.THREAD_LOAD_LOADED:
			_shown = maxf(_shown, 90.0)
			var packed: PackedScene = ResourceLoader.load_threaded_get(_pending_path)
			_pending_path = ""
			get_tree().change_scene_to_packed(packed)
		elif status != ResourceLoader.THREAD_LOAD_IN_PROGRESS:
			var failed := _pending_path
			_pending_path = ""
			get_tree().change_scene_to_file(failed)
	if not _active:
		return
	_timeout += delta
	if _timeout >= TIMEOUT_SEC:
		hide_loading()
		return
	if _pending_path == "":
		_shown = minf(_shown + delta * 25.0, 97.0)
	_screen.set_progress(_shown)
