import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, Edit, ImagePlus, X, Eye, Archive, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MaterialDepreciation {
  photo: string;
  quantity: number;
  reason: string;
  date: string;
  status?: 'pending' | 'restored' | 'liquidated'; // Статус амортизации
}

interface Material {
  id: string;
  name: string;
  photo: string; // base64 или URL - для обратной совместимости
  photos?: string[]; // Массив фотографий
  quantity: number;
  cabinetNumber: string;
  cabinetSide: 'left' | 'right';
  shelfNumber: string;
  floor?: 'upper' | 'lower'; // Этаж
  otherLocation?: string; // Другое место
  description: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean; // Флаг архивации
  depreciation?: MaterialDepreciation; // Данные амортизации
}

interface MaterialsManagementProps {
  isSpecialist?: boolean; // Флаг для определения роли пользователя
}

export function MaterialsManagement({ isSpecialist = false }: MaterialsManagementProps) {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('crm_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState(false); // Режим просмотра или редактирования
  const [listViewMode, setListViewMode] = useState<'active' | 'archive' | 'depreciation'>('active'); // Режим списка: активные, архивные или амортизированные
  const [depreciationStatusFilter, setDepreciationStatusFilter] = useState<'pending' | 'restored' | 'liquidated'>('pending'); // Фильтр статуса амортизации

  // Форма
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [cabinetNumber, setCabinetNumber] = useState('');
  const [cabinetSide, setCabinetSide] = useState<'left' | 'right'>('left');
  const [shelfNumber, setShelfNumber] = useState('');
  const [floor, setFloor] = useState<'upper' | 'lower' | ''>('');
  const [otherLocation, setOtherLocation] = useState('');
  const [description, setDescription] = useState('');

  // Амортизация
  const [showDepreciation, setShowDepreciation] = useState(false);
  const [depreciationPhoto, setDepreciationPhoto] = useState('');
  const [depreciationQuantity, setDepreciationQuantity] = useState('1');
  const [depreciationReason, setDepreciationReason] = useState('');

  const saveMaterials = (updatedMaterials: Material[]) => {
    setMaterials(updatedMaterials);
    localStorage.setItem('crm_materials', JSON.stringify(updatedMaterials));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPhotos([...photos, ...results]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setPhoto('');
    setPhotos([]);
    setQuantity('1');
    setCabinetNumber('');
    setCabinetSide('left');
    setShelfNumber('');
    setFloor('');
    setOtherLocation('');
    setDescription('');
    setEditingMaterial(null);
    setShowDepreciation(false);
    setDepreciationPhoto('');
    setDepreciationQuantity('1');
    setDepreciationReason('');
  };

  const handleAddMaterial = () => {
    if (!name.trim()) return;

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: name.trim(),
      photo,
      photos,
      quantity: parseInt(quantity) || 1,
      cabinetNumber: cabinetNumber.trim(),
      cabinetSide,
      shelfNumber: shelfNumber.trim(),
      floor: floor as 'upper' | 'lower' | undefined,
      otherLocation: otherLocation.trim() || undefined,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveMaterials([...materials, newMaterial]);
    resetForm();
    setShowDialog(false);
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial || !name.trim()) return;

    const updatedMaterial: Material = {
      ...editingMaterial,
      name: name.trim(),
      photo,
      photos,
      quantity: parseInt(quantity) || 1,
      cabinetNumber: cabinetNumber.trim(),
      cabinetSide,
      shelfNumber: shelfNumber.trim(),
      floor: floor as 'upper' | 'lower' | undefined,
      otherLocation: otherLocation.trim() || undefined,
      description: description.trim(),
      updatedAt: new Date().toISOString()
    };

    saveMaterials(materials.map(m => m.id === editingMaterial.id ? updatedMaterial : m));
    resetForm();
    setShowDialog(false);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      saveMaterials(materials.filter(m => m.id !== id));
    }
  };

  const handleViewClick = (material: Material) => {
    setEditingMaterial(material);
    setName(material.name);
    setPhoto(material.photo);
    setPhotos(material.photos || []);
    setQuantity(material.quantity.toString());
    setCabinetNumber(material.cabinetNumber);
    setCabinetSide(material.cabinetSide);
    setShelfNumber(material.shelfNumber);
    setFloor(material.floor as 'upper' | 'lower' | '');
    setOtherLocation(material.otherLocation || '');
    setDescription(material.description);
    setViewMode(true);
    setShowDialog(true);
  };

  const handleEditClick = (material: Material) => {
    setEditingMaterial(material);
    setName(material.name);
    setPhoto(material.photo);
    setPhotos(material.photos || []);
    setQuantity(material.quantity.toString());
    setCabinetNumber(material.cabinetNumber);
    setCabinetSide(material.cabinetSide);
    setShelfNumber(material.shelfNumber);
    setFloor(material.floor as 'upper' | 'lower' | '');
    setOtherLocation(material.otherLocation || '');
    setDescription(material.description);
    setViewMode(false);
    setShowDialog(true);
  };

  const handleAddClick = () => {
    resetForm();
    setViewMode(false);
    setShowDialog(true);
  };

  const switchToEditMode = () => {
    setViewMode(false);
  };

  const handleArchiveMaterial = (id: string) => {
    saveMaterials(materials.map(m => 
      m.id === id ? { ...m, archived: !m.archived } : m
    ));
  };

  // Обработк загрузки фото для амортизации
  const handleDepreciationPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDepreciationPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  // Сохранение данных амортизации
  const handleSaveDepreciation = () => {
    if (!editingMaterial) return;
    if (!depreciationQuantity || parseInt(depreciationQuantity) <= 0) {
      alert('Укажите корректное количество испорченного материала');
      return;
    }
    if (!depreciationReason.trim()) {
      alert('Укажите причину амортизации');
      return;
    }

    const depreciation: MaterialDepreciation = {
      photo: depreciationPhoto,
      quantity: parseInt(depreciationQuantity),
      reason: depreciationReason.trim(),
      date: new Date().toISOString(),
      status: 'pending'
    };

    const updatedMaterial: Material = {
      ...editingMaterial,
      depreciation,
      quantity: editingMaterial.quantity - depreciation.quantity,
      updatedAt: new Date().toISOString()
    };

    saveMaterials(materials.map(m => m.id === editingMaterial.id ? updatedMaterial : m));
    
    // Обновляем локальное состояние
    setQuantity(updatedMaterial.quantity.toString());
    setEditingMaterial(updatedMaterial);
    
    // Сбрасываем форму амортизации
    setShowDepreciation(false);
    setDepreciationPhoto('');
    setDepreciationQuantity('1');
    setDepreciationReason('');
    
    alert('Амортизация сохранена. Количество материала обновлено.');
  };

  // Восстановление материала
  const handleRestoreMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (!material || !material.depreciation) return;

    if (confirm(`Восстановить ${material.depreciation.quantity} шт. материала "${material.name}"?`)) {
      const updatedMaterial: Material = {
        ...material,
        quantity: material.quantity + material.depreciation.quantity,
        depreciation: {
          ...material.depreciation,
          status: 'restored'
        },
        updatedAt: new Date().toISOString()
      };
      saveMaterials(materials.map(m => m.id === id ? updatedMaterial : m));
    }
  };

  // Ликвидация материала
  const handleLiquidateMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (!material || !material.depreciation) return;

    if (confirm(`Ликвидировать материал "${material.name}"? Это действие нельзя отменить.`)) {
      const updatedMaterial: Material = {
        ...material,
        depreciation: {
          ...material.depreciation,
          status: 'liquidated'
        },
        updatedAt: new Date().toISOString()
      };
      saveMaterials(materials.map(m => m.id === id ? updatedMaterial : m));
    }
  };

  // Фильтрация материалов по режиму просмотра
  const filteredMaterials = materials
    .filter(material => {
      if (listViewMode === 'active') return !material.archived;
      if (listViewMode === 'archive') return material.archived;
      if (listViewMode === 'depreciation') return material.depreciation !== undefined;
      return true;
    })
    .filter(material => {
      if (listViewMode === 'depreciation' && material.depreciation) {
        return material.depreciation.status === depreciationStatusFilter;
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ru')); // Сортировка по алфавиту

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {listViewMode === 'active' && 'Материалы и игрушки'}
                {listViewMode === 'archive' && 'Архив материалов'}
                {listViewMode === 'depreciation' && 'Амортизация материалов'}
              </CardTitle>
              <CardDescription>
                {listViewMode === 'active' && 'Физические материалы, используемые специалистами в занятиях'}
                {listViewMode === 'archive' && 'Архивные материалы и игрушки'}
                {listViewMode === 'depreciation' && 'Материалы с зафиксированной амортизацией'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {listViewMode === 'active' ? (
                <>
                  {!isSpecialist && (
                    <>
                      <Button variant="outline" onClick={() => setListViewMode('depreciation')}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Амортизация ({materials.filter(m => m.depreciation?.status === 'pending').length})
                      </Button>
                      <Button variant="outline" onClick={() => setListViewMode('archive')}>
                        <Archive className="w-4 h-4 mr-2" />
                        Архив ({materials.filter(m => m.archived).length})
                      </Button>
                      <Button onClick={handleAddClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить материал
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Button variant="outline" onClick={() => setListViewMode('active')}>
                  Вернуться к материалам
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {listViewMode === 'archive' && materials.filter(m => m.archived).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Archive className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <p className="text-xl mb-2">В архиве нет материалов</p>
              <p className="text-sm">Архивные материалы будут отображаться здесь</p>
            </div>
          ) : listViewMode === 'depreciation' ? (
            // Таблица амортизации
            <div className="space-y-4">
              {/* Вкладки фильтров статусов */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={depreciationStatusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setDepreciationStatusFilter('pending')}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Ожидает ({materials.filter(m => m.depreciation?.status === 'pending').length})
                </Button>
                <Button
                  variant={depreciationStatusFilter === 'restored' ? 'default' : 'outline'}
                  onClick={() => setDepreciationStatusFilter('restored')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Восстановлено ({materials.filter(m => m.depreciation?.status === 'restored').length})
                </Button>
                <Button
                  variant={depreciationStatusFilter === 'liquidated' ? 'default' : 'outline'}
                  onClick={() => setDepreciationStatusFilter('liquidated')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Ликвидировано ({materials.filter(m => m.depreciation?.status === 'liquidated').length})
                </Button>
              </div>

              {/* Проверка на пустой список */}
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {depreciationStatusFilter === 'pending' && (
                    <>
                      <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                      <p>Нет материалов, ожидающих решения</p>
                    </>
                  )}
                  {depreciationStatusFilter === 'restored' && (
                    <>
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                      <p>Нет восстановленных материалов</p>
                    </>
                  )}
                  {depreciationStatusFilter === 'liquidated' && (
                    <>
                      <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                      <p>Нет ликвидированных материалов</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-3 text-left">Дата</th>
                        <th className="p-3 text-left">Наименование материала</th>
                        <th className="p-3 text-left">Фото</th>
                        <th className="p-3 text-left">Количество</th>
                        <th className="p-3 text-left">Причина</th>
                        <th className="p-3 text-left">Карточка</th>
                        <th className="p-3 text-left">Статус</th>
                        <th className="p-3 text-left">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.map((material) => {
                        if (!material.depreciation) return null;
                        const status = material.depreciation.status || 'pending';
                        
                        return (
                          <tr key={material.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm">
                              {new Date(material.depreciation.date).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="p-3">
                              <span className="font-semibold">{material.name}</span>
                            </td>
                            <td className="p-3">
                              {material.depreciation.photo ? (
                                <img
                                  src={material.depreciation.photo}
                                  alt={material.name}
                                  className="w-16 h-16 object-cover rounded-md border"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center">
                                  <ImagePlus className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-sm">
                              {material.depreciation.quantity} шт.
                            </td>
                            <td className="p-3 text-sm max-w-xs">
                              {material.depreciation.reason}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                onClick={() => handleViewClick(material)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Открыть
                              </Button>
                            </td>
                            <td className="p-3">
                              {status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  Ожидает
                                </span>
                              )}
                              {status === 'restored' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                  <CheckCircle className="w-3 h-3" />
                                  Восстановлено
                                </span>
                              )}
                              {status === 'liquidated' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                                  <XCircle className="w-3 h-3" />
                                  Ликвидировано
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                                    onClick={() => handleRestoreMaterial(material.id)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Восстановлено
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                                    onClick={() => handleLiquidateMaterial(material.id)}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Ликвидировано
                                  </Button>
                                </div>
                              )}
                              {status !== 'pending' && (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Фото слева */}
                  <div className="w-20 h-20 flex-shrink-0">
                    {material.photo ? (
                      <img
                        src={material.photo}
                        alt={material.name}
                        className="w-full h-full object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Название и краткая информация */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{material.name}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Количество: {material.quantity} шт.</span>
                      {material.photos && material.photos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImagePlus className="w-3 h-3" />
                          {material.photos.length} фото
                        </span>
                      )}
                      {material.cabinetNumber && (
                        <span>
                          Шкаф {material.cabinetNumber}, {material.cabinetSide === 'left' ? 'левая' : 'правая'} сторона
                          {material.shelfNumber && `, полка ${material.shelfNumber}`}
                        </span>
                      )}
                    </div>
                    {/* Показываем информацию об амортизации в разделе "Амортизация" */}
                    {listViewMode === 'depreciation' && material.depreciation && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                        <div className="flex items-center gap-1 text-orange-700">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="font-semibold">Амортизировано: {material.depreciation.quantity} шт.</span>
                        </div>
                        <div className="text-orange-600 mt-1">
                          Причина: {material.depreciation.reason}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Дата: {new Date(material.depreciation.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Действия */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                      onClick={() => handleViewClick(material)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Просмотр
                    </Button>
                    {!isSpecialist && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                          onClick={() => handleEditClick(material)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                        {listViewMode === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' }}
                            onClick={() => handleArchiveMaterial(material.id)}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Архивировать
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ backgroundColor: '#ff9800', color: 'white', borderColor: '#ff9800' }}
                            onClick={() => handleArchiveMaterial(material.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode ? 'Просмотр материала' : (editingMaterial ? 'Редактировать материал' : 'Добавить материал')}
            </DialogTitle>
            <DialogDescription>
              {viewMode ? 'Информация о физическом материале или игрушке' : 'Заполните информацию о физическом материале или игрушке'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Фото */}
            <div className="space-y-2">
              <Label>Фото материала</Label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 flex-shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center">
                      <ImagePlus className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {!viewMode && (
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <p className="text-sm text-muted-foreground">
                      Загрузите фотографию материала для удобства поиска
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Дополнительные фотографии */}
            <div className="space-y-2">
              <Label>Дополнительные фотографии материала</Label>
              {!viewMode && (
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    {photos.length > 0 ? (
                      <img
                        src={photos[0]}
                        alt="Preview"
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
                      multiple
                      onChange={handlePhotosUpload}
                    />
                    <p className="text-sm text-muted-foreground">
                      Загрузите дополнительные фотографии материала
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    {!viewMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Название */}
            <div className="space-y-2">
              <Label>Название материала *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Пирамидка красная, Кубики деревянные"
                disabled={viewMode}
              />
            </div>

            {/* Количество */}
            <div className="space-y-2">
              <Label>Количество в наличии *</Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                disabled={viewMode}
              />
            </div>

            {/* Расположение */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Номер шкафа</Label>
                <Input
                  value={cabinetNumber}
                  onChange={(e) => setCabinetNumber(e.target.value)}
                  placeholder="1"
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Сторона шкафа</Label>
                <Select value={cabinetSide} onValueChange={(val) => setCabinetSide(val as 'left' | 'right')} disabled={viewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Левая</SelectItem>
                    <SelectItem value="right">Правая</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Номер полки</Label>
                <Input
                  value={shelfNumber}
                  onChange={(e) => setShelfNumber(e.target.value)}
                  placeholder="1"
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Этаж */}
            <div className="space-y-2">
              <Label>Этаж</Label>
              <Select value={floor} onValueChange={(val) => setFloor(val as 'upper' | 'lower' | '')} disabled={viewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upper">Верхний</SelectItem>
                  <SelectItem value="lower">Нижний</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Другое место */}
            <div className="space-y-2">
              <Label>Другое место</Label>
              <Input
                value={otherLocation}
                onChange={(e) => setOtherLocation(e.target.value)}
                placeholder="Например: В кабинете 101"
                disabled={viewMode}
              />
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label>Описание материала</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Дополнительная информация о материале, для каких занятий используется, особенности применения..."
                rows={4}
                disabled={viewMode}
              />
            </div>

            {/* Амортизация - показывается только в режиме просмотра */}
            {viewMode && editingMaterial && showDepreciation && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base">Амортизация материала</CardTitle>
                  <CardDescription>
                    Укажите информацию об испорченном материале
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Фото</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 flex-shrink-0">
                        {depreciationPhoto ? (
                          <img
                            src={depreciationPhoto}
                            alt="Preview"
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
                          onChange={handleDepreciationPhotoUpload}
                        />
                        <p className="text-sm text-muted-foreground">
                          Загрузите фотографию испорченного материала
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Количество *</Label>
                    <Input
                      type="number"
                      min="1"
                      max={editingMaterial.quantity}
                      value={depreciationQuantity}
                      onChange={(e) => setDepreciationQuantity(e.target.value)}
                      placeholder="1"
                    />
                    <p className="text-sm text-muted-foreground">
                      Доступно: {editingMaterial.quantity} шт.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Причина *</Label>
                    <Textarea
                      value={depreciationReason}
                      onChange={(e) => setDepreciationReason(e.target.value)}
                      placeholder="Укажите причину: поломка, износ, потеря и т.д."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSaveDepreciation}
                    style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                    className="w-full"
                  >
                    Сохранить амортизацию
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Кнопки */}
            <div className="flex gap-2 pt-4">
              {viewMode ? (
                <>
                  <Button
                    variant="outline"
                    style={{ backgroundColor: '#ff9800', color: 'white', borderColor: '#ff9800' }}
                    onClick={() => setShowDepreciation(!showDepreciation)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {showDepreciation ? 'Скрыть' : 'Испорчено'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowDialog(false);
                    }}
                  >
                    Закрыть
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={editingMaterial ? handleUpdateMaterial : handleAddMaterial}>
                    {editingMaterial ? 'Сохранить изменения' : 'Добавить материал'}
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
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}