"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = () => {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the files here...</p> : <p>Drag &apos;n&apos; drop some files here, or click to select files</p>}
    </div>
  );
};

export default FileUploader;
