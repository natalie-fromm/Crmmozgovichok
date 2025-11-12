import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { FileText, Image, Video, Upload, Trash2, Download, Eye, Plus, Edit, X, GripVertical, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Specialist } from "../types";

interface KnowledgeFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video';
  data: string;
  size: string;
}

interface KnowledgeProject {
  id: string;
  name: string;
  description: string;
  category: 'regulations' | 'science' | 'ideas';
  files: KnowledgeFile[];
  createdDate: string;
  updatedDate: string;
  accessibleSpecialistIds: string[];
  order: number;
}

interface KnowledgeBaseProps {
  specialists: Specialist[];
  onUpdate?: () => void;
}

export function KnowledgeBase({ specialists, onUpdate }: KnowledgeBaseProps) {
  const [projects, setProjects] = useState<KnowledgeProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'regulations' | 'science' | 'ideas'>('regulations');
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<KnowledgeProject | null>(null);
  const [viewingProject, setViewingProject] = useState<KnowledgeProject | null>(null);
  
  // Форма для нового/редактируемого проекта
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectFiles, setProjectFiles] = useState<KnowledgeFile[]>([]);
  const [projectAccessibleSpecialistIds, setProjectAccessibleSpecialistIds] = useState<string[]>([]);

  useEffect(() => {
    const savedProjects = localStorage.getItem('knowledgeBaseProjects');
    if (savedProjects) {
      const loadedProjects = JSON.parse(savedProjects);
      // Добавляем accessibleSpecialistIds для старых проектов, если его нет
      const migratedProjects = loadedProjects.map((project: KnowledgeProject) => ({
        ...project,
        accessibleSpecialistIds: project.accessibleSpecialistIds || [],
        order: project.order !== undefined ? project.order : 0
      }));
      setProjects(migratedProjects);
    }
  }, []);

  const saveProjects = (newProjects: KnowledgeProject[]) => {
    setProjects(newProjects);
    localStorage.setItem('knowledgeBaseProjects', JSON.stringify(newProjects));
    onUpdate?.();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const newFiles: KnowledgeFile[] = [];

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
          data: result,
          size: formatFileSize(file.size)
        };

        newFiles.push(newFile);
        setProjectFiles(prev => [...prev, newFile]);
      };

      reader.readAsDataURL(file);
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

  const deleteFileFromProject = (fileId: string) => {
    setProjectFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const saveProject = () => {
    if (!projectName.trim()) {
      alert('Введите наименование проекта');
      return;
    }

    if (editingProject) {
      // Редактирование существующего проекта
      const updatedProjects = projects.map(p => 
        p.id === editingProject.id 
          ? {
              ...p,
              name: projectName,
              description: projectDescription,
              files: projectFiles,
              updatedDate: new Date().toISOString(),
              accessibleSpecialistIds: projectAccessibleSpecialistIds
            }
          : p
      );
      saveProjects(updatedProjects);
    } else {
      // Создание нового проекта
      const newProject: KnowledgeProject = {
        id: Date.now().toString() + Math.random(),
        name: projectName,
        description: projectDescription,
        category: selectedCategory,
        files: projectFiles,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        accessibleSpecialistIds: projectAccessibleSpecialistIds,
        order: projects.length
      };
      saveProjects([...projects, newProject]);
    }

    resetForm();
  };

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectFiles([]);
    setProjectAccessibleSpecialistIds([]);
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const startEditProject = (project: KnowledgeProject) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description);
    setProjectFiles(project.files);
    setSelectedCategory(project.category);
    setProjectAccessibleSpecialistIds(project.accessibleSpecialistIds);
    setShowProjectForm(true);
  };

  const deleteProject = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот проект знаний?')) {
      saveProjects(projects.filter(p => p.id !== id));
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

  const filteredProjects = (category: string) => {
    return projects.filter(p => p.category === category);
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
            Скачать фйл
          </Button>
        </div>
      );
    }
  };

  const renderProjectForm = () => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editingProject ? 'Редактировать проект' : 'Новый проект знаний'}</CardTitle>
              <CardDescription>
                {editingProject ? 'Внесите изменения в проект' : `Создайте новый проект в разделе ${getCategoryName(selectedCategory).toLowerCase()}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">Наименование проекта *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Введите название проекта"
            />
          </div>

          <div>
            <Label htmlFor="project-description">Текстовый комментарий</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Добавьте описание или комментарий к проекту"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor={`file-upload-form`}>Прикрепленные файлы</Label>
            <Label htmlFor={`file-upload-form`} className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors mt-2">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Нажмите для загрузки файлов
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Документы, изображения, видео
                </p>
              </div>
            </Label>
            <Input
              id={`file-upload-form`}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
          </div>

          {projectFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Загруженные файлы ({projectFiles.length})</Label>
              <div className="space-y-2">
                {projectFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
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
                        onClick={() => deleteFileFromProject(file.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Доступные специалисты</Label>
            <div className="space-y-2">
              {specialists.map(specialist => (
                <div key={specialist.id} className="flex items-center">
                  <Checkbox
                    id={`specialist-${specialist.id}`}
                    checked={projectAccessibleSpecialistIds.includes(specialist.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProjectAccessibleSpecialistIds(prev => [...prev, specialist.id]);
                      } else {
                        setProjectAccessibleSpecialistIds(prev => prev.filter(id => id !== specialist.id));
                      }
                    }}
                  />
                  <Label htmlFor={`specialist-${specialist.id}`} className="ml-2">
                    {specialist.lastName} {specialist.firstName}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveProject}>
              {editingProject ? 'Сохранить изменения' : 'Создать проект'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCategoryContent = (category: 'regulations' | 'science' | 'ideas') => {
    const categoryProjects = filteredProjects(category).sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', projectId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetProjectId: string) => {
      e.preventDefault();
      const draggedProjectId = e.dataTransfer.getData('text/html');
      
      if (draggedProjectId === targetProjectId) return;

      const draggedIndex = categoryProjects.findIndex(p => p.id === draggedProjectId);
      const targetIndex = categoryProjects.findIndex(p => p.id === targetProjectId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const newProjects = [...categoryProjects];
      const [draggedProject] = newProjects.splice(draggedIndex, 1);
      newProjects.splice(targetIndex, 0, draggedProject);

      // Обновляем порядок
      const updatedProjects = newProjects.map((project, index) => ({
        ...project,
        order: index
      }));

      // Объединяем с проектами других категорий
      const otherProjects = projects.filter(p => p.category !== category);
      saveProjects([...otherProjects, ...updatedProjects]);
    };

    const renderProjectContent = (project: KnowledgeProject) => {
      const documentFiles = project.files.filter(f => f.type === 'document');
      const videoFiles = project.files.filter(f => f.type === 'video');
      const imageFiles = project.files.filter(f => f.type === 'image');

      return (
        <div className="space-y-6">
          {/* Блок для текста */}
          {project.description && (
            <div>
              <Label className="text-base">Содержание:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-3 bg-gray-50 rounded-lg">
                {project.description}
              </p>
            </div>
          )}

          {/* Блок для текстовых файлов */}
          {documentFiles.length > 0 && (
            <div>
              <Label className="text-base">Текстовые файлы ({documentFiles.length}):</Label>
              <div className="space-y-2 mt-2">
                {documentFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Блок для видео */}
          {videoFiles.length > 0 && (
            <div>
              <Label className="text-base">Видео ({videoFiles.length}):</Label>
              <div className="space-y-2 mt-2">
                {videoFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Блок для изображений */}
          {imageFiles.length > 0 && (
            <div>
              <Label className="text-base">Изображения ({imageFiles.length}):</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {imageFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Доступные специалисты */}
          {project.accessibleSpecialistIds.length > 0 && (
            <div>
              <Label className="text-base">Доступ предоставлен ({project.accessibleSpecialistIds.length}):</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.accessibleSpecialistIds.map(id => {
                  const specialist = specialists.find(s => s.id === id);
                  return specialist ? (
                    <div key={id} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-sm">
                      <Users className="w-3 h-3" />
                      <span>{specialist.lastName} {specialist.firstName}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {!showProjectForm && (
          <Button 
            onClick={() => {
              setSelectedCategory(category);
              setShowProjectForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать проект
          </Button>
        )}

        {showProjectForm && selectedCategory === category && renderProjectForm()}

        {categoryProjects.length > 0 ? (
          <div className="space-y-4">
            {categoryProjects.map(project => {
              return (
                <Card 
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, project.id)}
                  className="cursor-move"
                >
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setViewingProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                          {project.description && (
                            <CardDescription className="mt-2 line-clamp-2">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditProject(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          !showProjectForm && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Пока нет проектов в этом разделе</p>
                <p className="text-sm text-gray-400 mt-1">Нажмите кнопку "Создать проект" чтобы добавить первый проект</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="regulations" onValueChange={(value) => {
        setSelectedCategory(value as 'regulations' | 'science' | 'ideas');
        if (showProjectForm && !editingProject) {
          resetForm();
        }
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regulations">
            Регламенты ({filteredProjects('regulations').length})
          </TabsTrigger>
          <TabsTrigger value="science">
            Наука ({filteredProjects('science').length})
          </TabsTrigger>
          <TabsTrigger value="ideas">
            Идеи ({filteredProjects('ideas').length})
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
                  {previewFile.size}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {previewFile && renderFilePreview(previewFile)}
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра проекта */}
      <Dialog open={!!viewingProject} onOpenChange={(open) => !open && setViewingProject(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{viewingProject?.name}</DialogTitle>
                <DialogDescription>
                  {viewingProject && getCategoryName(viewingProject.category)}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewingProject) {
                      startEditProject(viewingProject);
                      setViewingProject(null);
                    }
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              </div>
            </div>
          </DialogHeader>
          {viewingProject && (
            <div className="mt-4">
              {(() => {
                const documentFiles = viewingProject.files.filter(f => f.type === 'document');
                const videoFiles = viewingProject.files.filter(f => f.type === 'video');
                const imageFiles = viewingProject.files.filter(f => f.type === 'image');

                return (
                  <div className="space-y-6">
                    {/* Блок для текста */}
                    {viewingProject.description && (
                      <div>
                        <Label className="text-base">Содержание:</Label>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-3 bg-gray-50 rounded-lg">
                          {viewingProject.description}
                        </p>
                      </div>
                    )}

                    {/* Блок для текстовых файлов */}
                    {documentFiles.length > 0 && (
                      <div>
                        <Label className="text-base">Текстовые файлы ({documentFiles.length}):</Label>
                        <div className="space-y-2 mt-2">
                          {documentFiles.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{file.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Блок для видео */}
                    {videoFiles.length > 0 && (
                      <div>
                        <Label className="text-base">Видео ({videoFiles.length}):</Label>
                        <div className="space-y-2 mt-2">
                          {videoFiles.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{file.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Блок для изображений */}
                    {imageFiles.length > 0 && (
                      <div>
                        <Label className="text-base">Изображения ({imageFiles.length}):</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {imageFiles.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{file.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Доступные специалисты */}
                    {viewingProject.accessibleSpecialistIds.length > 0 && (
                      <div>
                        <Label className="text-base">Доступ предоставлен ({viewingProject.accessibleSpecialistIds.length}):</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {viewingProject.accessibleSpecialistIds.map(id => {
                            const specialist = specialists.find(s => s.id === id);
                            return specialist ? (
                              <div key={id} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-sm">
                                <Users className="w-3 h-3" />
                                <span>{specialist.lastName} {specialist.firstName}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}