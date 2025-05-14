"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, File, Check } from "lucide-react";
import Image from "next/image";

// Simple utility function to combine class names
const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface MediaUploaderProps {
  onUpload: (files: File[]) => Promise<{ success: boolean; urls?: string[]; message?: string }>;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function MediaUploader({
  onUpload,
  maxFiles = 5,
  acceptedTypes = "image/*,audio/*,video/*",
  maxSizeMB = 10
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file count
    if (selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }
    
    // Validate file size
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of ${maxSizeMB}MB.`);
      return;
    }
    
    setError(null);
    setSuccess(null);
    setFiles(selectedFiles);
    
    // Create preview URLs for images
    const newPreviews = selectedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    
    setPreviews(newPreviews);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate file count
      if (droppedFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files at once.`);
        return;
      }
      
      // Validate file size
      const oversizedFiles = droppedFiles.filter(file => file.size > maxSizeBytes);
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${maxSizeMB}MB.`);
        return;
      }
      
      setError(null);
      setSuccess(null);
      setFiles(droppedFiles);
      
      // Create preview URLs for images
      const newPreviews = droppedFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      
      setPreviews(newPreviews);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke object URL to prevent memory leaks
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };
  
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload.");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await onUpload(files);
      
      if (result.success) {
        setSuccess(result.message || `Successfully uploaded ${files.length} file(s).`);
        // Clear files after successful upload
        setFiles([]);
        // Revoke all preview URLs
        previews.forEach(preview => {
          if (preview) URL.revokeObjectURL(preview);
        });
        setPreviews([]);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.message || "Failed to upload files.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during upload.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center",
          "hover:bg-gray-50 transition-colors cursor-pointer",
          error ? "border-red-300" : "border-gray-300"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={acceptedTypes}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700">Drag files here or click to upload</h3>
          <p className="text-sm text-gray-500">
            Upload up to {maxFiles} files (max {maxSizeMB}MB each)
          </p>
          <p className="text-xs text-gray-400">
            Accepted formats: {acceptedTypes.replace(/\*/g, 'all').replace(/,/g, ', ')}
          </p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Selected Files ({files.length})</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  {previews[index] ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image 
                        src={previews[index]} 
                        alt={file.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    getFileIcon(file)
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
