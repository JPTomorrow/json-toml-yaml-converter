import { useState } from "react";
import { AiOutlineFileText } from "react-icons/ai";

const FileUpload = ({ text }: { text?: string }) => {
  const [debug, setDebug] = useState(null);
  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setDebug(reader.result);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };
  return (
    <>
      <label className=" w-fit mx-auto flex justify-center items-center border-primary border-[1px] rounded-lg p-5 cursor-pointer">
        <input onChange={handleFileChange} className=" hidden" type="file" />
        {text ? <p className="mr-5">{text}</p> : null}
        <AiOutlineFileText size={30} />
      </label>
      {debug ? (
        <div className=" w-[300px] break-words whitespace-pre-wrap">
          {debug}
        </div>
      ) : null}
    </>
  );
};

export default FileUpload;
