import { useState } from "react";
import { Child, Specialist, ScheduleEntry, Notification } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ChildCardView } from "./ChildCardView";
import { ScenarioManagement } from "./ScenarioManagement";
import { MaterialsManagement } from "./MaterialsManagement";
import { KnowledgeBase } from "./KnowledgeBase";
import { NotificationCenter } from "./NotificationCenter";
import { LogOut, Calendar, User, BookOpen, Package, Lightbulb, Bell, GraduationCap, Award, Book, Send, Plus, X, Edit, Eye } from "lucide-react";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";
import scheduleIcon from "figma:asset/7843564f189c0f5a6df2526b328bb66aee93a993.png";

interface SelfEducationItem {
  id: string;
  specialistId: string;
  type: string;
  customType?: string;
  name: string;
  date: string;
  documentPhoto?: string;
  createdAt: string;
}

interface SpecialistDashboardProps {
  specialist: Specialist;
  children: Child[];
  schedule: ScheduleEntry[];
  onUpdateChild: (child: Child) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function SpecialistDashboard({ 
  specialist, 
  children, 
  schedule, 
  onUpdateChild, 
  onLogout,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead 
}: SpecialistDashboardProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  
  // State для самообразования
  const [selfEducationItems, setSelfEducationItems] = useState<SelfEducationItem[]>(() => {
    const saved = localStorage.getItem('selfEducationItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelfEducationItem | null>(null);
  const [newItemType, setNewItemType] = useState<string>('');
  const [customType, setCustomType] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDate, setNewItemDate] = useState<string>('');
  const [documentPhoto, setDocumentPhoto] = useState<string>('');
  const [editItemType, setEditItemType] = useState<string>('');
  const [editCustomType, setEditCustomType] = useState<string>('');
  const [editItemName, setEditItemName] = useState<string>('');
  const [editItemDate, setEditItemDate] = useState<string>('');
  const [editDocumentPhoto, setEditDocumentPhoto] = useState<string>('');

  // Функция для добавления записи самообразования
  const handleAddSelfEducation = () => {
    if (!newItemType || !newItemName.trim() || !newItemDate) {
      return;
    }

    const newItem: SelfEducationItem = {
      id: Date.now().toString(),
      specialistId: specialist.id,
      type: newItemType === 'Иное' ? customType : newItemType,
      customType: newItemType === 'Иное' ? customType : undefined,
      name: newItemName.trim(),
      date: newItemDate,
      documentPhoto: documentPhoto || undefined,
      createdAt: new Date().toISOString()
    };

    const updatedItems = [...selfEducationItems, newItem];
    setSelfEducationItems(updatedItems);
    localStorage.setItem('selfEducationItems', JSON.stringify(updatedItems));

    // Сбросить форму
    setIsAddDialogOpen(false);
    setNewItemType('');
    setCustomType('');
    setNewItemName('');
    setNewItemDate('');
    setDocumentPhoto('');
  };

  // Функция для загрузки фото документа
  const handleDocumentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для загрузки фото документа при редактировании
  const handleEditDocumentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditDocumentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Получить записи самообразования для текущего специалиста
  const myEducationItems = selfEducationItems.filter(item => item.specialistId === specialist.id);

  // Вспомогательная функция для форматирования даты в YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Функция для форматирования имени ребенка (фамилия + первая буква имени)
  const formatChildName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts[1];
      return `${lastName} ${firstName.charAt(0)}.`;
    }
    return fullName;
  };

  // Получаем детей, с которыми работает этот специалист
  const myChildren = children
    .filter(child =>
      child.sessions.some(session => session.specialistId === specialist.id) ||
      schedule.some(entry => entry.specialistId === specialist.id && entry.childId === child.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'ru')); // Сортировка по фамилии

  // Получаем расписание специалиста
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Обнуляем время для корректного сравнения
  
  // Все занятия специалиста
  const allMySchedule = schedule
    .filter(entry => entry.specialistId === specialist.id)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });

  // Находим предыдущий день работы (последний день до сегодня с занятиями)
  const previousWorkDays = allMySchedule
    .filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate < today;
    })
    .map(entry => entry.date);
  
  const previousWorkDay = previousWorkDays.length > 0 
    ? previousWorkDays[previousWorkDays.length - 1] 
    : null;

  // Находим три следующих дня работы (дни после сегодня с занятиями)
  const futureWorkDays = Array.from(new Set(
    allMySchedule
      .filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate > today;
      })
      .map(entry => entry.date)
  )).slice(0, 3);

  // Собираем все дни для отображения: предыдущий + сегодня + 3 будущих
  const todayStr = formatDateToYYYYMMDD(today);
  const displayDays = [
    ...(previousWorkDay ? [previousWorkDay] : []),
    todayStr,
    ...futureWorkDays
  ];

  // Фильтруем расписание только по нужным дням
  const mySchedule = allMySchedule.filter(entry => displayDays.includes(entry.date));

  // Расписание на сегодня
  const todaySchedule = mySchedule.filter(entry => entry.date === todayStr);

  // Расписание на завтра
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDateToYYYYMMDD(tomorrow);
  const tomorrowSchedule = mySchedule.filter(entry => entry.date === tomorrowStr);

  if (selectedChild) {
    return (
      <ChildCardView
        child={selectedChild}
        onBack={() => setSelectedChild(null)}
        onUpdate={(updatedChild) => {
          onUpdateChild(updatedChild);
          setSelectedChild(updatedChild);
        }}
        canEdit={true}
        isSpecialist={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ 
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10"
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Логотип" className="w-10 h-10" />
            <div>
              <h1>CRM-МОЗГОВИЧОК</h1>
              <p className="text-sm text-muted-foreground">
                Специалист: {specialist.firstName} {specialist.lastName}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Сценарии
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Материалы
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              База знаний
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Обучение
            </TabsTrigger>
            <TabsTrigger value="certification" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Аттестация
            </TabsTrigger>
          </TabsList>

          {/* Вкладка Расписание */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Расписание на сегодня */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={scheduleIcon} alt="Расписание" className="w-6 h-6" />
                  Расписание на сегодня
                </CardTitle>
                <CardDescription>
                  {today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaySchedule.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Занятий на сегодня нет</p>
                ) : (
                  <div className="space-y-2">
                    {todaySchedule.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{entry.time}</span>
                            <Badge>{entry.childName}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Занятие {entry.sessionsCompleted + 1} из {entry.totalSessions}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const child = children.find(c => c.id === entry.childId);
                            if (child) setSelectedChild(child);
                          }}
                          style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                        >
                          Открыть карточку
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Расписание на завтра */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Расписание на завтра
                </CardTitle>
                <CardDescription>
                  {tomorrow.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tomorrowSchedule.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Занятий на завтра нет</p>
                ) : (
                  <div className="space-y-2">
                    {tomorrowSchedule.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{entry.time}</span>
                            <Badge>{entry.childName}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Занятие {entry.sessionsCompleted + 1} из {entry.totalSessions}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const child = children.find(c => c.id === entry.childId);
                            if (child) setSelectedChild(child);
                          }}
                          style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                        >
                          Открыть карточку
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Моё расписание */}
            <Card>
              <CardHeader>
                <CardTitle>Моё расписание</CardTitle>
                <CardDescription>
                  Предыдущий рабий день, сегодня и три следующих рабочих дня
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mySchedule.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Расписание отсутствует</p>
                ) : (
                  <div className="space-y-4">
                    {Array.from(new Set(mySchedule.map(e => e.date))).map(date => (
                      <div key={date}>
                        <h4 className="mb-2">
                          {new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h4>
                        <div className="space-y-2 ml-4">
                          {mySchedule
                            .filter(entry => entry.date === date)
                            .map(entry => (
                              <div key={entry.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                                <span className="text-sm">{entry.time}</span>
                                <Badge variant="outline">{entry.childName}</Badge>
                                <Badge className="text-xs">
                                  {entry.sessionsCompleted}/{entry.totalSessions}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Уведомления */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка Клиенты */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Мои клиенты
                </CardTitle>
                <CardDescription>Дети, с которыми вы работаете</CardDescription>
              </CardHeader>
              <CardContent>
                {myChildren.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Нет назначенных детей</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Шифр</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Возраст</TableHead>
                        <TableHead>Занятий проведено</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myChildren.map((child) => (
                        <TableRow key={child.id}>
                          <TableCell>
                            <Badge variant="outline">{child.code}</Badge>
                          </TableCell>
                          <TableCell>{formatChildName(child.name)}</TableCell>
                          <TableCell>{child.age} лет</TableCell>
                          <TableCell>
                            <Badge>
                              {child.sessions.filter(s => s.specialistId === specialist.id).length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedChild(child)}
                              style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                            >
                              Открыть карточку
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка Сценарии */}
          <TabsContent value="scenarios">
            <ScenarioManagement isSpecialist={true} />
          </TabsContent>

          {/* Вкладка Материалы */}
          <TabsContent value="materials">
            <MaterialsManagement isSpecialist={true} />
          </TabsContent>

          {/* Вкладка База знаний */}
          <TabsContent value="knowledge">
            <KnowledgeBase specialists={[]} />
          </TabsContent>

          {/* Вкладка Обучение */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Обучение
                </CardTitle>
                <CardDescription>
                  Образовательные материалы и курсы для специалистов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="self-education" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="self-education" className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Самообразование
                    </TabsTrigger>
                    <TabsTrigger value="training-assignment" className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Направление на обучение
                    </TabsTrigger>
                  </TabsList>

                  {/* Подраздел Самообразование */}
                  <TabsContent value="self-education">
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddDialogOpen(true)}
                        style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить запись
                      </Button>
                      <div className="space-y-2">
                        {myEducationItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge>{item.type}</Badge>
                                <span>{item.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {new Date(item.date).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              {item.documentPhoto && (
                                <div className="mt-1">
                                  <img src={item.documentPhoto} alt="Документ" className="w-20 h-20 object-cover rounded" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsViewDialogOpen(true);
                                }}
                                style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                className="mr-2"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Просмотр
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditItemType(item.type);
                                  setEditCustomType(item.customType || '');
                                  setEditItemName(item.name);
                                  setEditItemDate(item.date);
                                  setEditDocumentPhoto(item.documentPhoto || '');
                                  setIsEditDialogOpen(true);
                                }}
                                style={{ backgroundColor: '#4caf50', color: 'white', borderColor: '#4caf50' }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Диалог добавления записи самообразования */}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Добавить запись самообразования</DialogTitle>
                          <DialogDescription>
                            Введите информацию о новой записи самообразования
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="item-type">Объект изучения</Label>
                            <Select
                              value={newItemType}
                              onValueChange={setNewItemType}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите объект изучения" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Книга">Книга</SelectItem>
                                <SelectItem value="Подкаст">Подкаст</SelectItem>
                                <SelectItem value="Видео">Видео</SelectItem>
                                <SelectItem value="Семинар">Семинар</SelectItem>
                                <SelectItem value="Мастер-класс">Мастер-класс</SelectItem>
                                <SelectItem value="Курс">Курс</SelectItem>
                                <SelectItem value="Переподготовка">Переподготовка</SelectItem>
                                <SelectItem value="Иное">Иное</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newItemType === 'Иное' && (
                            <div className="space-y-2">
                              <Label htmlFor="custom-type">Укажите тип</Label>
                              <Input
                                id="custom-type"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="Введите тип объекта изучения"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="item-name">Наименование</Label>
                            <Input
                              id="item-name"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="Введите наименование"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="item-date">Дата прохождения обучения</Label>
                            <Input
                              id="item-date"
                              type="date"
                              value={newItemDate}
                              onChange={(e) => setNewItemDate(e.target.value)}
                              placeholder="Введите дату"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="document-photo">Фото документа о прохождении обучения</Label>
                            <Input
                              id="document-photo"
                              type="file"
                              accept="image/*"
                              onChange={handleDocumentPhotoUpload}
                            />
                            {documentPhoto && (
                              <div className="mt-2">
                                <img src={documentPhoto} alt="Предпросмотр документа" className="max-w-full h-auto rounded border" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDocumentPhoto('')}
                                  className="mt-2"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Удалить фото
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Отмена
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAddSelfEducation}
                            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                            disabled={!newItemType || !newItemName.trim() || !newItemDate || (newItemType === 'Иное' && !customType.trim())}
                          >
                            Сохранить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Диалог просмотра записи самообразования */}
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Просмотр записи самообразования</DialogTitle>
                          <DialogDescription>
                            Информация о записи самообразования
                          </DialogDescription>
                        </DialogHeader>
                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Объект изучения</Label>
                              <Badge>{selectedItem.type}</Badge>
                            </div>
                            {selectedItem.customType && (
                              <div className="space-y-2">
                                <Label>Тип</Label>
                                <Badge>{selectedItem.customType}</Badge>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>Наименование</Label>
                              <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Дата прохождения обучения</Label>
                              <p className="text-sm text-muted-foreground">
                                {new Date(selectedItem.date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            {selectedItem.documentPhoto && (
                              <div className="space-y-2">
                                <Label>Фото документа о прохождении обучения</Label>
                                <img src={selectedItem.documentPhoto} alt="Документ" className="max-w-full h-auto rounded border" />
                              </div>
                            )}
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsViewDialogOpen(false)}
                          >
                            Закрыть
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Диалог редактирования записи самообразования */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Редактировать запись самообразования</DialogTitle>
                          <DialogDescription>
                            Введите информацию о записи самообразования
                          </DialogDescription>
                        </DialogHeader>
                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-item-type">Объект изучения</Label>
                              <Select
                                value={editItemType}
                                onValueChange={setEditItemType}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите объект изучения" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Книга">Книга</SelectItem>
                                  <SelectItem value="Подкаст">Подкаст</SelectItem>
                                  <SelectItem value="Видео">Видео</SelectItem>
                                  <SelectItem value="Семинар">Семинар</SelectItem>
                                  <SelectItem value="Мастер-класс">Мастер-класс</SelectItem>
                                  <SelectItem value="Курс">Курс</SelectItem>
                                  <SelectItem value="Переподготовка">Переподготовка</SelectItem>
                                  <SelectItem value="Иное">Иное</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {editItemType === 'Иное' && (
                              <div className="space-y-2">
                                <Label htmlFor="edit-custom-type">Укажите тип</Label>
                                <Input
                                  id="edit-custom-type"
                                  value={editCustomType}
                                  onChange={(e) => setEditCustomType(e.target.value)}
                                  placeholder="Введите тип объекта изучения"
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="edit-item-name">Наименование</Label>
                              <Input
                                id="edit-item-name"
                                value={editItemName}
                                onChange={(e) => setEditItemName(e.target.value)}
                                placeholder="Введите наименование"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-item-date">Дата прохождения обучения</Label>
                              <Input
                                id="edit-item-date"
                                type="date"
                                value={editItemDate}
                                onChange={(e) => setEditItemDate(e.target.value)}
                                placeholder="Введите дату"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-document-photo">Фото документа о прохождении обучения</Label>
                              <Input
                                id="edit-document-photo"
                                type="file"
                                accept="image/*"
                                onChange={handleEditDocumentPhotoUpload}
                              />
                              {editDocumentPhoto && (
                                <div className="mt-2">
                                  <img src={editDocumentPhoto} alt="Предпросмотр документа" className="max-w-full h-auto rounded border" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditDocumentPhoto('')}
                                    className="mt-2"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Удалить фото
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                          >
                            Отмена
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              if (!editItemType || !editItemName.trim() || !editItemDate) {
                                return;
                              }

                              const updatedItem: SelfEducationItem = {
                                id: selectedItem ? selectedItem.id : Date.now().toString(),
                                specialistId: specialist.id,
                                type: editItemType === 'Иное' ? editCustomType : editItemType,
                                customType: editItemType === 'Иное' ? editCustomType : undefined,
                                name: editItemName.trim(),
                                date: editItemDate,
                                documentPhoto: editDocumentPhoto || undefined,
                                createdAt: new Date().toISOString()
                              };

                              const updatedItems = selfEducationItems.map(item => 
                                item.id === updatedItem.id ? updatedItem : item
                              );
                              setSelfEducationItems(updatedItems);
                              localStorage.setItem('selfEducationItems', JSON.stringify(updatedItems));

                              // Сбросить форму
                              setIsEditDialogOpen(false);
                              setEditItemType('');
                              setEditCustomType('');
                              setEditItemName('');
                              setEditItemDate('');
                              setEditDocumentPhoto('');
                            }}
                            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                            disabled={!editItemType || !editItemName.trim() || !editItemDate || (editItemType === 'Иное' && !editCustomType.trim())}
                          >
                            Сохранить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* Подраздел Направление на обучение */}
                  <TabsContent value="training-assignment">
                    <div className="text-center py-12 text-muted-foreground">
                      <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>Подраздел "Направление на обучение" в разработке</p>
                      <p className="text-sm mt-2">Здесь будут отображаться направления на обучение от администрации</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка Аттестация */}
          <TabsContent value="certification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Аттестация
                </CardTitle>
                <CardDescription>
                  Информация о прохождении аттестации и результаты тестов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Раздел "Аттестация" в разработке</p>
                  <p className="text-sm mt-2">Здесь будет отображаться информация об аттестации</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}