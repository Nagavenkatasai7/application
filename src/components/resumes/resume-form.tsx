"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PdfDropzone } from "./pdf-dropzone";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Resume name is required")
    .max(200, "Resume name must be less than 200 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface ResumeFormProps {
  onSubmit: (data: FormData, file: File) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<FormData>;
}

export function ResumeForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: ResumeFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileError(null);
    // Auto-fill name from filename if name is empty
    const currentName = getValues("name");
    if (!currentName) {
      const nameFromFile = file.name.replace(/\.pdf$/i, "");
      setValue("name", nameFromFile, { shouldValidate: true });
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!selectedFile) {
      setFileError("Please select a PDF file");
      return;
    }
    await onSubmit(data, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <PdfDropzone
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
            disabled={isLoading}
            error={fileError || undefined}
          />
        </CardContent>
      </Card>

      {/* Resume Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resume Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Resume Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g., Software Engineer Resume"
              {...register("name")}
              disabled={isLoading}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Resume"
          )}
        </Button>
      </div>
    </form>
  );
}
