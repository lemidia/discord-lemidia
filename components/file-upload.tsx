"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

type FileUploadProps = {
  endPoint: "serverImage" | "messageFile";
  value: string;
  onChange: (url?: string) => void;
};

export const FileUpload = ({ endPoint, value, onChange }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-32 w-32">
        <Image
          fill
          src={value}
          alt="Upload"
          sizes="500px"
          className="rounded-full"
        />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          size={"icon"}
          className="absolute top-0 right-[-15px] rounded-full bg-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          size={"icon"}
          variant={"none"}
          className="absolute -top-4 -right-[18px] rounded-full bg-neutral-400 hover:bg-neutral-500 text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        // Do something with the response
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
};
