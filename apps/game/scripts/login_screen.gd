extends Control

func _on_login_button_pressed() -> void:
	NetworkManager.start_login()

func _ready() -> void:
	NetworkManager.logged_in.connect(_on_logged_in)

func _on_logged_in(name: String) -> void:
	get_tree().change_scene_to_file("res://scenes/village.tscn")
