import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { useState } from "react";
import { AiOutlineFileText } from "react-icons/ai";

type FileTextView = {
  data?: string;
  err?: string;
};

const FileUpload = ({ text }: { text?: string }) => {
  const [fileTextView, setFileTextView] = useState<FileTextView>({});
  const [jsonView, setJsonView] = useState<string>(null);
  const [tomlView, setTomlView] = useState<string>(null);
  const [yamlView, setYamlView] = useState<string>(null);
  const [path, setPath] = useState<string>("");

  const handleFileSelection = async (e: any) => {
    const potentialPath = (await open({ multiple: false })) as string;
    if (!potentialPath) return;
    setPath(potentialPath);

    await invoke("get_text_from_file", { filePath: potentialPath })
      .then((preview) => {
        setFileTextView({ data: preview as string });
      })
      .catch((err) => {
        setFileTextView({ data: undefined, err: err as string });
      });
  };

  const handleConversion = async () => {
    await invoke("generate_other_file_formats", {
      filePath: path,
    })
      .then((res: string) => {
        const converted = JSON.parse(res);
        const json = converted["json"];
        const toml = converted["toml"];
        const yaml = converted["yaml"];

        if (json) {
          setJsonView(json);
        }

        if (toml) {
          setTomlView(toml);
        }

        if (yaml) {
          setYamlView(yaml);
        }
      })
      .catch((err) => {
        setFileTextView({
          data: undefined,
          err: err,
        });
      });
  };

  const writeOutputFiles = async () => {
    var lastIndex = path.lastIndexOf("/");
    var fileName = (ext: string) =>
      path.slice(lastIndex + 1, path.length).split(".")[0] + "." + ext;
    var newPath = path.slice(0, lastIndex + 1);

    if (jsonView) await writeTextFile(newPath + fileName("json"), jsonView);
    if (tomlView) await writeTextFile(newPath + fileName("toml"), tomlView);
    if (yamlView) await writeTextFile(newPath + fileName("yaml"), yamlView);
  };
  return (
    <>
      <label className=" w-fit mx-auto flex justify-center items-center border-primary border-[1px] rounded-lg p-5 cursor-pointer">
        <button onClick={handleFileSelection} className=" hidden" />
        {text ? <p className="mr-5">{text}</p> : null}
        <AiOutlineFileText size={30} />
      </label>
      {fileTextView.data ? (
        <>
          <div className="input-text-views">
            <p className="text-view-header">Input File</p>
            <p className="text-sm"> Path: {path.slice(0, 50) + "..."}</p>
            <br />
            <p>{fileTextView.data}</p>
          </div>
          <button onClick={handleConversion} className="default-button mt-5">
            Convert
          </button>
        </>
      ) : (
        <div className="text-3xl text-red-500 mt-5 text-center">
          {fileTextView.err ? <p>{fileTextView.err}</p> : null}
        </div>
      )}
      <br />
      <div className="inline-flex gap-5">
        {jsonView ? (
          <p className="converted-text-views">
            <p className="text-view-header">JSON Output</p>
            {jsonView}
          </p>
        ) : null}
        {tomlView ? (
          <p className="converted-text-views">
            <p className="text-view-header">TOML Output</p>
            {tomlView}
          </p>
        ) : null}
        {yamlView ? (
          <p className="converted-text-views">
            <p className="text-view-header">YAML Output</p>
            {yamlView}
          </p>
        ) : null}
      </div>
      <br />
      {jsonView || yamlView || tomlView ? (
        <button onClick={writeOutputFiles} className="default-button mt-5">
          Save Files
        </button>
      ) : null}
    </>
  );
};

export default FileUpload;
