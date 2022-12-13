import FileUpload from "@/components/FileUpload";

function App() {
  return (
    <div className="flex justify-center items-center w-screen min-h-screen h-auto py-[50px]">
      <div className="flex-col items-center">
        <div className="text-center mb-5">
          <h1 className="text-3xl">JSON | TOML | YAML</h1>
          <h2 className="text-xl">Convert from one to the other two!</h2>
          <div className="mt-2">
            <h2 className="text-sm">
              1. Will safely inform you if conversion cannot be made
            </h2>
            <h2 className="text-sm">
              2. output files will be generted in the same directory as the
              input file
            </h2>
          </div>
        </div>
        <FileUpload text="Please select a file..." />
      </div>
    </div>
  );
}

export default App;
