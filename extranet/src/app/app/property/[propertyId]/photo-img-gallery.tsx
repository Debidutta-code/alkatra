"use client";

import Image from "next/image";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../..//components/ui/dialog";
import { Plus, Trash2, Upload, Loader2, Edit3, Eye, ImageIcon, ChevronRight, ChevronLeft, } from "lucide-react";
import { useDropzone, FileRejection } from "react-dropzone";
import toast from "react-hot-toast";
import axios from "axios";
import { updateProperty } from '../[propertyId]/api';

interface IFileWithPreview extends File {
  preview: string;
}

interface PropertyImageGalleryProps {
  image: string[];
  onImagesUpdate?: (images: string[]) => void;
  editable?: boolean;
  loading?: boolean;
  propertyId: string;
  accessToken: string;
}

export function PropertyImageGallery({
  image = [],
  onImagesUpdate,
  editable = false,
  loading = false,
  propertyId,
  accessToken
}: PropertyImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [files, setFiles] = useState<IFileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ url: string; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // Adjust current image index when images are deleted
  useEffect(() => {
    if (currentImage >= image.length && image.length > 0) {
      setCurrentImage(image.length - 1);
    }
  }, [image.length, currentImage]);

  const handleImageUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });

      const uploadResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      // Extract just the URLs from the Cloudinary response
      const newImageUrls = uploadResponse.data.data.urls.map((img: any) => img.url);
      const updatedImages = [...image, ...newImageUrls];

      // Update the UI immediately
      if (onImagesUpdate) {
        onImagesUpdate(updatedImages);
      }

      // Update the property record with just the URLs
      await updateProperty(propertyId, accessToken, { image: updatedImages });

      setFiles([]);
      setUploadDialogOpen(false);
      toast.success("Property images uploaded successfully!");
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    setDeleting(imageUrl);
    try {
      const updatedImages = image.filter((_, i) => i !== index);

      // Update the UI immediately
      if (onImagesUpdate) {
        onImagesUpdate(updatedImages);
      }

      // Update the property record
      await updateProperty(propertyId, accessToken, { image: updatedImages });

      toast.success("Image deleted successfully!");
      setDeleteConfirmOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error("Failed to delete image");
      // Revert the UI update on error
      if (onImagesUpdate) {
        onImagesUpdate(image);
      }
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (imageUrl: string, index: number) => {
    setImageToDelete({ url: imageUrl, index });
    setDeleteConfirmOpen(true);
  };

  // Drag and drop handlers for reordering
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles?.length) {
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map(file =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }

    if (rejectedFiles?.length) {
      setRejected(previousFiles => [...previousFiles, ...rejectedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop,
    noClick: true,
    disabled: !editMode
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const filesWithPreview = selectedFiles.map(file =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setFiles(prev => [...prev, ...filesWithPreview]);
    }
  };

  const removeFile = (name: string) => {
    setFiles(files => files.filter(file => file.name !== name));
  };

  // If no images, show placeholder
  if (image.length === 0) {
    return editable ? (
      <div className="relative group">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50/50 to-gray-100/30 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-tripswift-blue to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No images available</h3>
              <p className="text-sm text-gray-500">Add stunning images to showcase your property</p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-tripswift-dark-blue hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Images
            </Button>
          </div>
        </div>
        {uploadDialogOpen && (
          <UploadDialog
            open={uploadDialogOpen}
            setOpen={setUploadDialogOpen}
            files={files}
            setFiles={setFiles}
            rejected={rejected}
            setRejected={setRejected}
            uploading={uploading}
            onUpload={handleImageUpload}
            fileInputRef={fileInputRef}
            removeFile={removeFile}
          />
        )}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editable && (
        <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${editMode ? 'bg-tripswift-blue' : 'bg-gray-400'} transition-colors duration-300`}></div>
                {editMode && (
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-tripswift-blue rounded-full animate-ping opacity-75"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {editMode ? "Edit Mode" : "View Mode"}
                </span>
                <span className="text-xs text-gray-500">
                  {editMode ? "Click or drag images to modify" : "Gallery view active"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`h-9 px-4 font-medium transition-all duration-200 rounded-md flex items-center gap-2 ${editMode
                  ? "text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  : "bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-tripswift-dark-blue hover:to-purple-700 text-white shadow-sm hover:shadow-md"
                  }`}
              >
                {editMode ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>

              {editMode && (
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  className="h-9 px-4 bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-tripswift-dark-blue hover:to-purple-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        {...(editMode ? getRootProps() : {})}
        className={`relative rounded-xl overflow-hidden transition-all duration-500 ${editMode && isDragActive
          ? 'ring-4 ring-tripswift-blue/30 shadow-2xl transform scale-[1.01]'
          : editMode
            ? 'ring-2 ring-blue-200/60 shadow-lg'
            : 'shadow-xl hover:shadow-2xl'
          }`}
      >
        {editMode && <input {...getInputProps()} />}

        {editMode && isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-tripswift-blue to-purple-600/95 backdrop-blur-md flex items-center justify-center z-20 rounded-xl">
            <div className="text-center text-white px-8 py-6">
              <div className="relative mb-6">
                <Upload className="w-16 h-16 mx-auto animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Drop your images here</h3>
              <p className="text-white/80 text-sm">Support JPG, PNG, WEBP up to 10MB each</p>
            </div>
          </div>
        )}

        <div className="relative group">
          <div className="aspect-[5/2] relative overflow-hidden">
            <Image
              src={image[currentImage]}
              alt="Property showcase"
              fill
              className="object-cover transition-all duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />

            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Delete button for current image in edit mode */}
            {/* {editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(image[currentImage], currentImage);
                }}
                disabled={deleting === image[currentImage]}
                className="absolute top-6 right-6 w-10 h-10 bg-red-500/80 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600/90 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === image[currentImage] ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )} */}

            {/* Modern image counter */}
            <div className="absolute top-6 left-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {currentImage + 1} of {image.length}
              </div>
            </div>

            {/* Navigation arrows */}
            {image.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(currentImage === 0 ? image.length - 1 : currentImage - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  disabled={editMode && isDragActive}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(currentImage === image.length - 1 ? 0 : currentImage + 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  disabled={editMode && isDragActive}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced thumbnail navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {image.length > 6 && (
            <div className="text-xs text-gray-500">Scroll to see more</div>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide px-2">
            {image.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className={`relative flex-shrink-0 group transition-all duration-300 ${editMode ? 'p-2' : 'p-1'}`}
              >
                <button
                  className={`relative block w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${currentImage === i
                    ? "ring-3 ring-tripswift-blue ring-offset-2 transform scale-105 shadow-xl"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 hover:transform hover:scale-102 shadow-md hover:shadow-lg"
                    }`}
                  onClick={() => setCurrentImage(i)}
                >
                  <Image
                    src={img}
                    alt={`Gallery image ${i + 1}`}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-110"
                    sizes="80px"
                  />

                  {/* Active state overlay */}
                  {currentImage === i && (
                    <div className="absolute inset-0 bg-tripswift-blue/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

                  {/* Image number indicator */}
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {i + 1}
                  </div>

                  {/* Edit mode indicator */}
                  {editMode && (
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse"></div>
                  )}
                </button>

                {/* Enhanced Delete button for thumbnails in edit mode */}
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(img, i);
                    }}
                    disabled={deleting === img}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 border-2 border-white"
                    title="Delete image"
                  >
                    {deleting === img ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 font-bold" />
                    )}
                  </button>
                )}

                {/* Subtle border glow effect for better visibility */}
                {editMode && (
                  <div className="absolute inset-0 rounded-xl border border-red-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced scroll progress indicator */}
          {image.length > 5 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-gray-200/50">
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(6, Math.ceil(image.length / 2)) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === 0
                        ? 'w-8 bg-gradient-to-r from-tripswift-blue to-purple-600'
                        : i === 1
                          ? 'w-4 bg-tripswift-blue/60'
                          : 'w-2 bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium ml-1">
                  {image.length} images
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        setOpen={setUploadDialogOpen}
        files={files}
        setFiles={setFiles}
        rejected={rejected}
        setRejected={setRejected}
        uploading={uploading}
        onUpload={handleImageUpload}
        fileInputRef={fileInputRef}
        removeFile={removeFile}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setImageToDelete(null);
              }}
              disabled={deleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (imageToDelete) {
                  handleDeleteImage(imageToDelete.url, imageToDelete.index);
                }
              }}
              disabled={deleting !== null}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Upload Dialog Component (unchanged from original)
function UploadDialog({
  open,
  setOpen,
  files,
  setFiles,
  rejected,
  setRejected,
  uploading,
  onUpload,
  fileInputRef,
  removeFile
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  files: IFileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<IFileWithPreview[]>>;
  rejected: FileRejection[];
  setRejected: React.Dispatch<React.SetStateAction<FileRejection[]>>;
  uploading: boolean;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  removeFile?: (name: string) => void;
}) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles?.length) {
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map(file =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }

    if (rejectedFiles?.length) {
      setRejected(previousFiles => [...previousFiles, ...rejectedFiles]);
    }
  }, [setFiles, setRejected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop,
  });

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const filesWithPreview = selectedFiles.map(file =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setFiles(prev => [...prev, ...filesWithPreview]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl max-w-[95vw] rounded-lg border-0 shadow-xl mx-2 sm:mx-0">
        <DialogHeader className="space-y-1 pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-tripswift-blue to-purple-600 bg-clip-text text-transparent">
            Upload Property Images
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-xs sm:text-sm">
            Upload high-quality images to showcase your property (max 10 images)
          </DialogDescription>
        </DialogHeader>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 shadow-lg mx-2">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-tripswift-blue" />
              <div>
                <div className="font-semibold text-gray-800 text-xs sm:text-sm">Uploading images...</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Processing your images</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {/* Compact Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
              ? 'border-tripswift-blue bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.01] shadow-md'
              : 'border-gray-300 hover:border-tripswift-blue hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-sm'
              }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div
                className={`mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${isDragActive
                  ? 'bg-gradient-to-br from-tripswift-blue to-purple-600 text-white shadow-md'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400'
                  }`}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                {isDragActive ? (
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base font-semibold text-tripswift-blue">Drop images here</p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Release to upload</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base font-semibold text-gray-700">Drag & drop images</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      or <span className="text-tripswift-blue font-medium">click to browse</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Preview Grid */}
          {files.length > 0 && (
            <Card className="border-0 shadow-sm rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50">
              <CardContent className="p-3 sm:p-4">
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-1 text-xs sm:text-sm">
                  <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-tripswift-blue" />
                  Preview ({files.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-3">
                  {files.map((file) => (
                    <div key={file.name} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden bg-white shadow-xs ring-1 ring-gray-200 hover:shadow-sm transition-all duration-150">
                        <Image
                          src={file.preview}
                          height={80}
                          width={80}
                          alt="Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      {removeFile && (
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm hover:scale-105 text-[8px]"
                        >
                          <Trash2 className="w-2 h-2" />
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] p-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-50 transition-all duration-150 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onUpload}
              disabled={uploading || files.length === 0}
              className="bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-tripswift-dark-blue hover:to-purple-700 text-white shadow-sm hover:shadow-md px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1" />
                  Upload {files.length}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}