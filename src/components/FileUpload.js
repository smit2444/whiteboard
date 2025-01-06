import React, { useState, useRef } from "react";
import { GoNorthStar, GoPencil, GoCode, GoUpload } from "react-icons/go";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Editor } from "@monaco-editor/react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import Papa from "papaparse";
import '../App.css'

const FileUploadContainer = () => {
    const [file, setFile] = useState(null);
    const [csvData, setCsvData] = useState(null);
    const [activeOption, setActiveOption] = useState(null);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const columnsRef = useRef([]);
    const [fileUrl, setFileUrl] = useState(null);


    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        const reader = new FileReader();
        const url = URL.createObjectURL(uploadedFile);
        setFileUrl(url);


        if (uploadedFile.type === "text/csv") {
            reader.onload = (e) => parseCSV(e.target.result);
            reader.readAsText(uploadedFile);
        } else {
            reader.onload = (e) => {
                setFile({ type: uploadedFile.type, name: uploadedFile.name, content: e.target.result });
                setCsvData(null);
            };
            reader.readAsDataURL(uploadedFile);
        }
        console.log("Type", uploadedFile.type);
    };


    const parseCSV = (csvContent) => {
        const parsed = Papa.parse(csvContent, { header: true });
        setCsvData(parsed.data);
    };

    const clearFile = () => {
        setFile(null);
        setCsvData(null);
    };


    const renderFileContent = () => {

        if (csvData) {
            return (
                <div className="overflow-x-auto h-full w-full">
                    <table className="w-full text-black table-auto border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                {Object.keys(csvData[0]).map((header, index) => (
                                    <th
                                        key={index}
                                        ref={(el) => columnsRef.current[index] = el}
                                        className="border-b px-4 py-2 text-center text-sm font-semibold text-gray-700"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {csvData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        } hover:bg-gray-200`}
                                >
                                    {Object.values(row).map((value, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="border-b px-4 py-2 text-sm text-gray-700"
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (file?.type.startsWith("image")) {
            return <img src={fileUrl} alt="Uploaded" className="w-full h-full object-contain" />;
        } else if (file?.type.startsWith("video")) {
            const video = [{
                uri: fileUrl,
                fileType: file.type,
                fileName: file.name
            }]
            return (
                <DocViewer documents={video} pluginRenderes={DocViewerRenderers} style={{ height: 500 }} />
            );
            // return <video src={fileUrl} controls className="w-full h-auto object-contain" />;
        } else if (file?.type === "application/pdf") {
            return <iframe src={fileUrl} title="PDF Viewer" className="w-full h-full" />;
        } 
        else if (file?.type.startsWith("text/plain")){
            return <iframe src={fileUrl} title="Text File Viewer" className="w-full h-full" />;
        }else {
            return <p className="text-white">Unsupported file type</p>;
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden h-full rounded">
            <div className="flex-1 overflow-auto w-full h-full">
                {activeOption === 'upload' && renderFileContent()}
            </div>

            {activeOption === 'upload' && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors m-1.5">
                    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                        {file ? (
                            <div className="flex flex-grow items-center gap-2 text-gray-700">
                                <span className="text-sm">{file.name}</span>
                                <button
                                    onClick={clearFile}
                                    className="shrink-0 px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Clear
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <p className="text-gray-600 text-sm text-center sm:text-left">
                                        Select a File (CSV, PDF, Video, Image) to Present
                                    </p>
                                    <input
                                        type="file"
                                        className="flex-1 text-sm text-gray-500 
                                file:mr-4 file:py-2 file:px-4 
                                file:rounded-lg file:border-0 
                                file:text-sm file:font-semibold 
                                file:bg-blue-50 file:text-blue-700 
                                hover:file:bg-blue-100 sm:w-auto w-full mt-2 sm:mt-0"
                                        accept=".csv, .png, .jpg, .jpeg, .pdf, .mp4, .txt"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                            </>
                        )}
                    </div>
                </div>
            )}

            {activeOption === 'draw' && (
                <div className="relative w-full h-full">
                    <Excalidraw>
                    </Excalidraw>
                </div>
            )}

            {activeOption === 'code' && (
                <Editor height="100%" defaultLanguage="python" defaultValue="// Write your code here" />
            )}

            {(!activeOption || activeOption === '') && (
                <div className="flex justify-center items-center h-full text-gray-500">
                    <span>Present Your Way! <br /> Please select an option to begin with.</span>
                </div>
            )}
            <div
                className="absolute top-5 right-5 z-40"
                onMouseEnter={() => setIsMenuHovered(true)}
                onMouseLeave={() => setIsMenuHovered(false)}
            >
                <button
                    onClick={() => setActiveOption('')}
                    className={`bg-white text-black p-2 border shadow-lg transition-transform transform hover:scale-105 hover:rounded-full z-50 ${isMenuHovered ? 'rounded-full' : 'rounded-full'}`}
                >
                    <GoNorthStar size={18} />
                </button>
                {isMenuHovered && (
                    <div className="absolute top-10 right-0 mt-0 flex flex-col border bg-white rounded-lg py-2 space-y-1 transition-all duration-300 ease-in-out z-10">
                        <button
                            onClick={() => setActiveOption('draw')}
                            className="relative flex items-center justify-center text-black p-2 rounded transition-transform transform hover:scale-105"
                        >
                            <GoPencil size={18} className="mr-2" />
                            Draw
                        </button>
                        <hr class="border-t border-gray-300 my-2" />


                        <button
                            onClick={() => setActiveOption('upload')}
                            className="relative flex items-center justify-center text-black p-2 rounded transition-transform transform hover:scale-105 group"
                        >
                            <GoUpload size={18} className="mr-2" />
                            Upload
                        </button>
                        <hr class="border-t border-gray-300 my-2" />

                        <button
                            onClick={() => setActiveOption('code')}
                            className="relative flex items-center justify-center text-black p-2 rounded transition-transform transform hover:scale-105"
                        >
                            <GoCode size={18} className="mr-2" />
                            Code
                        </button>
                    </div>
                )}
            </div>
        </div>


    );
};
export default FileUploadContainer;
