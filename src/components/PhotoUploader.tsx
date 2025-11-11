import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { PhotoAttachment } from "../types";
import { ImagePlus, X, ZoomIn } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PhotoUploaderProps {
  photos: PhotoAttachment[];
  onPhotosChange: (photos: PhotoAttachment[]) => void;
  disabled?: boolean;
}

export function PhotoUploader({ photos, onPhotosChange, disabled }: PhotoUploaderProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto: PhotoAttachment = {
            id: Date.now().toString() + Math.random(),
            url: event.target?.result as string,
            fileName: file.name,
            uploadedAt: new Date().toISOString()
          };
          onPhotosChange([...photos, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          Добавить фото
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {photos.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {photos.length} {photos.length === 1 ? 'фото' : 'фотографий'}
          </span>
        )}
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedPhoto(photo)}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                {!disabled && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(photo.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {photo.fileName}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.fileName}
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
