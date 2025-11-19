import { useState } from "react";
import { Specialist } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UserPlus, UserX, UserCheck, Users, Archive } from "lucide-react";
import { SpecialistCardView } from "./SpecialistCardView";

interface SpecialistsManagementProps {
  specialists: Specialist[];
  onUpdateSpecialists: (specialists: Specialist[]) => void;
}

export function SpecialistsManagement({ specialists, onUpdateSpecialists }: SpecialistsManagementProps) {
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');
  const [newSpecialist, setNewSpecialist] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "specialist" as "admin" | "specialist",
    category: undefined as "neuropsychologist" | "psychologist" | "speech_therapist" | "special_educator" | undefined,
    birthday: "",
    other: ""
  });

  const addSpecialist = () => {
    if (!newSpecialist.firstName || !newSpecialist.lastName || !newSpecialist.email || !newSpecialist.password) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    // Проверяем, не существует ли уже специалист с таким email
    if (specialists.some(s => s.email === newSpecialist.email)) {
      alert("Специалист с таким email уже существует");
      return;
    }

    const specialist: Specialist = {
      id: Date.now().toString(),
      firstName: newSpecialist.firstName,
      lastName: newSpecialist.lastName,
      email: newSpecialist.email,
      password: newSpecialist.password,
      role: newSpecialist.role,
      category: newSpecialist.category,
      active: true,
      createdAt: new Date().toISOString(),
      birthday: newSpecialist.birthday || undefined,
      other: newSpecialist.other || undefined
    };

    onUpdateSpecialists([...specialists, specialist]);
    setIsAddingSpecialist(false);
    setNewSpecialist({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "specialist",
      category: undefined,
      birthday: "",
      other: ""
    });
  };

  const toggleSpecialistStatus = (specialistId: string) => {
    onUpdateSpecialists(
      specialists.map(s => {
        if (s.id === specialistId) {
          const willBeActive = s.active === false ? true : false;
          return {
            ...s,
            active: willBeActive,
            // Если деактивируем - устанавливаем дату деактивации
            // Если активируем - очищаем дату деактивации
            deactivationDate: willBeActive ? undefined : new Date().toISOString()
          };
        }
        return s;
      })
    );
  };

  const handleUpdateSpecialist = (updatedSpecialist: Specialist) => {
    onUpdateSpecialists(
      specialists.map(s => s.id === updatedSpecialist.id ? updatedSpecialist : s)
    );
  };

  if (selectedSpecialist) {
    return (
      <SpecialistCardView
        specialist={selectedSpecialist}
        onBack={() => setSelectedSpecialist(null)}
        onUpdate={handleUpdateSpecialist}
      />
    );
  }

  // Фильтрация специалистов по режиму просмотра
  const filteredSpecialists = specialists.filter(specialist => {
    const isActive = specialist.active !== false;
    return viewMode === 'active' ? isActive : !isActive;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {viewMode === 'active' ? 'Управление специалистами' : 'Архив специалистов'}
            </CardTitle>
            <div className="flex gap-2">
              {viewMode === 'active' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('archive')}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Архив ({specialists.filter(s => s.active === false).length})
                  </Button>
                  <Dialog open={isAddingSpecialist} onOpenChange={setIsAddingSpecialist}>
                    <DialogTrigger asChild>
                      <Button style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Добавить специалиста
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Регистрация нового специалиста</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Фамилия</Label>
                            <Input 
                              value={newSpecialist.lastName}
                              onChange={(e) => setNewSpecialist({...newSpecialist, lastName: e.target.value})}
                              placeholder="Введите фамилию"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Имя</Label>
                            <Input 
                              value={newSpecialist.firstName}
                              onChange={(e) => setNewSpecialist({...newSpecialist, firstName: e.target.value})}
                              placeholder="Введите имя"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Логин</Label>
                          <Input 
                            type="email"
                            value={newSpecialist.email}
                            onChange={(e) => setNewSpecialist({...newSpecialist, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Пароль</Label>
                          <Input 
                            type="password"
                            value={newSpecialist.password}
                            onChange={(e) => setNewSpecialist({...newSpecialist, password: e.target.value})}
                            placeholder="Введите пароль"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Роль</Label>
                          <Select
                            value={newSpecialist.role}
                            onValueChange={(value: "admin" | "specialist") => setNewSpecialist({...newSpecialist, role: value})}
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
                          <Label>Категория</Label>
                          <Select
                            value={newSpecialist.category}
                            onValueChange={(value: "neuropsychologist" | "psychologist" | "speech_therapist" | "special_educator" | undefined) => setNewSpecialist({...newSpecialist, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="neuropsychologist">Нейропсихолог</SelectItem>
                              <SelectItem value="psychologist">Психолог</SelectItem>
                              <SelectItem value="speech_therapist">Логопед</SelectItem>
                              <SelectItem value="special_educator">Дефектолог</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>День рождения</Label>
                          <Input 
                            type="date"
                            value={newSpecialist.birthday}
                            onChange={(e) => setNewSpecialist({...newSpecialist, birthday: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Иное</Label>
                          <Input 
                            value={newSpecialist.other}
                            onChange={(e) => setNewSpecialist({...newSpecialist, other: e.target.value})}
                            placeholder="Дополнительная информация"
                          />
                        </div>
                        <Button onClick={addSpecialist} className="w-full">
                          Добавить специалиста
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('active')}
                >
                  Вернуться к специалистам
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Фамилия, имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead>Дата деактивации</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpecialists.map((specialist) => {
                const isActive = specialist.active !== false;
                const getCategoryLabel = (category: string | undefined) => {
                  switch (category) {
                    case 'neuropsychologist': return 'Нейропсихолог';
                    case 'psychologist': return 'Психолог';
                    case 'speech_therapist': return 'Логопед';
                    case 'special_educator': return 'Дефектолог';
                    default: return '—';
                  }
                };

                const getCategoryColor = (category: string | undefined) => {
                  if (!isActive) return { backgroundColor: '#53b4e9', color: 'white' };
                  
                  switch (category) {
                    case 'neuropsychologist': return { backgroundColor: '#b19cd9', color: 'white' }; // светло-фиолетовый
                    case 'psychologist': return { backgroundColor: '#87ceeb', color: 'white' }; // светло-голубой
                    case 'speech_therapist': return { backgroundColor: '#ffb74d', color: 'white' }; // светло-оранжевый
                    case 'special_educator': return { backgroundColor: '#90caf9', color: 'white' }; // светло-синий
                    default: return {};
                  }
                };
                
                return (
                  <TableRow 
                    key={specialist.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedSpecialist(specialist)}
                  >
                    <TableCell>
                      {specialist.lastName} {specialist.firstName}
                    </TableCell>
                    <TableCell>{specialist.email}</TableCell>
                    <TableCell>
                      <Badge variant={specialist.role === 'admin' ? 'default' : 'outline'}>
                        {specialist.role === 'admin' ? 'Администратор' : 'Специалист'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {specialist.category && (
                        <Badge 
                          variant="secondary"
                          style={getCategoryColor(specialist.category)}
                        >
                          {getCategoryLabel(specialist.category)}
                        </Badge>
                      )}
                      {!specialist.category && '—'}
                    </TableCell>
                    <TableCell>
                      {specialist.createdAt 
                        ? new Date(specialist.createdAt).toLocaleDateString('ru-RU')
                        : 'Не указана'
                      }
                    </TableCell>
                    <TableCell>
                      {specialist.deactivationDate 
                        ? new Date(specialist.deactivationDate).toLocaleDateString('ru-RU')
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isActive ? 'default' : 'secondary'}
                        style={isActive ? { backgroundColor: '#22c55e', color: 'white' } : { backgroundColor: '#f44336', color: 'white' }}
                      >
                        {isActive ? 'Активен' : 'Деактивирован'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSpecialistStatus(specialist.id)}
                        disabled={specialist.role === 'admin'}
                        style={!isActive ? { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' } : {}}
                      >
                        {isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Деактивировать
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Активировать
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}