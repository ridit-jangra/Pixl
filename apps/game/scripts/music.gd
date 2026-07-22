extends Node

const TRACK_PATH := "res://assets/songs/climbing_the_clocktower.mp3"
const MAX_LINEAR := 0.5

var _player: AudioStreamPlayer

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var stream: AudioStream = load(TRACK_PATH)
	if stream is AudioStreamMP3:
		stream.loop = true
	_player = AudioStreamPlayer.new()
	_player.stream = stream
	add_child(_player)
	apply_settings()
	_player.play()

func apply_settings() -> void:
	if _player == null:
		return
	if Settings.music_enabled and Settings.music_volume > 0.0:
		_player.volume_db = linear_to_db(Settings.music_volume * MAX_LINEAR)
		if not _player.playing:
			_player.play()
	else:
		_player.volume_db = -80.0
