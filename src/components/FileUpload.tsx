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
    setPath(potentialPath);

    await invoke("get_text_from_file", { filePath: path })
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

    if (jsonView !== "") await writeTextFile(path, jsonView);
    if (tomlView !== "") await writeTextFile(path, tomlView);
    if (yamlView !== "") await writeTextFile(path, yamlView);
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
          <div className=" overflow-auto scroll-smooth w-[500px]  max-h-[200px]  mx-auto mt-5 break-words whitespace-pre-wrap border-primary border-[1px] rounded-xl p-5">
            <p className="text-2xl underline mb-3 text-green-300">
              Input File Sample
            </p>
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
      <div className="inline-flex">
        {jsonView ? (
          <p className="overflow-auto scroll-smooth w-[500px]  max-h-[200px]  mx-auto mt-5 break-words whitespace-pre-wrap border-primary border-[1px] rounded-xl p-5">
            {jsonView}
          </p>
        ) : null}
      </div>
    </>
  );
};

export default FileUpload;
