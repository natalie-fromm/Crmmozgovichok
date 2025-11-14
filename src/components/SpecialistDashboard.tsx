import { useState } from "react";
import { Child, Specialist, ScheduleEntry, Notification } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChildCardView } from "./ChildCardView";
import { ScenarioManagement } from "./ScenarioManagement";
import { MaterialsManagement } from "./MaterialsManagement";
import { KnowledgeBase } from "./KnowledgeBase";
import { NotificationCenter } from "./NotificationCenter";
import { LogOut, Calendar, User, BookOpen, Package, Lightbulb, Bell } from "lucide-react";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";
import scheduleIcon from "figma:asset/7843564f189c0f5a6df2526b328bb66aee93a993.png";

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
  const myChildren = children.filter(child =>
    child.sessions.some(session => session.specialistId === specialist.id) ||
    schedule.some(entry => entry.specialistId === specialist.id && entry.childId === child.id)
  );

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
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
                  Предыдущий рабочий день, сегодня и три следующих рабочих дня
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
            <ScenarioManagement />
          </TabsContent>

          {/* Вкладка Материалы */}
          <TabsContent value="materials">
            <MaterialsManagement />
          </TabsContent>

          {/* Вкладка База знаний */}
          <TabsContent value="knowledge">
            <KnowledgeBase specialists={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}