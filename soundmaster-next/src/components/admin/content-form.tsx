"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash, AlertCircle } from "lucide-react";

interface ContentFormProps {
  initialData?: Record<string, unknown>;
  contentType: "news" | "team" | "schedule" | "playlist";
  onSubmit: (data: FormData) => Promise<{ success: boolean; message?: string }>;
  onDelete?: () => Promise<{ success: boolean; message?: string }>;
}

export function ContentForm({ 
  initialData, 
  contentType, 
  onSubmit, 
  onDelete 
}: ContentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const isEditing = !!initialData;
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await onSubmit(formData);
      
      if (result.success) {
        setSuccess(result.message || "Content saved successfully!");
        if (!isEditing) {
          // Clear form if creating new content
          e.currentTarget.reset();
        }
        // Refresh the page data
        router.refresh();
      } else {
        setError(result.message || "Failed to save content.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      setIsDeleting(true);
      setError(null);
      setSuccess(null);
      
      try {
        const result = await onDelete();
        
        if (result.success) {
          setSuccess(result.message || "Content deleted successfully!");
          // Navigate back to the list page after deletion
          router.push(`/admin/${contentType}`);
        } else {
          setError(result.message || "Failed to delete content.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        console.error("Delete error:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          <h3 className="font-medium">Success</h3>
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Form fields will be provided by the parent component as children */}
        {/* This is just the form wrapper with submit/delete functionality */}
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
