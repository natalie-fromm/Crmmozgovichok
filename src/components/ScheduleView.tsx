import { useState, Fragment } from "react";
import { ScheduleEntry, Specialist, Child } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar, Copy, Plus, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";

interface ScheduleViewProps {
  schedule: ScheduleEntry[];
  specialists: Specialist[];
  children: Child[];
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
}

export function ScheduleView({ schedule, specialists, children, onUpdateSchedule }: ScheduleViewProps) {
  // Вспомогательная функция для форматирования даты в YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return formatDateToYYYYMMDD(monday);
  });

  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    childId: '',
    childName: '',
    date: currentWeekStart,
    time: '10:00',
    specialistId: '',
    specialistName: '',
    paymentTotalAmount: 0,
    paymentTypeDetailed: 'single' as 'single' | 'subscription4' | 'subscription8' | 'subscription12',
    paymentMethod: 'cash' as 'cash' | 'card',
    paymentAmount: 0,
    paymentType: 'single' as 'single' | 'subscription',
    sessionsCompleted: 0,
    totalSessions: 1,
    subscriptionCost: 0,
    note: '',
    paymentDueThisDay: false,
    paymentDueType: 'single' as 'single' | 'subscription4' | 'subscription8' | 'subscription12',
    paymentDueAmount: 0
  });

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(formatDateToYYYYMMDD(date));
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  // Получаем текущую дату
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateToYYYYMMDD(today);

  // Определяем, является ли отображаемая неделя будущей
  const weekStartDate = new Date(currentWeekStart);
  weekStartDate.setHours(0, 0, 0, 0);
  const isFutureWeek = weekStartDate > today;

  // Сортируем специалистов: активные слева, деактивированные справа
  const sortedSpecialists = [...specialists]
    .filter(s => {
      // Если специалист активен - показываем всегда
      if (s.active !== false) return true;
      
      // Если специалист деактивирован - показываем только в текущей и прошлых неделях
      // Не показываем в будущих неделях
      return !isFutureWeek;
    })
    .sort((a, b) => {
      const aActive = a.active !== false;
      const bActive = b.active !== false;
      
      // Если один активен, а другой нет - активный идёт первым
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      
      // Если оба активны или оба неактивны - сортируем по имени
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });

  // Формируем список специалистов с их полными именами для отображения
  const specialistsList = sortedSpecialists.map(s => ({
    id: s.id,
    name: `${s.lastName} ${s.firstName}`,
    active: s.active !== false
  }));

  // Сортируем детей в алфавитном порядке по фамилии (имя в базе хранится как "Фамилия Имя")
  const sortedChildren = [...children]
    .filter(c => !c.archived)
    .sort((a, b) => {
      // Извлекаем фамилию (первое слово в имени)
      const lastNameA = a.name.split(' ')[0];
      const lastNameB = b.name.split(' ')[0];
      return lastNameA.localeCompare(lastNameB, 'ru');
    });

  const goToPreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(formatDateToYYYYMMDD(date));
  };

  const goToNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(formatDateToYYYYMMDD(date));
  };

  const copyWeekSchedule = () => {
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    // Сортируем записи по дате и времени для правильной последовательности
    const entriesToCopy = schedule
      .filter(entry => weekDates.includes(entry.date))
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    
    // Для каждого клиента находим максимальное значение sessionsCompleted в копируемой неделе
    const clientMaxSessions: { [childId: string]: number } = {};
    entriesToCopy.forEach(entry => {
      if (entry.paymentType === 'subscription') {
        if (!(entry.childId in clientMaxSessions)) {
          clientMaxSessions[entry.childId] = entry.sessionsCompleted;
        } else {
          clientMaxSessions[entry.childId] = Math.max(
            clientMaxSessions[entry.childId], 
            entry.sessionsCompleted
          );
        }
      }
    });
    
    // Храним счетчики для каждого клиента (начинаем с макс. значения + 1)
    const clientSessionCounters: { [childId: string]: number } = {};
    
    const copiedEntries = entriesToCopy.map(entry => {
      const entryDate = new Date(entry.date);
      const daysDiff = (entryDate.getTime() - new Date(currentWeekStart).getTime()) / (1000 * 60 * 60 * 24);
      const newDate = new Date(nextWeekStart);
      newDate.setDate(nextWeekStart.getDate() + daysDiff);
      
      // Если это абонемент, увеличиваем прогресс
      let updatedSessionsCompleted = entry.sessionsCompleted;
      if (entry.paymentType === 'subscription') {
        // Инициализируем счетчик для клиента, если его еще нет
        if (!(entry.childId in clientSessionCounters)) {
          // Начинаем с максимал��ного значения из текущей недели + 1
          clientSessionCounters[entry.childId] = (clientMaxSessions[entry.childId] || 0) + 1;
        }
        
        // Используем текущий счетчик для этого клиента
        updatedSessionsCompleted = clientSessionCounters[entry.childId];
        
        // Увечиваем счетчик для следующего занятия этого клиента
        clientSessionCounters[entry.childId]++;
      }
      
      return {
        ...entry,
        id: `${entry.id}-copy-${Date.now()}-${Math.random()}`,
        date: formatDateToYYYYMMDD(newDate),
        status: 'scheduled' as const,
        sessionsCompleted: updatedSessionsCompleted
      };
    });
    
    onUpdateSchedule([...schedule, ...copiedEntries]);
    goToNextWeek();
  };

  const updateEntry = (id: string, updates: Partial<ScheduleEntry>) => {
    onUpdateSchedule(schedule.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const addEntry = () => {
    const entry: ScheduleEntry = {
      id: Date.now().toString(),
      childId: newEntry.childId,
      childName: newEntry.childName,
      date: newEntry.date,
      time: newEntry.time,
      specialistId: newEntry.specialistId,
      specialistName: newEntry.specialistName,
      paymentAmount: newEntry.paymentAmount,
      paymentType: newEntry.paymentType,
      paymentMethod: newEntry.paymentMethod,
      sessionsCompleted: newEntry.sessionsCompleted,
      totalSessions: newEntry.totalSessions,
      subscriptionCost: newEntry.subscriptionCost,
      status: 'scheduled',
      note: newEntry.note,
      paymentDueThisDay: newEntry.paymentDueThisDay,
      paymentDueType: newEntry.paymentDueType,
      paymentDueAmount: newEntry.paymentDueAmount
    };
    onUpdateSchedule([...schedule, entry]);
    setIsAddingEntry(false);
    setNewEntry({
      childId: '',
      childName: '',
      date: currentWeekStart,
      time: '10:00',
      specialistId: '',
      specialistName: '',
      paymentTotalAmount: 0,
      paymentTypeDetailed: 'single' as 'single' | 'subscription4' | 'subscription8' | 'subscription12',
      paymentMethod: 'cash' as 'cash' | 'card',
      paymentAmount: 0,
      paymentType: 'single' as 'single' | 'subscription',
      sessionsCompleted: 0,
      totalSessions: 1,
      subscriptionCost: 0,
      note: '',
      paymentDueThisDay: false,
      paymentDueType: 'single' as 'single' | 'subscription4' | 'subscription8' | 'subscription12',
      paymentDueAmount: 0
    });
  };

  const openEditDialog = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
  };

  const saveEditedEntry = () => {
    if (editingEntry) {
      updateEntry(editingEntry.id, editingEntry);
      setEditingEntry(null);
    }
  };

  const deleteEntry = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это занятие?')) {
      onUpdateSchedule(schedule.filter(entry => entry.id !== id));
      setEditingEntry(null);
    }
  };

  const generateSpecialistSchedule = (specialistName: string, date: string) => {
    const entries = schedule.filter(
      entry => entry.specialistName === specialistName && entry.date === date
    );
    
    let text = `Расписание на ${new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `Специалист: ${specialistName}\n\n`;
    
    entries.sort((a, b) => a.time.localeCompare(b.time)).forEach(entry => {
      text += `${entry.time} - ${entry.childName}\n`;
    });
    
    return text;
  };

  const sendTomorrowSchedule = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateToYYYYMMDD(tomorrow);
    
    const scheduleSpecialists = [...new Set(schedule.filter(e => e.date === tomorrowStr).map(e => e.specialistName))];
    
    scheduleSpecialists.forEach(specialist => {
      const scheduleText = generateSpecialistSchedule(specialist, tomorrowStr);
      console.log('Отправка расписания:', scheduleText);
      alert(`Расписание для ${specialist} готово к отправке:\n\n${scheduleText}`);
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Расписание занятий
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyWeekSchedule}>
                <Copy className="w-4 h-4 mr-2" />
                Копировать неделю
              </Button>
              <Button variant="outline" onClick={sendTomorrowSchedule}>
                <Send className="w-4 h-4 mr-2" />
                Отправить расписание на завтра
              </Button>
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить занятие
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Новое занятие в расписании</DialogTitle>
                    <DialogDescription>Добавьте новое занятие в расписание (можно добавить занятие в любую дату, включая прошедшие).</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Клиент</Label>
                      <Select
                        value={newEntry.childId}
                        onValueChange={(value) => {
                          const selectedChild = children.find(c => c.id === value);
                          if (selectedChild) {
                            setNewEntry({
                              ...newEntry, 
                              childId: value,
                              childName: selectedChild.name
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите клиента" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedChildren.map(child => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name} ({child.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Дата</Label>
                        <Input 
                          type="date"
                          value={newEntry.date}
                          onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Время</Label>
                        <Input 
                          type="time"
                          value={newEntry.time}
                          onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Специалист</Label>
                      <Select
                        value={newEntry.specialistId}
                        onValueChange={(value) => {
                          const selectedSpecialist = specialists.find(s => s.id === value);
                          if (selectedSpecialist) {
                            setNewEntry({
                              ...newEntry, 
                              specialistId: value,
                              specialistName: `${selectedSpecialist.lastName} ${selectedSpecialist.firstName}`
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите специалиста" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialists.filter(s => s.active !== false).map(specialist => (
                            <SelectItem key={specialist.id} value={specialist.id}>
                              {specialist.lastName} {specialist.firstName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Секция информации об оплате */}
                    <div className="space-y-3 border-t pt-4">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription>
                          💰 Информация об оплате занятия
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label>Тип оплаты</Label>
                        <Select
                          value={newEntry.paymentTypeDetailed}
                          onValueChange={(value) => {
                            const type = value as 'single' | 'subscription4' | 'subscription8' | 'subscription12';
                            const sessions = type === 'single' ? 1 : type === 'subscription4' ? 4 : type === 'subscription8' ? 8 : 12;
                            setNewEntry({
                              ...newEntry, 
                              paymentTypeDetailed: type,
                              totalSessions: sessions,
                              paymentType: type === 'single' ? 'single' : 'subscription'
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Разовая</SelectItem>
                            <SelectItem value="subscription4">Абонемент на 4 занятия</SelectItem>
                            <SelectItem value="subscription8">Абонемент на 8 занятий</SelectItem>
                            <SelectItem value="subscription12">Абонемент на 12 занятий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Способ оплаты</Label>
                        <Select
                          value={newEntry.paymentMethod || 'cash'}
                          onValueChange={(value) => setNewEntry({...newEntry, paymentMethod: value as 'cash' | 'card'})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите способ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Наличные</SelectItem>
                            <SelectItem value="card">Безналичные</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Сумма оплаты</Label>
                        <Input 
                          type="number"
                          placeholder="Введите сумму оплаты"
                          value={newEntry.paymentTotalAmount}
                          onChange={(e) => {
                            const totalAmount = parseInt(e.target.value) || 0;
                            const sessions = newEntry.totalSessions;
                            const perSessionCost = sessions > 0 ? Math.round(totalAmount / sessions) : 0;
                            
                            setNewEntry({
                              ...newEntry, 
                              paymentTotalAmount: totalAmount,
                              paymentAmount: newEntry.paymentType === 'single' ? totalAmount : perSessionCost,
                              subscriptionCost: newEntry.paymentType === 'subscription' ? totalAmount : 0
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Стоимость занятия</Label>
                        <Input 
                          type="number"
                          disabled
                          value={
                            newEntry.paymentTypeDetailed === 'single' 
                              ? newEntry.paymentTotalAmount 
                              : Math.round(newEntry.paymentTotalAmount / newEntry.totalSessions) || 0
                          }
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    {/* Секция напоминания об оплате */}
                    <div className="space-y-3 border-t pt-4">
                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertDescription>
                          🔔 Напоминание специалисту об ожидаемой оплате
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paymentDue"
                          checked={newEntry.paymentDueThisDay}
                          onCheckedChange={(checked) => setNewEntry({
                            ...newEntry, 
                            paymentDueThisDay: checked as boolean
                          })}
                        />
                        <label
                          htmlFor="paymentDue"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Клиент должен внести оплату в этот день
                        </label>
                      </div>
                      
                      {newEntry.paymentDueThisDay && (
                        <div className="space-y-3 pl-6">
                          <div className="space-y-2">
                            <Label>Тип ожидаемой оплаты</Label>
                            <Select
                              value={newEntry.paymentDueType}
                              onValueChange={(value) => setNewEntry({
                                ...newEntry, 
                                paymentDueType: value as 'single' | 'subscription4' | 'subscription8' | 'subscription12'
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Разовая оплата</SelectItem>
                                <SelectItem value="subscription4">Абонемент на 4 занятия</SelectItem>
                                <SelectItem value="subscription8">Абонемент на 8 занятий</SelectItem>
                                <SelectItem value="subscription12">Абонемент на 12 занятий</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Сумма к оплате</Label>
                            <Input 
                              type="number"
                              placeholder="Введите ожидаемую сумму"
                              value={newEntry.paymentDueAmount}
                              onChange={(e) => setNewEntry({
                                ...newEntry, 
                                paymentDueAmount: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Примечание</Label>
                      <Textarea
                        value={newEntry.note}
                        onChange={(e) => setNewEntry({...newEntry, note: e.target.value})}
                        className="h-20"
                        placeholder="Дополнительные заметки о занятии"
                      />
                    </div>
                    <Button onClick={addEntry} className="w-full">Добавить</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-md">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold text-base">
              {new Date(weekDates[0]).toLocaleDateString('ru-RU')} - {new Date(weekDates[6]).toLocaleDateString('ru-RU')}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Dialog для редактирования занятия */}
          <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактирование занятия</DialogTitle>
                <DialogDescription>Внесите изменения в занятие.</DialogDescription>
              </DialogHeader>
              {editingEntry && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Клиент</Label>
                    <Select
                      value={editingEntry.childId}
                      onValueChange={(value) => {
                        const selectedChild = children.find(c => c.id === value);
                        if (selectedChild) {
                          setEditingEntry({
                            ...editingEntry,
                            childId: value,
                            childName: selectedChild.name
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите клиента" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedChildren.map(child => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name} ({child.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Дата</Label>
                      <Input 
                        type="date"
                        value={editingEntry.date}
                        onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Время</Label>
                      <Input 
                        type="time"
                        value={editingEntry.time}
                        onChange={(e) => setEditingEntry({...editingEntry, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Специалист</Label>
                    <Select
                      value={editingEntry.specialistId}
                      onValueChange={(value) => {
                        const selectedSpecialist = specialists.find(s => s.id === value);
                        if (selectedSpecialist) {
                          setEditingEntry({
                            ...editingEntry,
                            specialistId: value,
                            specialistName: `${selectedSpecialist.lastName} ${selectedSpecialist.firstName}`
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите специалиста" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialists.filter(s => s.active !== false).map(specialist => (
                          <SelectItem key={specialist.id} value={specialist.id}>
                            {specialist.lastName} {specialist.firstName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Секция информации об оплате */}
                  <div className="space-y-3 border-t pt-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription>
                        💰 Информация об оплате занятия
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Тип оплаты</Label>
                      <Select
                        value={editingEntry.paymentTypeDetailed}
                        onValueChange={(value) => setEditingEntry({...editingEntry, paymentTypeDetailed: value as 'single' | 'subscription4' | 'subscription8' | 'subscription12'})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Разовая оплата</SelectItem>
                          <SelectItem value="subscription4">Абонемент на 4 занятия</SelectItem>
                          <SelectItem value="subscription8">Абонемент на 8 занятий</SelectItem>
                          <SelectItem value="subscription12">Абонемент на 12 занятий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editingEntry.paymentType === 'single' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Способ оплаты</Label>
                          <Select
                            value={editingEntry.paymentMethod || 'cash'}
                            onValueChange={(value) => setEditingEntry({...editingEntry, paymentMethod: value as 'cash' | 'card'})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите способ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Наличные</SelectItem>
                              <SelectItem value="card">Безналичные</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Стоимость занятия</Label>
                          <Input 
                            type="number"
                            placeholder="Введите стоимость"
                            value={editingEntry.paymentAmount}
                            onChange={(e) => setEditingEntry({...editingEntry, paymentAmount: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Абонемент (пройдено / всего)</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="number"
                              value={editingEntry.sessionsCompleted}
                              onChange={(e) => setEditingEntry({...editingEntry, sessionsCompleted: parseInt(e.target.value)})}
                              className="w-20"
                            />
                            <span className="flex items-center">/</span>
                            <Input 
                              type="number"
                              value={editingEntry.totalSessions}
                              onChange={(e) => setEditingEntry({...editingEntry, totalSessions: parseInt(e.target.value)})}
                              className="w-20"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Способ оплаты</Label>
                          <Select
                            value={editingEntry.paymentMethod || 'cash'}
                            onValueChange={(value) => setEditingEntry({...editingEntry, paymentMethod: value as 'cash' | 'card'})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите способ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Наличные</SelectItem>
                              <SelectItem value="card">Безналичные</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Стоимость абонемента</Label>
                          <Input 
                            type="number"
                            placeholder="Введите стоимость"
                            value={editingEntry.subscriptionCost}
                            onChange={(e) => setEditingEntry({...editingEntry, subscriptionCost: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                    )}

                    {/* Сумма оплаты */}
                    <div className="space-y-2">
                      <Label>Сумма оплаты</Label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        <span className="text-lg font-semibold">
                          {editingEntry.paymentType === 'single' 
                            ? `${editingEntry.paymentAmount || 0} ₽` 
                            : `${editingEntry.subscriptionCost || 0} ₽`}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {editingEntry.paymentType === 'single' 
                            ? 'Разовое занятие' 
                            : `Абонемент на ${editingEntry.totalSessions} занятий`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Примечание</Label>
                    <Textarea
                      value={editingEntry.note || ''}
                      onChange={(e) => setEditingEntry({...editingEntry, note: e.target.value})}
                      className="h-20"
                    />
                  </div>
                  
                  {/* Секция оплаты */}
                  <div className="space-y-3 border-t pt-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription>
                        ℹ️ Клиент должен произвести оплату в день занятия
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPaid"
                        checked={editingEntry.isPaid || false}
                        onCheckedChange={(checked) => {
                          setEditingEntry({
                            ...editingEntry, 
                            isPaid: checked as boolean,
                            paidDate: checked ? formatDateToYYYYMMDD(new Date()) : undefined
                          });
                        }}
                      />
                      <label
                        htmlFor="isPaid"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Оплата получена
                      </label>
                    </div>
                    
                    {editingEntry.isPaid && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Внесенная сумма</Label>
                          <Input 
                            type="number"
                            placeholder="Введите сумму"
                            value={editingEntry.paidAmount || ''}
                            onChange={(e) => setEditingEntry({
                              ...editingEntry, 
                              paidAmount: e.target.value ? parseInt(e.target.value) : undefined
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Дата оплаты</Label>
                          <Input 
                            type="date"
                            value={editingEntry.paidDate || formatDateToYYYYMMDD(new Date())}
                            onChange={(e) => setEditingEntry({
                              ...editingEntry, 
                              paidDate: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select
                      value={editingEntry.status}
                      onValueChange={(value) => setEditingEntry({...editingEntry, status: value as 'scheduled' | 'completed' | 'absent'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Запланировано</SelectItem>
                        <SelectItem value="completed">Проведено</SelectItem>
                        <SelectItem value="absent">Пропуск</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingEntry.status === 'absent' && (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Label>Причина пропуска</Label>
                      <Select
                        value={editingEntry.absenceCategory || ''}
                        onValueChange={(value) => setEditingEntry({...editingEntry, absenceCategory: value as any, absenceReason: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Причина" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sick">Болезнь</SelectItem>
                          <SelectItem value="family">Семейные обстоятельства</SelectItem>
                          <SelectItem value="cancelled">Отмена</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={saveEditedEntry} className="flex-1">Сохранить</Button>
                    <Button variant="destructive" onClick={() => deleteEntry(editingEntry.id)}>Удалить</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Ден / Время</TableHead>
                  {specialistsList.length > 0 ? (
                    specialistsList.map((specialist, index) => (
                      <TableHead key={index} className="min-w-[200px]">
                        {specialist.name}
                      </TableHead>
                    ))
                  ) : (
                    <TableHead className="min-w-[200px]">
                      Нет специалистов
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDates.map((date, dayIndex) => (
                  <Fragment key={`day-group-${date}`}>
                    {/* Строка-разделитель с днем недели и датой */}
                    <TableRow key={`day-${date}`}>
                      <TableCell 
                        colSpan={specialistsList.length > 0 ? specialistsList.length + 1 : 2}
                        className="p-3 text-left text-white"
                        style={{ backgroundColor: '#53b4e9' }}
                      >
                        <div className="flex items-center gap-3">
                          <span>{weekDays[dayIndex]}</span>
                          <span>•</span>
                          <span>
                            {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Временные слоты для этого дня */}
                    {timeSlots.map((time) => (
                      <TableRow key={`${date}-${time}`}>
                        <TableCell className="p-2">
                          {time}
                        </TableCell>
                        {specialistsList.length > 0 ? (
                          specialistsList.map((specialist, specIndex) => {
                            const entries = schedule.filter(
                              e => e.date === date && e.time === time && e.specialistName === specialist.name
                            );
                            return (
                              <TableCell key={specIndex} className="p-1 relative">
                                {entries.map(entry => (
                                  <div 
                                    key={entry.id} 
                                    className="p-2 mb-1 bg-blue-50 border border-blue-200 rounded text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => openEditDialog(entry)}
                                  >
                                    <div className="mb-1">{entry.childName}</div>
                                    {entry.note && (
                                      <div className="mt-1 text-gray-600 italic text-xs">
                                        {entry.note}
                                      </div>
                                    )}
                                    <div className="mt-1 flex items-center justify-between">
                                      {entry.paymentType === 'subscription' && (
                                        <Badge variant="outline" className="text-xs">
                                          {entry.sessionsCompleted}/{entry.totalSessions}
                                        </Badge>
                                      )}
                                      <span className={entry.paymentType !== 'subscription' ? 'ml-auto' : ''}>
                                        {entry.paymentType === 'subscription' ? entry.subscriptionCost : entry.paymentAmount}₽
                                      </span>
                                    </div>
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                      <Select
                                        value={entry.status}
                                        onValueChange={(value) => updateEntry(entry.id, { 
                                          status: value as 'scheduled' | 'completed' | 'absent' 
                                        })}
                                      >
                                        <SelectTrigger className="h-6 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="scheduled">Запланировано</SelectItem>
                                          <SelectItem value="completed">Проведено</SelectItem>
                                          <SelectItem value="absent">Пропуск</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {entry.status === 'absent' && (
                                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                          value={entry.absenceCategory || ''}
                                          onValueChange={(value) => updateEntry(entry.id, { 
                                            absenceCategory: value as any,
                                            absenceReason: value 
                                          })}
                                        >
                                          <SelectTrigger className="h-6 text-xs">
                                            <SelectValue placeholder="Причина" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="sick">Болезнь</SelectItem>
                                            <SelectItem value="family">Семейные обстоятельства</SelectItem>
                                            <SelectItem value="cancelled">Отмена</SelectItem>
                                            <SelectItem value="other">Другое</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </TableCell>
                            );
                          })
                        ) : (
                          <TableCell className="p-1"></TableCell>
                        )}
                      </TableRow>
                    ))}
                  </Fragment>
                ))} 
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}