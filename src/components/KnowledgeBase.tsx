import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Image, Video, Upload, Trash2, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface KnowledgeFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video';
  category: 'regulations' | 'science' | 'ideas';
  data: string;
  uploadDate: string;
  size: string;
}

interface KnowledgeBaseProps {
  onUpdate?: () => void;
}

export function KnowledgeBase({ onUpdate }: KnowledgeBaseProps) {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'regulations' | 'science' | 'ideas'>('regulations');
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null);

  useEffect(() => {
    const savedFiles = localStorage.getItem('knowledgeBaseFiles');
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  const saveFiles = (newFiles: KnowledgeFile[]) => {
    setFiles(newFiles);
    localStorage.setItem('knowledgeBaseFiles', JSON.stringify(newFiles));
    onUpdate?.();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        let fileType: 'document' | 'image' | 'video' = 'document';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        }

        const newFile: KnowledgeFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: fileType,
          category: selectedCategory,
          data: result,
          uploadDate: new Date().toISOString(),
          size: formatFileSize(file.size)
        };

        saveFiles([...files, newFile]);
      };

      if (file.type.startsWith('image/') || file.type.startsWith('text/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    event.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const deleteFile = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      saveFiles(files.filter(f => f.id !== id));
    }
  };

  const downloadFile = (file: KnowledgeFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'regulations':
        return 'Регламенты';
      case 'science':
        return 'Наука';
      case 'ideas':
        return 'Идеи';
      default:
        return category;
    }
  };

  const filteredFiles = (category: string) => {
    return files.filter(f => f.category === category);
  };

  const renderFilePreview = (file: KnowledgeFile) => {
    if (file.type === 'image') {
      return (
        <div className="mt-4">
          <img src={file.data} alt={file.name} className="max-w-full max-h-96 rounded-lg" />
        </div>
      );
    } else if (file.type === 'video') {
      return (
        <div className="mt-4">
          <video controls className="max-w-full max-h-96 rounded-lg">
            <source src={file.data} />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      );
    } else {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Предпросмотр недоступен для этого типа файла.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => downloadFile(file)}
          >
            <Download className="w-4 h-4 mr-2" />
            Скачать файл
          </Button>
        </div>
      );
    }
  };

  const renderCategoryContent = (category: 'regulations' | 'science' | 'ideas') => {
    const categoryFiles = filteredFiles(category);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{getCategoryName(category)}</CardTitle>
          <CardDescription>
            Загрузите файлы в раздел {getCategoryName(category).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`file-upload-${category}`} className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Нажмите для загрузки файлов
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Документы, изображения, видео
                  </p>
                </div>
              </Label>
              <Input
                id={`file-upload-${category}`}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  setSelectedCategory(category);
                  handleFileUpload(e);
                }}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
            </div>

            {categoryFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Загруженные файлы ({categoryFiles.length})</h3>
                <div className="space-y-2">
                  {categoryFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.size} • {new Date(file.uploadDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="regulations">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regulations">
            Регламенты ({filteredFiles('regulations').length})
          </TabsTrigger>
          <TabsTrigger value="science">
            Наука ({filteredFiles('science').length})
          </TabsTrigger>
          <TabsTrigger value="ideas">
            Идеи ({filteredFiles('ideas').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulations">
          {renderCategoryContent('regulations')}
        </TabsContent>

        <TabsContent value="science">
          {renderCategoryContent('science')}
        </TabsContent>

        <TabsContent value="ideas">
          {renderCategoryContent('ideas')}
        </TabsContent>
      </Tabs>

      {/* Диалог предпросмотра */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile && (
                <>
                  {getCategoryName(previewFile.category)} • {previewFile.size} • 
                  {new Date(previewFile.uploadDate).toLocaleDateString('ru-RU')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {previewFile && renderFilePreview(previewFile)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
