import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, Edit, ImagePlus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Material {
  id: string;
  name: string;
  photo: string; // base64 или URL
  quantity: number;
  cabinetNumber: string;
  cabinetSide: 'left' | 'right';
  shelfNumber: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function MaterialsManagement() {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('crm_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Форма
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cabinetNumber, setCabinetNumber] = useState('');
  const [cabinetSide, setCabinetSide] = useState<'left' | 'right'>('left');
  const [shelfNumber, setShelfNumber] = useState('');
  const [description, setDescription] = useState('');

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

  const resetForm = () => {
    setName('');
    setPhoto('');
    setQuantity('1');
    setCabinetNumber('');
    setCabinetSide('left');
    setShelfNumber('');
    setDescription('');
    setEditingMaterial(null);
  };

  const handleAddMaterial = () => {
    if (!name.trim()) return;

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: name.trim(),
      photo,
      quantity: parseInt(quantity) || 1,
      cabinetNumber: cabinetNumber.trim(),
      cabinetSide,
      shelfNumber: shelfNumber.trim(),
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
      quantity: parseInt(quantity) || 1,
      cabinetNumber: cabinetNumber.trim(),
      cabinetSide,
      shelfNumber: shelfNumber.trim(),
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

  const handleEditClick = (material: Material) => {
    setEditingMaterial(material);
    setName(material.name);
    setPhoto(material.photo);
    setQuantity(material.quantity.toString());
    setCabinetNumber(material.cabinetNumber);
    setCabinetSide(material.cabinetSide);
    setShelfNumber(material.shelfNumber);
    setDescription(material.description);
    setShowDialog(true);
  };

  const handleAddClick = () => {
    resetForm();
    setShowDialog(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Материалы и игрушки</CardTitle>
              <CardDescription>
                Физические материалы, используемые специалистами в занятиях
              </CardDescription>
            </div>
            <Button onClick={handleAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить материал
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Нет добавленных материалов</p>
              <p className="text-sm mt-2">Нажмите "Добавить материал" чтобы создать первую карточку</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => (
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
                      {material.cabinetNumber && (
                        <span>
                          Шкаф {material.cabinetNumber}, {material.cabinetSide === 'left' ? 'левая' : 'правая'} сторона
                          {material.shelfNumber && `, полка ${material.shelfNumber}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(material)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Подробнее
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
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
              {editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о физическом материале или игрушке
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
              </div>
            </div>

            {/* Название */}
            <div className="space-y-2">
              <Label>Название материала *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Пирамидка красная, Кубики деревянные"
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
                />
              </div>

              <div className="space-y-2">
                <Label>Сторона шкафа</Label>
                <Select value={cabinetSide} onValueChange={(val) => setCabinetSide(val as 'left' | 'right')}>
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
                />
              </div>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label>Описание материала</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Дополнительная информация о материале, для каких занятий используется, особенности применения..."
                rows={4}
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 pt-4">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
