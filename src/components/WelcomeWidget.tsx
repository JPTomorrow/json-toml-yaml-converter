import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const WelcomeWidget = () => {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }
  return (
    <div className="flex-col max-w-[500px] border-[1px] border-primary rounded-xl px-5">
      <h1 className="text-3xl mt-2">Tauri Desktop App Template</h1>
      <div className="my-2 mt-5">
        <input
          id="greet-input"
          className="default-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button
          className="default-button ml-2"
          type="button"
          onClick={() => greet()}
        >
          Greet
        </button>
        <p className="mt-5">{greetMsg}</p>
      </div>
    </div>
  );
};

export default WelcomeWidget;
