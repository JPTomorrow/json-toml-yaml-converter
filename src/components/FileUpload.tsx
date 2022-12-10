import { useState } from "react";
import { AiOutlineFileText } from "react-icons/ai";

type FileTextView = {
  data?: string;
  err?: string;
};

const FileUpload = ({ text }: { text?: string }) => {
  const [fileTextView, setFileTextView] = useState<FileTextView>({});

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0] as File;
    if (!file) return;

    const ext = file.name.split(".").pop();
    const exts = ["toml", "yaml", "json"];
    const isExtValid = exts.includes(ext);
    if (!isExtValid) {
      setFileTextView({ err: "Invalid File Type" });
      return;
    }

    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      setFileTextView({ data: reader.result as string });
    };
    reader.onerror = () => {
      setFileTextView({ err: "File reader through an error" });
    };
  };
  return (
    <>
      <label className=" w-fit mx-auto flex justify-center items-center border-primary border-[1px] rounded-lg p-5 cursor-pointer">
        <input onChange={handleFileChange} className=" hidden" type="file" />
        {text ? <p className="mr-5">{text}</p> : null}
        <AiOutlineFileText size={30} />
      </label>
      {fileTextView.data ? (
        <>
          <div className=" overflow-auto scroll-smooth w-[500px]  max-h-[200px]  mx-auto mt-5 break-words whitespace-pre-wrap border-primary border-[1px] rounded-xl p-5">
            <p className="text-2xl underline mb-3 text-green-300">
              Input File Sample
            </p>
            <p>{fileTextView.data}</p>
          </div>
          <button className="default-button mt-5">Convert</button>
        </>
      ) : (
        <div className="text-3xl text-red-500 mt-5 text-center">
          {fileTextView.err}
        </div>
      )}
    </>
  );
};

export default FileUpload;
