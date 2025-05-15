"use client";

import { ArrowUpFromLine } from "lucide-react";
import Image from "next/image";
import { FormHTMLAttributes, useCallback, useEffect, useState } from "react";
import {
  DropzoneInputProps,
  DropzoneRootProps,
  FileRejection,
  useDropzone,
} from "react-dropzone";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";
import { ReloadIcon } from "@radix-ui/react-icons";
import React from "react";
// import { getSignature, saveToDatabase } from "../_actions";

const Dropzone = ({
  className,
  getRootProps,
  getInputProps,
  isDragActive,
}: {
  className?: string;
  getRootProps?: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps?: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  isDragActive?: boolean;
}) => {
  //   async function action() {
  //     const file = files[0];
  //     if (!file) return;

  //     // get a signature using server action
  //     const { timestamp, signature } = await getSignature();

  //     // upload to cloudinary using the signature
  //     const formData = new FormData();

  //     formData.append("file", file);
  //     formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
  //     formData.append("signature", signature);
  //     formData.append("timestamp", timestamp);
  //     formData.append("folder", "next");

  //     const endpoint = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;
  //     const data = await fetch(endpoint, {
  //       method: "POST",
  //       body: formData,
  //     }).then((res) => res.json());

  //     // write to database using server actions
  //     await saveToDatabase({
  //       version: data?.version,
  //       signature: data?.signature,
  //       public_id: data?.public_id,
  //     });
  //   }

  return (
    <div
      {...getRootProps!({
        className: className,
      })}
    >
      <input {...getInputProps!({ name: "file" })} />
      <div className="flex flex-col outline-dashed rounded-sm outline-primary h-36 items-center justify-center gap-4">
        <ArrowUpFromLine size={20} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
