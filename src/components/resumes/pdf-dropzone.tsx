"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  validatePdfFile,
  MAX_FILE_SIZE,
} from "@/lib/validations/resume";

interface PdfDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  disabled?: boolean;
  error?: string;
}

export function PdfDropzone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  disabled = false,
  error: externalError,
}: PdfDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validation = validatePdfFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || "Invalid file");
        return;
      }
      setValidationError(null);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setValidationError(null);
    onFileRemove?.();
  }, [onFileRemove]);

  const displayError = externalError || validationError;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {selectedFile ? (
        // File selected state
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="shrink-0"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        // Dropzone state
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            isDragOver && !disabled
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed",
            displayError && "border-destructive"
          )}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload PDF file"
          />
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragOver ? "Drop your PDF here" : "Drag & drop your PDF here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
            </p>
          </div>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
