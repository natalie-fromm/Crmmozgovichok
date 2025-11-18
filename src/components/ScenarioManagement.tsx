import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Plus, Trash2, Edit, ImagePlus, X, ChevronUp, ChevronDown, Eye, Archive } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ScenarioStage {
  id: string;
  name: string;
  description: string;
  photo: string; // base64 - для обратной совместимости
  photos?: string[]; // Массив фотографий
  order: number;
}

interface Material {
  id: string;
  name: string;
  photo: string;
  quantity: number;
  cabinetNumber: string;
  cabinetSide: 'left' | 'right';
  shelfNumber: string;
  description: string;
}

interface ScenarioMaterial {
  materialId: string;
  quantity: number;
}

interface Scenario {
  id: string;
  name: string;
  categories: string[]; // Категории сценария
  coverPhoto: string; // главное фото для карточки
  stages: ScenarioStage[]; // этапы занятия
  materials: ScenarioMaterial[]; // материалы с количеством
  goal: string; // цель занятия
  instruction: string; // текст подачи задания
  createdAt: string;
  updatedAt: string;
  archived?: boolean; // архивный статус
}

export function ScenarioManagement({ isSpecialist = false }: { isSpecialist?: boolean }) {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem('crm_scenarios');
    return saved ? JSON.parse(saved) : [];
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('crm_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [viewingScenario, setViewingScenario] = useState<Scenario | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');

  // Форма
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [stages, setStages] = useState<ScenarioStage[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<ScenarioMaterial[]>([]);
  const [goal, setGoal] = useState('');
  const [instruction, setInstruction] = useState('');
  
  // Для добавления нового этапа
  const [newStageName, setNewStageName] = useState('');
  const [newStageDescription, setNewStageDescription] = useState('');
  const [newStagePhoto, setNewStagePhoto] = useState('');
  const [newStagePhotos, setNewStagePhotos] = useState<string[]>([]);
  
  // Для добавления материала
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('1');

  // Для поиска и фильтрации
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  const saveScenarios = (updatedScenarios: Scenario[]) => {
    setScenarios(updatedScenarios);
    localStorage.setItem('crm_scenarios', JSON.stringify(updatedScenarios));
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleStagePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewStagePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleStagePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises: Promise<string>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }

    Promise.all(promises).then((results) => {
      setNewStagePhotos([...newStagePhotos, ...results]);
    });
  };

  const removeNewStagePhoto = (index: number) => {
    setNewStagePhotos(newStagePhotos.filter((_, i) => i !== index));
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;

    const newStage: ScenarioStage = {
      id: Date.now().toString(),
      name: newStageName.trim(),
      description: newStageDescription.trim(),
      photo: newStagePhoto,
      photos: newStagePhotos,
      order: stages.length
    };

    setStages([...stages, newStage]);
    setNewStageName('');
    setNewStageDescription('');
    setNewStagePhoto('');
    setNewStagePhotos([]);
  };

  const handleRemoveStage = (stageId: string) => {
    const updatedStages = stages
      .filter(s => s.id !== stageId)
      .map((s, index) => ({ ...s, order: index }));
    setStages(updatedStages);
  };

  const handleUpdateStage = (stageId: string, field: keyof ScenarioStage, value: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, [field]: value } : s));
  };

  const handleMoveStageUp = (stageId: string) => {
    const index = stages.findIndex(s => s.id === stageId);
    if (index <= 0) return;

    const newStages = [...stages];
    [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
    setStages(newStages.map((s, i) => ({ ...s, order: i })));
  };

  const handleMoveStageDown = (stageId: string) => {
    const index = stages.findIndex(s => s.id === stageId);
    if (index >= stages.length - 1) return;

    const newStages = [...stages];
    [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
    setStages(newStages.map((s, i) => ({ ...s, order: i })));
  };

  const handleStagePhotoUploadForExisting = (stageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdateStage(stageId, 'photo', result);
    };
    reader.readAsDataURL(file);
  };

  const handleStagePhotosUploadForExisting = (stageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises: Promise<string>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }

    Promise.all(promises).then((results) => {
      setStages(stages.map(s => {
        if (s.id === stageId) {
          return { ...s, photos: [...(s.photos || []), ...results] };
        }
        return s;
      }));
    });
  };

  const removeStagePhoto = (stageId: string, photoIndex: number) => {
    setStages(stages.map(s => {
      if (s.id === stageId && s.photos) {
        return { ...s, photos: s.photos.filter((_, i) => i !== photoIndex) };
      }
      return s;
    }));
  };

  const resetForm = () => {
    setName('');
    setCategories([]);
    setCoverPhoto('');
    setStages([]);
    setSelectedMaterials([]);
    setGoal('');
    setInstruction('');
    setNewStageName('');
    setNewStageDescription('');
    setNewStagePhoto('');
    setNewStagePhotos([]);
    setEditingScenario(null);
  };

  const handleAddScenario = () => {
    if (!name.trim()) return;

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: name.trim(),
      categories,
      coverPhoto,
      stages: stages.sort((a, b) => a.order - b.order),
      materials: selectedMaterials,
      goal: goal.trim(),
      instruction: instruction.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveScenarios([...scenarios, newScenario]);
    resetForm();
    setShowDialog(false);
  };

  const handleUpdateScenario = () => {
    if (!editingScenario || !name.trim()) return;

    const updatedScenario: Scenario = {
      ...editingScenario,
      name: name.trim(),
      categories,
      coverPhoto,
      stages: stages.sort((a, b) => a.order - b.order),
      materials: selectedMaterials,
      goal: goal.trim(),
      instruction: instruction.trim(),
      updatedAt: new Date().toISOString()
    };

    saveScenarios(scenarios.map(s => s.id === editingScenario.id ? updatedScenario : s));
    resetForm();
    setShowDialog(false);
  };

  const handleDeleteScenario = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот сценарий?')) {
      saveScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const handleEditClick = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setName(scenario.name);
    setCategories(scenario.categories);
    setCoverPhoto(scenario.coverPhoto);
    setStages(scenario.stages || []);
    setSelectedMaterials(scenario.materials);
    setGoal(scenario.goal);
    setInstruction(scenario.instruction);
    setShowDialog(true);
  };

  const handleAddClick = () => {
    resetForm();
    setShowDialog(true);
  };

  const toggleMaterial = (materialId: string) => {
    const existingMaterial = selectedMaterials.find(sm => sm.materialId === materialId);
    if (existingMaterial) {
      setSelectedMaterials(selectedMaterials.filter(sm => sm.materialId !== materialId));
    } else {
      setSelectedMaterials([...selectedMaterials, { materialId, quantity: 1 }]);
    }
  };

  const handleAddMaterialClick = () => {
    if (!selectedMaterialId || !materialQuantity) return;

    const quantity = parseInt(materialQuantity);
    if (isNaN(quantity) || quantity < 1) return;

    const existingMaterial = selectedMaterials.find(sm => sm.materialId === selectedMaterialId);
    if (existingMaterial) {
      setSelectedMaterials(selectedMaterials.map(sm => 
        sm.materialId === selectedMaterialId ? { ...sm, quantity } : sm
      ));
    } else {
      setSelectedMaterials([...selectedMaterials, { materialId: selectedMaterialId, quantity }]);
    }

    setSelectedMaterialId('');
    setMaterialQuantity('1');
    setShowMaterialDialog(false);
  };

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(sm => sm.materialId !== materialId));
  };

  const handleUpdateMaterialQuantity = (materialId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedMaterials(selectedMaterials.map(sm => 
      sm.materialId === materialId ? { ...sm, quantity } : sm
    ));
  };

  const getAvailableMaterials = () => {
    return materials.filter(m => !selectedMaterials.some(sm => sm.materialId === m.id));
  };

  const handleViewClick = (scenario: Scenario) => {
    setViewingScenario(scenario);
    setShowViewDialog(true);
  };

  const handleArchiveScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;
    
    const updatedScenarios = scenarios.map(s => 
      s.id === id ? { ...s, archived: !s.archived } : s
    );
    saveScenarios(updatedScenarios);
  };

  // Список доступных категорий
  const availableCategories = [
    'Полевое',
    'СДВГ',
    'Аутизм',
    'РАС',
    'ЗПР',
    'ЗРР',
    'ДЦП',
    'Диспраксия',
    'Дислексия',
    'Дисграфия',
    'Агнозия зрительная',
    'Агнозия слуховая',
    'Агнозия тактильная',
    'Общее развитие',
    'Младенцы'
  ];

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const toggleFilterCategory = (category: string) => {
    if (filterCategories.includes(category)) {
      setFilterCategories(filterCategories.filter(c => c !== category));
    } else {
      setFilterCategories([...filterCategories, category]);
    }
  };

  // Фильтрация сценариев
  const filteredScenarios = scenarios.filter(scenario => {
    // Фильтр по режиму просмотра (активные или архивные)
    const matchesViewMode = viewMode === 'active' ? !scenario.archived : scenario.archived;

    // Фильтр по поиску (название)
    const matchesSearch = searchQuery.trim() === '' || 
      scenario.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Фильтр по категориям
    const matchesCategories = filterCategories.length === 0 ||
      filterCategories.some(filterCat => scenario.categories?.includes(filterCat));

    return matchesViewMode && matchesSearch && matchesCategories;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{viewMode === 'active' ? 'Сценарии занятий' : 'Архив сценариев'}</CardTitle>
              <CardDescription>
                {viewMode === 'active' 
                  ? 'Готовые сценарии занятий с описанием целей, материалов и инструкций'
                  : 'Архивные сценарии занятий'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isSpecialist && (
                viewMode === 'active' ? (
                  <>
                    <Button variant="outline" onClick={() => setViewMode('archive')}>
                      <Archive className="w-4 h-4 mr-2" />
                      Архив ({scenarios.filter(s => s.archived).length})
                    </Button>
                    <Button onClick={handleAddClick}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить сценарий
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setViewMode('active')}>
                    Вернуться к сценариям
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Поиск и фильтрация */}
          <div className="space-y-4 mb-6">
            {/* Поиск по названию */}
            <div className="space-y-2">
              <Label>Поиск по названию</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название сценария..."
                className="w-full"
              />
            </div>

            {/* Фильтр по категориям */}
            <div className="space-y-2">
              <Label>Фильтр по категориям</Label>
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`filter-${category}`}
                        checked={filterCategories.includes(category)}
                        onCheckedChange={() => toggleFilterCategory(category)}
                      />
                      <label
                        htmlFor={`filter-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                {filterCategories.length > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Выбрано категорий: {filterCategories.length}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterCategories([])}
                    >
                      Сбросить фильтр
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Результаты поиска */}
            {(searchQuery.trim() !== '' || filterCategories.length > 0) && (
              <div className="text-sm text-muted-foreground">
                Найдено сценариев: {filteredScenarios.length} из {viewMode === 'active' ? scenarios.filter(s => !s.archived).length : scenarios.filter(s => s.archived).length}
              </div>
            )}
          </div>

          {/* Список сценариев */}
          {scenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Нет добавленных сценариев</p>
              <p className="text-sm mt-2">Нажмите "Добавить сценарий" чтобы создать первый сценарий занятия</p>
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Не найдено сценариев по заданным критериям</p>
              <p className="text-sm mt-2">Попробуйте изменить параметры поиска или фильтра</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScenarios
                .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                .map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  {/* Фото слева */}
                  <div className="w-32 h-24 flex-shrink-0">
                    {scenario.coverPhoto ? (
                      <img
                        src={scenario.coverPhoto}
                        alt={scenario.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{scenario.name}</h3>
                    {scenario.categories && scenario.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {scenario.categories.map(category => (
                          <span
                            key={category}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {scenario.stages && scenario.stages.length > 0 && (
                        <span>Этапов: {scenario.stages.length}</span>
                      )}
                      {scenario.materials && scenario.materials.length > 0 && (
                        <span>Материалов: {scenario.materials.length}</span>
                      )}
                    </div>
                  </div>

                  {/* Кнопки управления */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewClick(scenario)}
                      style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Просмотр
                    </Button>
                    {!isSpecialist && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(scenario)}
                          style={{ backgroundColor: '#4caf50', color: 'white', borderColor: '#4caf50' }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteScenario(scenario.id)}
                          style={{ backgroundColor: '#f44336', color: 'white', borderColor: '#f44336' }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                        {viewMode === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveScenario(scenario.id)}
                            style={{ backgroundColor: '#9e9e9e', color: 'white', borderColor: '#9e9e9e' }}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Архивировать
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveScenario(scenario.id)}
                            style={{ backgroundColor: '#ff9800', color: 'white', borderColor: '#ff9800' }}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Разархивировать
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления/редактирования */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowDialog(open);
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScenario ? 'Редактировать сценарий' : 'Добавить сценарий'}
            </DialogTitle>
            <DialogDescription>
              Создайте подробный сценарий занятия с этапами и инструкциями
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Название */}
            <div className="space-y-2">
              <Label>Название сценария *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Развитие мелкой моторики с пирамидкой"
              />
            </div>

            {/* Категории */}
            <div className="space-y-2">
              <Label>Категории сценария</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {categories.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Выбрано: {categories.join(', ')}
                </p>
              )}
            </div>

            {/* Обложка */}
            <div className="space-y-2">
              <Label>Обложка сценария</Label>
              <div className="flex items-start gap-4">
                <div className="w-48 h-32 flex-shrink-0">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center">
                      <ImagePlus className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    Главное фото, которое будет отображаться на карточке сценария
                  </p>
                </div>
              </div>
            </div>

            {/* Цель */}
            <div className="space-y-2">
              <Label>Цель занятия</Label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Опишите цель этого занятия: какие навыки развиваются, что должен освоить ребенок..."
                rows={3}
              />
            </div>

            {/* Инструкция */}
            <div className="space-y-2">
              <Label>Текст подачи задания ребенку</Label>
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Как объяснить ребенку задание: что нужно делать, как выполнять упражнение..."
                rows={4}
              />
            </div>

            {/* Этапы занятия */}
            <div className="space-y-3">
              <Label>Этапы занятия</Label>
              
              {/* Список добавленных этапов */}
              {stages.length > 0 && (
                <div className="space-y-3 mb-4">
                  {stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage, index) => (
                      <div key={stage.id} className="border rounded-lg p-4 bg-gray-50">
                        {/* Верхняя строка: номер, кнопки управления и кнопка удаления */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Порядковый номер */}
                            <span className="text-sm font-semibold text-gray-500">
                              {index + 1}
                            </span>
                            
                            {/* Кнопки перемещения */}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMoveStageUp(stage.id)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMoveStageDown(stage.id)}
                                disabled={index === stages.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Кнопка удаления */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStage(stage.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>

                        {/* Фото и название в одной строке */}
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-32 flex-shrink-0 space-y-2">
                            {/* Превью фото */}
                            <div className="w-32 h-32">
                              {stage.photo ? (
                                <img
                                  src={stage.photo}
                                  alt={`Этап ${index + 1}`}
                                  className="w-full h-full object-cover rounded-md border"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center">
                                  <ImagePlus className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Загрузка файлов */}
                            <div className="space-y-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleStagePhotoUploadForExisting(stage.id, e)}
                                className="text-xs w-full"
                              />
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleStagePhotosUploadForExisting(stage.id, e)}
                                className="text-xs w-full"
                              />
                            </div>
                            
                            {/* Галерея дополнительных фото */}
                            {stage.photos && stage.photos.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {stage.photos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="relative">
                                    <img
                                      src={photo}
                                      alt={`Photo ${photoIndex + 1}`}
                                      className="w-16 h-16 object-cover rounded-md border"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-white rounded-full"
                                      onClick={() => removeStagePhoto(stage.id, photoIndex)}
                                    >
                                      <X className="w-3 h-3 text-red-600" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Название этапа */}
                          <div className="flex-1">
                            <Input
                              value={stage.name}
                              onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                              placeholder="Название этапа"
                            />
                          </div>
                        </div>
                        
                        {/* Описание этапа на всю ширину */}
                        <div className="w-full">
                          <Textarea
                            value={stage.description}
                            onChange={(e) => handleUpdateStage(stage.id, 'description', e.target.value)}
                            placeholder="Описание этапа..."
                            rows={6}
                            className="min-h-[120px] w-full"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Добавление нового этапа */}
              <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">Добавить новый этап</h4>
                
                {/* Фото и название в одной строке */}
                <div className="flex items-start gap-4">
                  <div className="w-32 flex-shrink-0 space-y-2">
                    {/* Превью фото */}
                    <div className="w-32 h-32">
                      {newStagePhoto ? (
                        <img
                          src={newStagePhoto}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center">
                          <ImagePlus className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Загрузка файлов */}
                    <div className="space-y-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleStagePhotoUpload}
                        className="text-xs w-full"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleStagePhotosUpload}
                        className="text-xs w-full"
                      />
                    </div>
                    
                    {/* Галерея дополнительных фото */}
                    {newStagePhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newStagePhotos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-0 right-0 h-5 w-5 p-0 bg-white rounded-full"
                              onClick={() => removeNewStagePhoto(index)}
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Название этапа */}
                  <div className="flex-1">
                    <Input
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="Название этапа *"
                    />
                  </div>
                </div>
                
                {/* Описание этапа на всю ширину */}
                <div className="w-full">
                  <Textarea
                    value={newStageDescription}
                    onChange={(e) => setNewStageDescription(e.target.value)}
                    placeholder="Описание этапа: что делать, как выполнять..."
                    rows={6}
                    className="min-h-[120px] w-full"
                  />
                </div>
                
                {/* Кнопка добавления */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStage}
                    disabled={!newStageName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить этап
                  </Button>
                </div>
              </div>
            </div>

            {/* Материалы */}
            <div className="space-y-3">
              <Label>Материалы для занятия</Label>
              
              {/* Список выбранных материалов */}
              {selectedMaterials.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {selectedMaterials.map((scenarioMaterial) => {
                    const material = materials.find(m => m.id === scenarioMaterial.materialId);
                    if (!material) return null;
                    
                    return (
                      <div
                        key={scenarioMaterial.materialId}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 flex-shrink-0">
                          {material.photo ? (
                            <img
                              src={material.photo}
                              alt={material.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <ImagePlus className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">
                            В наличии: {material.quantity} шт.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm whitespace-nowrap">Нужно:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={scenarioMaterial.quantity}
                            onChange={(e) => handleUpdateMaterialQuantity(
                              scenarioMaterial.materialId,
                              parseInt(e.target.value) || 1
                            )}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">шт.</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(scenarioMaterial.materialId)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedMaterials.length === 0 && (
                <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  Материалы не добавлены
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMaterialDialog(true)}
                disabled={materials.length === 0 || selectedMaterials.length >= materials.length}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить материал
              </Button>
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 pt-4">
              <Button onClick={editingScenario ? handleUpdateScenario : handleAddScenario}>
                {editingScenario ? 'Сохранить изменения' : 'Добавить сценарий'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowDialog(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления материала */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Добавить материал
            </DialogTitle>
            <DialogDescription>
              Выберите материал и укажите количество
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Материал */}
            <div className="space-y-2">
              <Label>Материал *</Label>
              <Select
                value={selectedMaterialId}
                onValueChange={setSelectedMaterialId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите материал" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMaterials().map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Количество */}
            <div className="space-y-2">
              <Label>Количество *</Label>
              <Input
                value={materialQuantity}
                onChange={(e) => setMaterialQuantity(e.target.value)}
                placeholder="Количество"
                type="number"
                min="1"
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddMaterialClick}>
                Добавить материал
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMaterialDialog(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра сценария */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingScenario ? viewingScenario.name : 'Сценарий'}
            </DialogTitle>
            <DialogDescription>
              Просмотр сценария занятия
            </DialogDescription>
          </DialogHeader>

          {viewingScenario && (
            <div className="space-y-6">
              {/* Обложка */}
              {viewingScenario.coverPhoto && (
                <div className="space-y-2">
                  <div className="w-full aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={viewingScenario.coverPhoto}
                      alt={viewingScenario.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Цель занятия */}
              {viewingScenario.goal && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Цель занятия</h3>
                  <p className="text-sm p-4 bg-blue-50 rounded-lg border border-blue-200">
                    {viewingScenario.goal}
                  </p>
                </div>
              )}

              {/* Текст подачи задания */}
              {viewingScenario.instruction && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Как объяснить ребенку</h3>
                  <p className="text-sm p-4 bg-green-50 rounded-lg border border-green-200">
                    {viewingScenario.instruction}
                  </p>
                </div>
              )}

              {/* Материалы */}
              {viewingScenario.materials && viewingScenario.materials.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Необходимые материалы</h3>
                  <div className="border rounded-lg p-4 space-y-2">
                    {viewingScenario.materials.map((scenarioMaterial) => {
                      const material = materials.find(m => m.id === scenarioMaterial.materialId);
                      if (!material) return null;
                      
                      return (
                        <div
                          key={scenarioMaterial.materialId}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-16 h-16 flex-shrink-0">
                            {material.photo ? (
                              <img
                                src={material.photo}
                                alt={material.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                <ImagePlus className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">
                              В наличии: {material.quantity} шт.
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{scenarioMaterial.quantity} шт.</p>
                            <p className="text-xs text-muted-foreground">нужно</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Этапы занятия */}
              {viewingScenario.stages && viewingScenario.stages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Этапы занятия</h3>
                  <div className="space-y-4">
                    {viewingScenario.stages
                      .sort((a, b) => a.order - b.order)
                      .map((stage, index) => (
                        <div key={stage.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start gap-4">
                            {/* Номер этапа */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>

                            <div className="flex-1 space-y-3">
                              {/* Название этапа */}
                              <h4 className="font-semibold">{stage.name}</h4>

                              {/* Фото этапа */}
                              {stage.photo && (
                                <div className="w-full max-w-md">
                                  <img
                                    src={stage.photo}
                                    alt={`Этап ${index + 1}`}
                                    className="w-full rounded-md border"
                                  />
                                </div>
                              )}

                              {/* Описание этапа */}
                              {stage.description && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {stage.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowViewDialog(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}