"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Upload } from "lucide-react";
import { PdfDropzone } from "@/components/resumes/pdf-dropzone";

interface Resume {
  id: string;
  name: string;
}

interface ResumeSelectorProps {
  onResumeSelect: (
    resumeId: string | null,
    uploadedFile?: { file: File; name: string }
  ) => void;
  disabled?: boolean;
}

export function ResumeSelector({
  onResumeSelect,
  disabled,
}: ResumeSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: resumesData, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return res.json();
    },
  });

  const resumes: Resume[] = resumesData?.data || [];

  const handleSelectionChange = (value: string) => {
    setSelectedValue(value);
    if (value === "new") {
      setUploadFile(null);
      onResumeSelect(null);
    } else {
      setUploadFile(null);
      onResumeSelect(value);
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    onResumeSelect(null, { file, name: file.name.replace(".pdf", "") });
  };

  const handleFileRemove = () => {
    setUploadFile(null);
    onResumeSelect(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Your Resume
        </Label>
        <Select
          value={selectedValue}
          onValueChange={handleSelectionChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "Loading..." : "Choose a resume or upload new"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload New Resume
              </div>
            </SelectItem>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedValue === "new" && (
        <PdfDropzone
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          selectedFile={uploadFile}
          disabled={disabled}
        />
      )}
    </div>
  );
}
