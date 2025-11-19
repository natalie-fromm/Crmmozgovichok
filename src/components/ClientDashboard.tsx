import { useState } from 'react';
import { Child, Specialist, ScheduleEntry } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { LogOut, Calendar, FileText, User, Clock, Star, Mountain, Flower } from 'lucide-react';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface ClientDashboardProps {
  currentUser: Specialist;
  child: Child;
  schedule: ScheduleEntry[];
  onLogout: () => void;
}

export function ClientDashboard({ currentUser, child, schedule, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [showScheduledDialog, setShowScheduledDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [showMissedDialog, setShowMissedDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);

  // Фильтруем расписание для текущего клиента
  const clientSchedule = schedule.filter(entry => entry.childId === child.id);
  
  // Сортируем расписание по дате
  const sortedSchedule = [...clientSchedule].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Предстоящие занятия
  const upcomingSchedule = sortedSchedule.filter(entry => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entryDate >= today && entry.status === 'scheduled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Прошедшие занятия
  const completedSchedule = sortedSchedule.filter(entry => 
    entry.status === 'completed'
  );

  // Статистика
  const totalSessions = completedSchedule.length;
  const totalAbsences = sortedSchedule.filter(entry => entry.status === 'absent').length;
  
  // Общее количество назначенных занятий (все записи в расписании для клиента)
  const totalScheduled = sortedSchedule.length;
  
  // Пройдено занятий (completed)
  const completedSessions = sortedSchedule.filter(entry => entry.status === 'completed').length;
  
  // Пропущено занятий (absent)
  const missedSessions = sortedSchedule.filter(entry => entry.status === 'absent').length;
  
  // Прогресс посещаемости (процент пройденных от фактически состоявшихся занятий)
  // Учитываем только пройденные (completed) и пропущенные (absent), без запланированных (scheduled)
  const actualSessions = sortedSchedule.filter(entry => 
    entry.status === 'completed' || entry.status === 'absent'
  );
  const attendanceRate = actualSessions.length > 0 
    ? Math.round((completedSessions / actualSessions.length) * 100) 
    : 0;

  // Прошлые и будущие занятия относительно текущей даты
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pastSessions = sortedSchedule.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate < today;
  }).length;
  
  const futureSessions = sortedSchedule.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate >= today;
  }).length;

  // Пройденные занятия по типам услуг
  const completedByType = {
    neuro: completedSchedule.filter(entry => 
      entry.serviceType === 'neuro-diagnosis' || entry.serviceType === 'neuro-session'
    ).length,
    psycho: completedSchedule.filter(entry => 
      entry.serviceType === 'psycho-diagnosis' || entry.serviceType === 'psycho-session'
    ).length,
    logo: completedSchedule.filter(entry => 
      entry.serviceType === 'logo-diagnosis' || entry.serviceType === 'logo-session'
    ).length,
  };

  // Пропущенные занятия
  const missedSchedule = sortedSchedule.filter(entry => entry.status === 'absent');

  // Пропущенные занятия по категориям пропусков
  const missedByCategory = {
    sick: missedSchedule.filter(entry => entry.absenceCategory === 'sick').length,
    family: missedSchedule.filter(entry => entry.absenceCategory === 'family').length,
    cancelled: missedSchedule.filter(entry => entry.absenceCategory === 'cancelled').length,
    other: missedSchedule.filter(entry => entry.absenceCategory === 'other' || !entry.absenceCategory).length,
  };

  // Расчет посещаемости за текущий календарный месяц
  const getCurrentMonthAttendanceMessage = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Фильтруем записи за текущий календарный месяц
    const currentMonthSchedule = sortedSchedule.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const scheduledThisMonth = currentMonthSchedule.length;
    const completedThisMonth = currentMonthSchedule.filter(entry => entry.status === 'completed').length;

    // Если назначено менее 4 занятий
    if (scheduledThisMonth < 4) {
      return "Накапливаем результат";
    }

    // Отличный результат
    if (
      (scheduledThisMonth === 4 && completedThisMonth === 4) ||
      (scheduledThisMonth === 8 && completedThisMonth === 8) ||
      (scheduledThisMonth === 12 && completedThisMonth === 12)
    ) {
      return "Отличный результат! Регулярность — залог успешного прогресса. Спасибо за ваш ответственный подход!";
    }

    // Хороший результат (есть пропуски, но не критично)
    if (
      (scheduledThisMonth === 4 && completedThisMonth === 3) ||
      (scheduledThisMonth === 8 && (completedThisMonth === 6 || completedThisMonth === 7)) ||
      (scheduledThisMonth === 12 && completedThisMonth >= 9 && completedThisMonth <= 11)
    ) {
      return "Появление пропусков мешает закреплять навыки. Давайте повысим процент посещения в следующем месяце!";
    }

    // Критически низкая посещаемость
    if (
      (scheduledThisMonth === 4 && completedThisMonth >= 0 && completedThisMonth <= 2) ||
      (scheduledThisMonth === 8 && completedThisMonth >= 0 && completedThisMonth <= 5) ||
      (scheduledThisMonth === 12 && completedThisMonth >= 0 && completedThisMonth <= 8)
    ) {
      return "Посещаемость критически низкая. Но вернуться в строй никогда не поздно. Ждем вас на занятии, чтобы продолжить путь к успеху!";
    }

    // Для других случаев (например, назначено 5, 6, 7, 9, 10, 11 или более 12 занятий)
    return "Накапливаем результат";
  };

  // Получаем данные для диалога посещаемости
  const getAttendanceDialogContent = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Фильтруем записи за текущий календарный месяц
    const currentMonthSchedule = sortedSchedule.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const scheduledThisMonth = currentMonthSchedule.length;
    const completedThisMonth = currentMonthSchedule.filter(entry => entry.status === 'completed').length;

    // Отличный результат - звездочка
    if (
      (scheduledThisMonth === 4 && completedThisMonth === 4) ||
      (scheduledThisMonth === 8 && completedThisMonth === 8) ||
      (scheduledThisMonth === 12 && completedThisMonth === 12)
    ) {
      return {
        type: 'excellent',
        icon: <Star className="w-24 h-24 text-yellow-400 fill-yellow-400" />,
        message: "Отличная статистика за месяц! Это путь чемпиона! Именно такая регулярность позволяет нам глубоко прорабатывать сложные навыки, а не тратить время на повторение. Мы видим, как растут показатели, и очень рады за нашу обоюдную старательность."
      };
    }

    // Средний результат - альпинист на горе
    if (
      (scheduledThisMonth === 4 && completedThisMonth === 3) ||
      (scheduledThisMonth === 8 && (completedThisMonth === 6 || completedThisMonth === 7)) ||
      (scheduledThisMonth === 12 && completedThisMonth >= 9 && completedThisMonth <= 11)
    ) {
      return {
        type: 'medium',
        icon: <Mountain className="w-24 h-24 text-blue-500" />,
        message: "Мы заметили, что из-за пропусков приходится тратить время на 'догонялки' вместо отработки нового материала. Это может снижать интерес к занятиям у ребенка, так как сложнее чувствовать себя успешным, если не виден свой прогресс. Давайте попробуем в следующем месяце не пропускать без уважительной причины? Регулярный ритм критически важен для закрепления наработанных и перехода к новым навыкам. Ждем вас на следующем занятии!"
      };
    }

    // Низкий рзультат - увядающее растение
    if (
      (scheduledThisMonth === 4 && completedThisMonth >= 0 && completedThisMonth <= 2) ||
      (scheduledThisMonth === 8 && completedThisMonth >= 0 && completedThisMonth <= 5) ||
      (scheduledThisMonth === 12 && completedThisMonth >= 0 && completedThisMonth <= 8)
    ) {
      return {
        type: 'low',
        icon: <Flower className="w-24 h-24 text-amber-600" />,
        message: "Давно не видели. Возвращайтесь скорее, чтобы совсем не потерять те навыки, которые были ранее наработаны. Мы понимаем, что обстоятельства бывают разными, но переживаем, что длительный перерыв может привести к полной утрате всех наработанных навыков и полному угасанию интереса к своему развитию, так ребенок не видит своего прогресса, поэтому утрачивает цель прилагать усилия в любой деятельности. Давайте попробуем начать с чистого листа? Возвращаться никогда не поздно, и мы поможем снова мягко влиться в процесс. Если есть сложности с расписанием, напишите нам — мы постараемся найти решение. Очень ждем ва!"
      };
    }

    // Для других случаев
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Дневник успеха</h1>
            <p className="text-muted-foreground">
              {child.name}
            </p>
          </div>
          {currentUser.role !== 'admin' && (
            <Button 
              variant="outline" 
              onClick={onLogout}
              style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowScheduledDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Назначалось занятий</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Левая часть - общее количество */}
                <div className="flex-1">
                  <div className="text-2xl">{totalScheduled}</div>
                  <p className="text-xs text-muted-foreground mt-1">Нажмите для деталей</p>
                </div>
                
                {/* Разделитель */}
                <Separator orientation="vertical" className="h-16" />
                
                {/* Правая часть - прошлые и будущие */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Прошлые:</span>
                    <span className="text-sm font-medium">{pastSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Будущие:</span>
                    <span className="text-sm font-medium">{futureSessions}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowCompletedDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Пройдено занятий</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Левая часть - общее количество */}
                <div className="flex-1">
                  <div className="text-2xl">{completedSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Нажмите для деталей</p>
                </div>
                
                {/* Разделитель */}
                <Separator orientation="vertical" className="h-16" />
                
                {/* Правая часть - по типам услуг */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Нейро:</span>
                    <span className="text-sm font-medium">{completedByType.neuro}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Психо:</span>
                    <span className="text-sm font-medium">{completedByType.psycho}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Лого:</span>
                    <span className="text-sm font-medium">{completedByType.logo}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowMissedDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Пропущено занятий</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Левая часть - общее количество */}
                <div className="flex-1">
                  <div className="text-2xl">{missedSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Нажмите для деталей</p>
                </div>
                
                {/* Разделитель */}
                <Separator orientation="vertical" className="h-16" />
                
                {/* Правая часть - по категориям пропусков */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Болезнь:</span>
                    <span className="text-sm font-medium">{missedByCategory.sick}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Отмена:</span>
                    <span className="text-sm font-medium">{missedByCategory.cancelled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Другое:</span>
                    <span className="text-sm font-medium">{missedByCategory.other}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowAttendanceDialog(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Прогресс посещаемости</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Левая часть - 1/3 - процент посещаемости */}
                <div className="flex-none w-[33%]">
                  <div className="text-2xl">{attendanceRate}%</div>
                </div>
                
                {/* Разделитель */}
                <Separator orientation="vertical" className="h-16" />
                
                {/* Правая часть - 2/3 - мотивационное сообщение */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getCurrentMonthAttendanceMessage()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <FileText className="w-4 h-4 mr-2" />
              Занятия
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Отчёты
            </TabsTrigger>
          </TabsList>

          {/* Расписание */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Предстоящие занятия</CardTitle>
                <CardDescription>
                  {upcomingSchedule.length > 0 
                    ? `Запланировано занятий: ${upcomingSchedule.length}`
                    : 'Нет запланированных занятий'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSchedule.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Специалист</TableHead>
                        <TableHead>Тип услуги</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingSchedule.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>{entry.time}</TableCell>
                          <TableCell>{entry.specialistName}</TableCell>
                          <TableCell>
                            {entry.serviceType === 'neuro-diagnosis' && 'Нейропсихологическая диагностика'}
                            {entry.serviceType === 'neuro-session' && 'Нейропсихологическое занятие'}
                            {entry.serviceType === 'psycho-diagnosis' && 'Психологическая диагностика'}
                            {entry.serviceType === 'psycho-session' && 'Психологическое занятие'}
                            {entry.serviceType === 'logo-diagnosis' && 'Логопедическая диагностика'}
                            {entry.serviceType === 'logo-session' && 'Логопедическое занятие'}
                            {!entry.serviceType && '-'}
                          </TableCell>
                          <TableCell>
                            <Badge>Запланировано</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Нет предстоящих занятий
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Занятия */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>История занятий</CardTitle>
                <CardDescription>
                  Всего проведено занятий: {child.sessions.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {child.sessions.length > 0 ? (
                  <div className="space-y-4">
                    {[...child.sessions].reverse().map((session) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {new Date(session.date).toLocaleDateString('ru-RU')}
                            </CardTitle>
                            <Badge variant="outline">{session.specialistName}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {session.exercises.map((exercise, idx) => (
                            <div key={exercise.id} className="mb-4">
                              <p className="text-sm mb-2">
                                <span className="font-medium">Задание {idx + 1}:</span> {exercise.description}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Результат:</span> {exercise.results}
                              </p>
                              {exercise.photos.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                  {exercise.photos.map((photo) => (
                                    <img
                                      key={photo.id}
                                      src={photo.url}
                                      alt={photo.fileName}
                                      className="w-32 h-32 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                              )}
                              {idx < session.exercises.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Занятия ещё не проводились
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Отчёты */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Ежемесячные отчёты</CardTitle>
                <CardDescription>
                  Отчёты специалистов о прогрессе
                </CardDescription>
              </CardHeader>
              <CardContent>
                {child.monthlyReports.length > 0 ? (
                  <div className="space-y-4">
                    {[...child.monthlyReports].reverse().map((report) => (
                      <Card key={report.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {new Date(report.month + '-01').toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Достижения</p>
                            <p className="text-sm">{report.achievements}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Цели на следующий месяц</p>
                            <p className="text-sm">{report.nextMonthGoals}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Отчёты ещё не созданы
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Копилка знаний */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-3xl mb-2">Копилка знаний</h2>
            <p className="text-muted-foreground">Рекомендуем...</p>
          </div>

          <Tabs defaultValue="read">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="read">
                <FileText className="w-4 h-4 mr-2" />
                Почитать
              </TabsTrigger>
              <TabsTrigger value="watch">
                <FileText className="w-4 h-4 mr-2" />
                Посмотреть
              </TabsTrigger>
              <TabsTrigger value="practice">
                <FileText className="w-4 h-4 mr-2" />
                Позаниматься
              </TabsTrigger>
            </TabsList>

            {/* Почитать */}
            <TabsContent value="read">
              <Card>
                <CardHeader>
                  <CardTitle>Рекомендуемые материалы для чтения</CardTitle>
                  <CardDescription>
                    Полезные статьи и книги для развития
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Материалы скоро появятся
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Посмотреть */}
            <TabsContent value="watch">
              <Card>
                <CardHeader>
                  <CardTitle>Рекомендуемые видео</CardTitle>
                  <CardDescription>
                    Обучающие видео и материалы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Материалы скоро появятся
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Позаниматься */}
            <TabsContent value="practice">
              <Card>
                <CardHeader>
                  <CardTitle>Упражнения и задания</CardTitle>
                  <CardDescription>
                    Практические материалы для самостоятельных занятий
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Материалы скоро появятся
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Диалог с детальной информацией о назначенных занятиях */}
        <Dialog open={showScheduledDialog} onOpenChange={setShowScheduledDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Все назначенные занятия</DialogTitle>
              <DialogDescription>
                Полная информация о всех назначенных занятиях для {child.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Дата</TableHead>
                    <TableHead className="w-[140px]">Тип услуги</TableHead>
                    <TableHead className="w-[130px]">Результат</TableHead>
                    <TableHead className="w-[150px]">Форма оплаты</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedule.map((entry) => {
                    // Определяем тип услуги
                    const getServiceType = (type?: string) => {
                      switch(type) {
                        case 'neuro-diagnosis': return 'Нейродиагностика';
                        case 'neuro-session': return 'Нейрозанятие';
                        case 'psycho-diagnosis': return 'Психодиагностика';
                        case 'psycho-session': return 'Психозанятие';
                        case 'logo-diagnosis': return 'Логодиагностика';
                        case 'logo-session': return 'Логозанятие';
                        default: return 'Не указано';
                      }
                    };

                    // Определяем результат
                    const getResult = (status: string) => {
                      switch(status) {
                        case 'completed': return <Badge variant="default" className="bg-green-500">Пройдено</Badge>;
                        case 'absent': return <Badge variant="destructive">Пропущено</Badge>;
                        case 'scheduled': return <Badge variant="outline">Запланировано</Badge>;
                        default: return <Badge variant="outline">Не звестно</Badge>;
                      }
                    };

                    // Определяем форму оплаты
                    const getPaymentInfo = (entry: ScheduleEntry) => {
                      if (entry.paymentType === 'single') {
                        return 'Разовая';
                      } else if (entry.paymentType === 'subscription') {
                        return `Абонемент (${entry.sessionsCompleted}/${entry.totalSessions})`;
                      } else {
                        return 'Не указана';
                      }
                    };

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-sm">{new Date(entry.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell className="text-sm">{getServiceType(entry.serviceType)}</TableCell>
                        <TableCell>{getResult(entry.status)}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{getPaymentInfo(entry)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог с детальной информацией о пройденных занятиях */}
        <Dialog open={showCompletedDialog} onOpenChange={setShowCompletedDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Все пройденные занятия</DialogTitle>
              <DialogDescription>
                Полная информация о всех пройденных занятиях для {child.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Дата</TableHead>
                    <TableHead className="w-[180px]">Тип услуги</TableHead>
                    <TableHead className="w-[180px]">Форма оплаты</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedSchedule.map((entry) => {
                    // Определяем тип услуги
                    const getServiceType = (type?: string) => {
                      switch(type) {
                        case 'neuro-diagnosis': return 'Нейродиагностика';
                        case 'neuro-session': return 'Нейрозанятие';
                        case 'psycho-diagnosis': return 'Психодиагностика';
                        case 'psycho-session': return 'Психозанятие';
                        case 'logo-diagnosis': return 'Логодиагностика';
                        case 'logo-session': return 'Логозанятие';
                        default: return 'Не указано';
                      }
                    };

                    // Определяем форму оплаты
                    const getPaymentInfo = (entry: ScheduleEntry) => {
                      if (entry.paymentType === 'single') {
                        return 'Разовая';
                      } else if (entry.paymentType === 'subscription') {
                        return `Абонемент (${entry.sessionsCompleted}/${entry.totalSessions})`;
                      } else {
                        return 'Не указана';
                      }
                    };

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-sm">{new Date(entry.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell className="text-sm">{getServiceType(entry.serviceType)}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{getPaymentInfo(entry)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог с детальной информацией о пропущенных занятиях */}
        <Dialog open={showMissedDialog} onOpenChange={setShowMissedDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Все пропущенные занятия</DialogTitle>
              <DialogDescription>
                Полная информация о всех пропущенных занятиях для {child.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Дата</TableHead>
                    <TableHead className="w-[150px]">Тип услуги</TableHead>
                    <TableHead className="w-[200px]">Причина пропуска</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedule.filter(entry => entry.status === 'absent').map((entry) => {
                    // Определяем тип услуги
                    const getServiceType = (type?: string) => {
                      switch(type) {
                        case 'neuro-diagnosis': return 'Нейродиагностика';
                        case 'neuro-session': return 'Нейрозанятие';
                        case 'psycho-diagnosis': return 'Психодиагностика';
                        case 'psycho-session': return 'Психозанятие';
                        case 'logo-diagnosis': return 'Логодиагностика';
                        case 'logo-session': return 'Логозанятие';
                        default: return 'Не указано';
                      }
                    };

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-sm">{new Date(entry.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell className="text-sm">{getServiceType(entry.serviceType)}</TableCell>
                        <TableCell className="text-sm">{entry.absenceReason || 'Не указана'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {sortedSchedule.filter(entry => entry.status === 'absent').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Пропущенных занятий нет
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог с детальной информацией о посещаемости */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Анализ посещаемости за текущий месяц</DialogTitle>
              <DialogDescription>
                Оценка регулярности посещения занятий для {child.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              {(() => {
                const content = getAttendanceDialogContent();
                if (!content) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Недостаточно данных для анализа посещаемости за текущий месяц.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Накапливаем результат
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="flex flex-col items-center justify-center py-8">
                    {/* Иконка */}
                    <div className="mb-6">
                      {content.icon}
                    </div>
                    
                    {/* Мотивационное сообщение */}
                    <div className="text-center px-6">
                      <p className="text-sm leading-relaxed">
                        {content.message}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}