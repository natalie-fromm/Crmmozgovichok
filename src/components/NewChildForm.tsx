import { useState } from "react";
import { Child } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X } from "lucide-react";

interface NewChildFormProps {
  onSave: (child: Child) => void;
  onCancel: () => void;
}

export function NewChildForm({ onSave, onCancel }: NewChildFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    lastName: "",
    firstName: "",
    middleName: "",
    age: "",
    birthDate: "",
    motherName: "",
    fatherName: "",
    firstVisitDate: new Date().toISOString().split('T')[0],
    primaryComplaints: "",
    diagnosticInfo: "",
    otherActivities: "",
    interests: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Объединяем фамилию, имя и отчество в полное имя
    const fullName = `${formData.lastName} ${formData.firstName} ${formData.middleName}`.trim();

    const newChild: Child = {
      id: `child-${Date.now()}`,
      code: formData.code,
      name: fullName,
      age: parseInt(formData.age),
      birthDate: formData.birthDate,
      motherName: formData.motherName,
      fatherName: formData.fatherName,
      firstVisitDate: formData.firstVisitDate,
      primaryComplaints: formData.primaryComplaints,
      additionalComplaints: [],
      sessions: [],
      monthlyReports: [],
      archived: false,
      diagnosticInfo: formData.diagnosticInfo,
      otherActivities: formData.otherActivities,
      interests: formData.interests,
    };

    onSave(newChild);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Создание новой карточки</CardTitle>
              <CardDescription>Заполните информацию о ребенке</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Шифр *</Label>
                <Input
                  id="code"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Например: М001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия ребенка *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Иванов"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя ребенка *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Иван"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество ребенка</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="Иванович"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Возраст *</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  min="1"
                  max="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Дата рождения *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">ФИО матери</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="Иванова Мария Петровна"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">ФИО отца</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Иванов Петр Сергеевич"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstVisitDate">Дата первого обращения *</Label>
              <Input
                id="firstVisitDate"
                type="date"
                required
                value={formData.firstVisitDate}
                onChange={(e) => setFormData({ ...formData, firstVisitDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryComplaints">Основные жалобы *</Label>
              <Textarea
                id="primaryComplaints"
                required
                value={formData.primaryComplaints}
                onChange={(e) => setFormData({ ...formData, primaryComplaints: e.target.value })}
                placeholder="Опишите основные жалобы и причины обращения..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosticInfo">Значимое из диагностики</Label>
              <Textarea
                id="diagnosticInfo"
                value={formData.diagnosticInfo}
                onChange={(e) => setFormData({ ...formData, diagnosticInfo: e.target.value })}
                placeholder="Опишите значимые моменты из диагностики..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherActivities">Посещение иных занятий</Label>
              <Textarea
                id="otherActivities"
                value={formData.otherActivities}
                onChange={(e) => setFormData({ ...formData, otherActivities: e.target.value })}
                placeholder="Какие другие занятия посещает ребенок..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Интересы ребенка</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Что интересует ребенка..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Отмена
              </Button>
              <Button type="submit">
                Создать карточку
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}