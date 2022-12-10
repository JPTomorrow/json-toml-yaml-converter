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
fn parse_file(file_path: &str, file_type: &str) -> Result<(), String> {
    let file_type = match FileType::from_str(file_type) {
        Ok(file_type) => file_type,
        Err(err) => return Err(err),
    };

    let file_text = match get_text_from_file(file_path) {
        Ok(file_text) => file_text,
        Err(err) => return Err(err),
    };

    match file_type {
        FileType::TOML => {
            match toml_to_json(&file_text) {
                Ok(_) => match toml_to_yaml(&file_text) {
                    Ok(_) => return Ok(()),
                    Err(err) => return Err(err),
                },
                Err(err) => return Err(err),
            };
        }
        FileType::JSON => match json_to_toml(&file_text) {
            Ok(_) => match json_to_yaml(&file_text) {
                Ok(_) => return Ok(()),
                Err(err) => return Err(err),
            },
            Err(err) => return Err(err),
        },
        FileType::YAML => match yaml_to_toml(&file_text) {
            Ok(_) => match yaml_to_json(&file_text) {
                Ok(_) => return Ok(()),
                Err(err) => return Err(err),
            },
            Err(err) => return Err(err),
        },
    };
}

fn get_text_from_file(file_path: &str) -> Result<String, String> {
    match file::read_string(file_path) {
        Ok(text) => Ok(text),
        Err(_) => Err("failed to read text from file".to_string()),
    }
}

fn toml_to_json(file_text: &str) -> Result<(), String> {
    match tsu::convert_toml_to_json(file_text) {
        Ok(json) => {
            println!("{}", json);
            Ok(())
        }
        Err(err) => Err(err.to_string()),
    }
}

fn toml_to_yaml(file_text: &str) -> Result<(), String> {
    match tsu::convert_toml_to_yaml(file_text) {
        Ok(yaml) => {
            println!("{}", yaml);
            Ok(())
        }
        Err(err) => Err(err.to_string()),
    }
}

fn json_to_toml(file_text: &str) -> Result<String, String> {
    match tsu::convert_json_to_toml(file_text) {
        Ok(toml) => {
            println!("{}", toml);
            Ok(toml)
        }
        Err(err) => Err(err.to_string()),
    }
}

fn json_to_yaml(file_text: &str) -> Result<(), String> {
    match json_to_toml(file_text) {
        Ok(toml) => match toml_to_yaml(&toml) {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        },
        Err(err) => Err(err),
    }
}

fn yaml_to_toml(file_text: &str) -> Result<String, String> {
    match tsu::convert_yaml_to_toml(file_text) {
        Ok(toml) => {
            println!("{}", toml);
            Ok(toml)
        }
        Err(err) => Err(err.to_string()),
    }
}

fn yaml_to_json(file_text: &str) -> Result<(), String> {
    match yaml_to_toml(file_text) {
        Ok(toml) => match toml_to_json(&toml) {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        },
        Err(err) => Err(err),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![parse_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
