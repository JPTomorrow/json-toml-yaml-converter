#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde_json::to_string;
use tauri::api::file;

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
    fn from_str(file_type: &str) -> Result<FileType, String> {
        match file_type {
            "toml" => Ok(FileType::TOML),
            "json" => Ok(FileType::JSON),
            "yaml" => Ok(FileType::YAML),
            _ => Err(format!("{} is not a valid file type", file_type)),
        }
    }
}

#[tauri::command]
fn generate_other_file_formats(file_path: &str) -> Result<String, String> {
    let ext = match get_file_ext(file_path) {
        Ok(ext) => ext,
        Err(err) => return Err(err),
    };

    let file_type = match FileType::from_str(ext.as_str()) {
        Ok(file_type) => file_type,
        Err(err) => return Err(err),
    };

    let file_text = match get_text_from_file(file_path) {
        Ok(file_text) => file_text,
        Err(err) => return Err(err),
    };

    match file_type {
        FileType::TOML => {
            let json = match toml_to_json(&file_text) {
                Ok(json) => json,
                Err(err) => return Err(err),
            };
            let yaml = match toml_to_yaml(&file_text) {
                Ok(yaml) => yaml,
                Err(err) => return Err(err),
            };
            let res = serde_json::json!({
                "json": json,
                "yaml": yaml,
            });
            Ok(format!("{}", res.to_string()))
        }
        FileType::JSON => {
            let toml = match json_to_toml(&file_text) {
                Ok(toml) => toml,
                Err(err) => return Err(err),
            };
            let yaml = match json_to_yaml(&file_text) {
                Ok(yaml) => yaml,
                Err(err) => return Err(err),
            };
            let res = serde_json::json!({
                "toml": toml,
                "yaml": yaml,
            });
            Ok(format!("{}", res.to_string()))
        }
        FileType::YAML => {
            let toml = match yaml_to_toml(&file_text) {
                Ok(toml) => toml,
                Err(err) => return Err(err),
            };
            let json = match yaml_to_json(&file_text) {
                Ok(json) => json,
                Err(err) => return Err(err),
            };
            let res = serde_json::json!({
                "toml": toml,
                "json": json,
            });
            Ok(format!("{}", res.to_string()))
        }
    }
}

#[tauri::command]
fn get_text_from_file(file_path: &str) -> Result<String, String> {
    match file::read_string(file_path) {
        Ok(text) => Ok(text),
        Err(_) => Err("failed to read text from file".to_string()),
    }
}

fn get_file_ext(file_path: &str) -> Result<String, String> {
    match file_path.split('.').last() {
        Some(ext) => Ok(String::from(ext)),
        None => Err("failed to retrieve file extension".to_string()),
    }
}

fn toml_to_json(file_text: &str) -> Result<String, String> {
    match tsu::convert_toml_to_json(file_text) {
        Ok(json) => Ok(json),
        Err(err) => Err(err.to_string()),
    }
}

fn toml_to_yaml(file_text: &str) -> Result<String, String> {
    match tsu::convert_toml_to_yaml(file_text) {
        Ok(yaml) => Ok(yaml),
        Err(err) => Err(err.to_string()),
    }
}

fn json_to_toml(file_text: &str) -> Result<String, String> {
    match tsu::convert_json_to_toml(file_text) {
        Ok(toml) => Ok(toml),
        Err(err) => Err(err.to_string()),
    }
}

fn json_to_yaml(file_text: &str) -> Result<String, String> {
    match json_to_toml(file_text) {
        Ok(toml) => match toml_to_yaml(&toml) {
            Ok(yaml) => Ok(yaml),
            Err(err) => Err(err),
        },
        Err(err) => Err(err),
    }
}

fn yaml_to_toml(file_text: &str) -> Result<String, String> {
    match tsu::convert_yaml_to_toml(file_text) {
        Ok(toml) => Ok(toml),
        Err(err) => Err(err.to_string()),
    }
}

fn yaml_to_json(file_text: &str) -> Result<String, String> {
    match yaml_to_toml(file_text) {
        Ok(toml) => match toml_to_json(&toml) {
            Ok(json) => Ok(json),
            Err(err) => Err(err),
        },
        Err(err) => Err(err),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_text_from_file,
            generate_other_file_formats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
