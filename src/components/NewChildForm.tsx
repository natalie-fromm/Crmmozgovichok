import { useState, useEffect } from "react";
import { Child } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface NewChildFormProps {
  onSave: (child: Child) => void;
  onCancel: () => void;
  existingChildren?: Child[];
}

export function NewChildForm({ onSave, onCancel, existingChildren = [] }: NewChildFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    lastName: "",
    firstName: "",
    middleName: "",
    age: "",
    birthDate: "",
    motherName: "",
    motherPhone: "",
    fatherName: "",
    fatherPhone: "",
    firstVisitDate: new Date().toISOString().split('T')[0],
    primaryComplaints: "",
    diagnosticInfo: "",
    otherActivities: "",
    interests: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [codeWarning, setCodeWarning] = useState<string | null>(null);

  // Автоматический расчет возраста при изменении даты рождения
  useEffect(() => {
    if (formData.birthDate) {
      const today = new Date();
      const age = calculateAgeOnDate(formData.birthDate, today.toISOString().split('T')[0]);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.birthDate]);

  // Функция для получения порядкового номера буквы в русском алфавите
  const getAlphabetPosition = (letter: string): number => {
    const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const upperLetter = letter.toUpperCase();
    const position = alphabet.indexOf(upperLetter);
    return position >= 0 ? position + 1 : 0;
  };

  // Функция для вычисления возраста на дату обращения
  const calculateAgeOnDate = (birthDate: string, referenceDate: string): number => {
    const birth = new Date(birthDate);
    const reference = new Date(referenceDate);
    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Функция генерации шифра
  const generateCode = () => {
    if (!formData.lastName || !formData.firstName || !formData.birthDate || !formData.firstVisitDate) {
      setCodeWarning("Для генерации шифра заполните: Фамилию, Имя, Дату рождения и Дату первого обращения");
      return;
    }

    setCodeWarning(null);
    setError(null);

    // 1. Первая буква фамилии
    const lastNameFirstLetter = getAlphabetPosition(formData.lastName[0]);
    
    // 2. Первая буква имени
    const firstNameFirstLetter = getAlphabetPosition(formData.firstName[0]);
    
    // 3. Возраст на дату обращения
    const ageOnFirstVisit = calculateAgeOnDate(formData.birthDate, formData.firstVisitDate);
    
    // 4. День рождения (число месяца)
    const birthDay = new Date(formData.birthDate).getDate();
    
    // Базовый шифр
    let code = `${lastNameFirstLetter}-${firstNameFirstLetter}-${ageOnFirstVisit}-${birthDay}`;
    
    // Проверяем уникальность
    const codeExists = existingChildren.some(child => child.code === code);
    
    if (codeExists) {
      // Добавляем день первого обращения
      const firstVisitDay = new Date(formData.firstVisitDate).getDate();
      code = `${code}-${firstVisitDay}`;
      
      // Проверяем еще раз
      const extendedCodeExists = existingChildren.some(child => child.code === code);
      
      if (extendedCodeExists) {
        setCodeWarning(`⚠️ Шифр ${code} уже существует. Рекомендуется добавить дополнительный идентификатор вручную.`);
      } else {
        setCodeWarning(`ℹ️ Базовый шифр уже существовал. Добавлен день первого обращения: ${code}`);
      }
    }
    
    setFormData({ ...formData, code });
  };

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
      motherPhone: formData.motherPhone,
      fatherName: formData.fatherName,
      fatherPhone: formData.fatherPhone,
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

    // Проверка на уникальность кода
    if (existingChildren.some(child => child.code === newChild.code)) {
      setError("Дети с таким кодом уже существует. Пожалуйста, выберите другой код.");
      return;
    }

    onSave(newChild);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Создание новой карточки</CardTitle>
              <CardDescription>Заполните информацию о клиенте</CardDescription>
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
                <Button type="button" variant="outline" size="sm" onClick={generateCode} className="w-full mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Сгенерировать шифр
                </Button>
                {codeWarning && (
                  <Alert className="bg-amber-50 border-amber-200 mt-2">
                    <AlertDescription className="text-xs">{codeWarning}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия клиента *</Label>
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
                <Label htmlFor="firstName">Имя клиента *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Иван"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество клиента</Label>
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
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Заполнится автоматически"
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
              <Label htmlFor="motherPhone">Телефон матери</Label>
              <Input
                id="motherPhone"
                value={formData.motherPhone}
                onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
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
              <Label htmlFor="fatherPhone">Телефон отца</Label>
              <Input
                id="fatherPhone"
                value={formData.fatherPhone}
                onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
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
                placeholder="Какие другие занятия посещает клиент..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Интересы клиента</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Что интересует клиента..."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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