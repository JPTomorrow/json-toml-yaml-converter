#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::api::file;
use tsu::*;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

enum FileType {
    TOML,
    JSON,
    YAML,
}

impl FileType {
    fn from_str(file_type: &str) -> FileType {
        match file_type {
            "toml" => FileType::TOML,
            "json" => FileType::JSON,
            "yaml" => FileType::YAML,
            _ => panic!("unknown file type passed to backend"),
        }
    }
}

#[tauri::command]
fn parse_file(file_path: &str, file_type: &str) {
    let file_type = FileType::from_str(file_type);
    let file_text = get_text_from_file(file_path);
    match file_type {
        FileType::TOML => {
            toml_to_json(&file_text);
            toml_to_yaml(&file_text);
        }
        FileType::JSON => {
            json_to_toml(&file_text);
            json_to_yaml(&file_text);
        }
        FileType::YAML => {
            yaml_to_toml(&file_text);
            yaml_to_json(&file_text);
        }
    };
}

fn get_text_from_file(file_path: &str) -> String {
    match file::read_string(file_path) {
        Ok(text) => text,
        Err(_) => panic!("failed to read file"),
    }
}

fn toml_to_json(file_text: &str) {}

fn toml_to_yaml(file_text: &str) {}

fn json_to_toml(file_text: &str) {}

fn json_to_yaml(file_text: &str) {}

fn yaml_to_toml(file_text: &str) {}

fn yaml_to_json(file_text: &str) {}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![parse_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
