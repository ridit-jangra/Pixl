extends CanvasLayer

@onready var progress_bar: ProgressBar = $Center/VBox/ProgressBar
@onready var loading_label: Label = $Center/VBox/LoadingLabel

var base_text := "LOADING"
var _dot_timer: float = 0.0
var _dot_count: int = 0

func set_progress(pct: float) -> void:
	progress_bar.value = pct

func _process(delta: float) -> void:
	if not visible:
		return
	_dot_timer += delta
	if _dot_timer >= 0.4:
		_dot_timer = 0.0
		_dot_count = (_dot_count + 1) % 4
		loading_label.text = base_text + ".".repeat(_dot_count)
