import { useState } from "react";
import { Specialist } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ArrowLeft, Save, User, Mail, Lock, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SpecialistCardViewProps {
  specialist: Specialist;
  onBack: () => void;
  onUpdate: (specialist: Specialist) => void;
}

export function SpecialistCardView({ specialist, onBack, onUpdate }: SpecialistCardViewProps) {
  const [editedSpecialist, setEditedSpecialist] = useState<Specialist>(specialist);

  const handleSave = () => {
    onUpdate(editedSpecialist);
  };

  const isActive = editedSpecialist.active !== false;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {editedSpecialist.lastName} {editedSpecialist.firstName}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant={editedSpecialist.role === 'admin' ? 'default' : 'outline'}>
                    {editedSpecialist.role === 'admin' ? 'Администратор' : 'Специалист'}
                  </Badge>
                  <Badge 
                    variant={isActive ? 'default' : 'secondary'}
                    style={isActive ? { backgroundColor: '#22c55e', color: 'white' } : {}}
                  >
                    {isActive ? 'Активен' : 'Деактивирован'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Фамилия</Label>
              <Input 
                value={editedSpecialist.lastName}
                onChange={(e) => setEditedSpecialist({...editedSpecialist, lastName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input 
                value={editedSpecialist.firstName}
                onChange={(e) => setEditedSpecialist({...editedSpecialist, firstName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input 
              type="email"
              value={editedSpecialist.email}
              onChange={(e) => setEditedSpecialist({...editedSpecialist, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Пароль
            </Label>
            <Input 
              type="password"
              value={editedSpecialist.password}
              onChange={(e) => setEditedSpecialist({...editedSpecialist, password: e.target.value})}
              placeholder="Введите новый пароль для изменения"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Роль
            </Label>
            <Select
              value={editedSpecialist.role}
              onValueChange={(value: "admin" | "specialist") => setEditedSpecialist({...editedSpecialist, role: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specialist">Специалист</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Дата регистрации</Label>
            <Input 
              value={editedSpecialist.createdAt 
                ? new Date(editedSpecialist.createdAt).toLocaleDateString('ru-RU')
                : 'Не указана'
              }
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>Дата деактивации</Label>
            <Input 
              value={editedSpecialist.deactivationDate 
                ? new Date(editedSpecialist.deactivationDate).toLocaleDateString('ru-RU')
                : '—'
              }
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>День рождения</Label>
            <Input 
              type="date"
              value={editedSpecialist.birthday || ''}
              onChange={(e) => setEditedSpecialist({...editedSpecialist, birthday: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Иное</Label>
            <Input 
              value={editedSpecialist.other || ''}
              onChange={(e) => setEditedSpecialist({...editedSpecialist, other: e.target.value})}
              placeholder="Дополнительная информация"
            />
          </div>

          <div className="space-y-2">
            <Label>Статус</Label>
            <Select
              value={isActive ? 'active' : 'inactive'}
              onValueChange={(value) => {
                const willBeActive = value === 'active';
                setEditedSpecialist({
                  ...editedSpecialist, 
                  active: willBeActive,
                  // Если деактивируем и даты еще нет - устанавливаем дату деактивации
                  // Если активируем - очищаем дату деактивации
                  deactivationDate: willBeActive ? undefined : (editedSpecialist.deactivationDate || new Date().toISOString())
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Деактивирован</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}