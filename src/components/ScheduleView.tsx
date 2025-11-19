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
    serviceType: '' as '' | 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session' | 'logo-diagnosis' | 'logo-session',
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
    const clientTotalSessions: { [childId: string]: number } = {};
    const clientLastEntry: { [childId: string]: ScheduleEntry } = {};
    
    entriesToCopy.forEach(entry => {
      if (entry.paymentType === 'subscription') {
        if (!(entry.childId in clientMaxSessions)) {
          clientMaxSessions[entry.childId] = entry.sessionsCompleted;
          clientTotalSessions[entry.childId] = entry.totalSessions;
          clientLastEntry[entry.childId] = entry;
        } else {
          if (entry.sessionsCompleted > clientMaxSessions[entry.childId]) {
            clientMaxSessions[entry.childId] = entry.sessionsCompleted;
            clientTotalSessions[entry.childId] = entry.totalSessions;
            clientLastEntry[entry.childId] = entry;
          }
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
      
      // Если это абонемент, обрабатываем прогресс с проверкой завершения
      let updatedSessionsCompleted = entry.sessionsCompleted;
      let updatedEntry: any = {};
      
      if (entry.paymentType === 'subscription') {
        // Инициализируем счетчик для клиента, если его еще нет
        if (!(entry.childId in clientSessionCounters)) {
          const maxSessions = clientMaxSessions[entry.childId] || 0;
          const totalSessions = clientTotalSessions[entry.childId] || entry.totalSessions;
          const lastEntry = clientLastEntry[entry.childId];
          
          // Проверяем, завершен ли абонемент
          if (maxSessions >= totalSessions) {
            // Абонемент завершен - проверяем наличие предоплаченного
            if (lastEntry?.prepaidSubscriptionType) {
              // Активируем предоплаченный абонемент
              const prepaidSessions = lastEntry.prepaidSubscriptionType;
              let paymentTypeDetailed: 'subscription4' | 'subscription8' | 'subscription12' = 'subscription4';
              if (prepaidSessions === 8) paymentTypeDetailed = 'subscription8';
              else if (prepaidSessions === 12) paymentTypeDetailed = 'subscription12';
              
              clientSessionCounters[entry.childId] = 1;
              updatedSessionsCompleted = 1;
              
              updatedEntry = {
                paymentType: 'subscription',
                paymentTypeDetailed: paymentTypeDetailed,
                totalSessions: prepaidSessions,
                subscriptionCost: lastEntry.subscriptionCost,
                paymentAmount: lastEntry.subscriptionCost ? Math.round(lastEntry.subscriptionCost / prepaidSessions) : lastEntry.paymentAmount,
                prepaidSubscriptionType: undefined,
                prepaidSubscriptionActivated: false
              };
            } else {
              // Нет предоплаченного абонемента - полностью обнуляем карточку
              clientSessionCounters[entry.childId] = 0;
              updatedSessionsCompleted = 0;
              
              updatedEntry = {
                paymentType: 'single',
                paymentTypeDetailed: 'single',
                totalSessions: 1,
                sessionsCompleted: 0,
                paymentDueThisDay: false, // Не показываем предупреждение об оплате
                paymentDueType: undefined,
                paymentDueAmount: undefined,
                subscriptionCost: 0,
                paymentTotalAmount: 0,
                paymentAmount: 0,
                prepaidSubscriptionType: undefined,
                prepaidSubscriptionActivated: false
              };
            }
          } else {
            // Абонемент еще не завершен - продолжаем счет
            clientSessionCounters[entry.childId] = maxSessions + 1;
            updatedSessionsCompleted = maxSessions + 1;
            
            // Сохраняем параметры текущего абонемента
            updatedEntry = {
              paymentType: 'subscription',
              paymentTypeDetailed: entry.paymentTypeDetailed,
              totalSessions: totalSessions,
              subscriptionCost: entry.subscriptionCost,
              paymentAmount: entry.paymentAmount,
              prepaidSubscriptionType: lastEntry?.prepaidSubscriptionType,
              prepaidSubscriptionActivated: lastEntry?.prepaidSubscriptionActivated
            };
          }
        } else {
          // Используем текущий счетчик для этого клиента
          updatedSessionsCompleted = clientSessionCounters[entry.childId];
          
          // Если счетчик = 0, значит абонемент завершен - полностью обнуляем карточку
          if (clientSessionCounters[entry.childId] === 0) {
            updatedEntry = {
              paymentType: 'single',
              paymentTypeDetailed: 'single',
              totalSessions: 1,
              sessionsCompleted: 0,
              paymentDueThisDay: false, // Не показываем предупреждение об оплате
              paymentDueType: undefined,
              paymentDueAmount: undefined,
              subscriptionCost: 0,
              paymentTotalAmount: 0,
              paymentAmount: 0,
              prepaidSubscriptionType: undefined,
              prepaidSubscriptionActivated: false
            };
          } else {
            // Счетчик > 0, продолжаем использовать параметры абонемента
            const lastEntry = clientLastEntry[entry.childId];
            const currentTotalSessions = clientTotalSessions[entry.childId] || entry.totalSessions;
            updatedEntry = {
              paymentType: 'subscription',
              paymentTypeDetailed: entry.paymentTypeDetailed,
              totalSessions: currentTotalSessions,
              subscriptionCost: entry.subscriptionCost,
              paymentAmount: entry.paymentAmount,
              prepaidSubscriptionType: lastEntry?.prepaidSubscriptionType,
              prepaidSubscriptionActivated: lastEntry?.prepaidSubscriptionActivated
            };
          }
        }
        
        // Увеличиваем счетчик для следующего занятия этого клиента
        // ТОЛЬКО если счетчик > 0 и не достиг максимума totalSessions
        const currentTotal = updatedEntry.totalSessions || entry.totalSessions;
        if (clientSessionCounters[entry.childId] > 0 && 
            clientSessionCounters[entry.childId] < currentTotal) {
          clientSessionCounters[entry.childId]++;
        }
      }
      
      return {
        ...entry,
        ...updatedEntry,
        id: `${entry.id}-copy-${Date.now()}-${Math.random()}`,
        date: formatDateToYYYYMMDD(newDate),
        status: 'scheduled' as const,
        sessionsCompleted: updatedSessionsCompleted,
        isPaid: false,
        paidAmount: undefined,
        paidDate: undefined
      };
    });
    
    // НОВАЯ ЛОГИКА: Для каждого клиента находим момент завершения абонемента
    // и обнуляем только записи ПОСЛЕ этого момента
    const clientEntries: { [childId: string]: any[] } = {};
    
    // Группируем записи по клиентам
    copiedEntries.forEach(entry => {
      if (!clientEntries[entry.childId]) {
        clientEntries[entry.childId] = [];
      }
      clientEntries[entry.childId].push(entry);
    });
    
    // Для каждого клиента находим индекс первого завершенного занятия
    const clientCompletionIndex: { [childId: string]: number } = {};
    
    Object.keys(clientEntries).forEach(childId => {
      const entries = clientEntries[childId];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.paymentType === 'subscription' && 
            entry.sessionsCompleted >= entry.totalSessions) {
          // Нашли первое завершенное занятие - обнуляем все ПОСЛЕ него
          clientCompletionIndex[childId] = i;
          break;
        }
      }
    });
    
    // Применяем обнуление только для записей после завершения абонемента
    const finalCopiedEntries = copiedEntries.map(entry => {
      const childId = entry.childId;
      
      if (childId in clientCompletionIndex) {
        const entries = clientEntries[childId];
        const completionIndex = clientCompletionIndex[childId];
        const currentIndex = entries.findIndex(e => e.id === entry.id);
        
        // Обнуляем только если это запись ПОСЛЕ завершения абонемента
        if (currentIndex > completionIndex) {
          return {
            ...entry,
            paymentType: 'single' as const,
            paymentTypeDetailed: 'single' as const,
            totalSessions: 1,
            sessionsCompleted: 0,
            paymentDueThisDay: false,
            paymentDueType: undefined,
            paymentDueAmount: undefined,
            subscriptionCost: 0,
            paymentTotalAmount: 0,
            paymentAmount: 0,
            prepaidSubscriptionType: undefined,
            prepaidSubscriptionActivated: false
          };
        }
      }
      
      return entry;
    });
    
    onUpdateSchedule([...schedule, ...finalCopiedEntries]);
    goToNextWeek();
  };

  const updateEntry = (id: string, updates: Partial<ScheduleEntry>) => {
    onUpdateSchedule(schedule.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const addEntry = () => {
    // Проверка обязательных полей
    if (!newEntry.serviceType) {
      alert('Пожалуйста, выберите тип услуги');
      return;
    }
    
    const entry: ScheduleEntry = {
      id: Date.now().toString(),
      childId: newEntry.childId,
      childName: newEntry.childName,
      date: newEntry.date,
      time: newEntry.time,
      specialistId: newEntry.specialistId,
      specialistName: newEntry.specialistName,
      serviceType: newEntry.serviceType as 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session' | 'logo-diagnosis' | 'logo-session',
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
      paymentDueAmount: newEntry.paymentDueAmount,
      isPaid: false
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
      serviceType: '' as '' | 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session' | 'logo-diagnosis' | 'logo-session',
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
      // Проверяем, является ли это первым абонементом клиента
      const isFirstSubscription = editingEntry.isPaid && 
        editingEntry.paymentType === 'subscription' &&
        editingEntry.paidDate;
      
      if (isFirstSubscription) {
        // Проверяем историю занятий клиента - были ли у него раньше абонементы
        const previousSubscriptions = schedule.filter(
          e => e.childId === editingEntry.childId && 
          e.paymentType === 'subscription' &&
          e.id !== editingEntry.id &&
          e.date < editingEntry.date
        );
        
        // Если это действительно первый абонемент
        if (previousSubscriptions.length === 0) {
          const activationDate = editingEntry.paidDate;
          
          // Находим все будущие занятия этого клиента начиная с даты оплаты
          const futureEntries = schedule
            .filter(e => 
              e.childId === editingEntry.childId && 
              e.date >= activationDate
            )
            .sort((a, b) => {
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              return a.time.localeCompare(b.time);
            });
          
          // Активируем абонемент для всех занятий начиная с даты оплаты
          let sessionCounter = 1;
          const totalSessions = editingEntry.totalSessions;
          const updatedSchedule = schedule.map(entry => {
            const futureIndex = futureEntries.findIndex(fe => fe.id === entry.id);
            
            if (futureIndex !== -1 && sessionCounter <= totalSessions) {
              const isCurrentEntry = entry.id === editingEntry.id;
              const updatedEntry = {
                ...entry,
                paymentType: 'subscription' as const,
                paymentTypeDetailed: editingEntry.paymentTypeDetailed,
                totalSessions: totalSessions,
                sessionsCompleted: sessionCounter,
                subscriptionCost: editingEntry.paymentTotalAmount || editingEntry.subscriptionCost,
                paymentAmount: Math.round((editingEntry.paymentTotalAmount || editingEntry.subscriptionCost || 0) / totalSessions),
                // Для текущей записи берем все данные из editingEntry
                ...(isCurrentEntry ? editingEntry : {}),
                // Но счетчик занятий всегда правильный
                sessionsCompleted: sessionCounter
              };
              
              sessionCounter++;
              return updatedEntry;
            }
            
            // Если это текущая запись, но она не попала в диапазон активации
            if (entry.id === editingEntry.id) {
              return { ...entry, ...editingEntry };
            }
            
            return entry;
          });
          
          onUpdateSchedule(updatedSchedule);
          setEditingEntry(null);
          return;
        }
      }
      
      // Обычное сохранение без активации абонемента
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
                    <DialogDescription>Добавьте новое занятие в расписание.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Клиент</Label>
                      <Select
                        value={newEntry.childId}
                        onValueChange={(value) => {
                          const selectedChild = children.find(c => c.id === value);
                          if (selectedChild) {
                            // Найти все занятия клиента, отсортированные по дате
                            const previousEntries = schedule
                              .filter(e => e.childId === value)
                              .sort((a, b) => {
                                const dateCompare = b.date.localeCompare(a.date);
                                if (dateCompare !== 0) return dateCompare;
                                return b.time.localeCompare(a.time);
                              });

                            let updatedEntry = {
                              ...newEntry, 
                              childId: value,
                              childName: selectedChild.name
                            };

                            // Если есть предыдущие занятия, проверяем абонемент
                            if (previousEntries.length > 0) {
                              // Находим последнее занятие для общей информации
                              const lastEntry = previousEntries[0];
                              
                              // Находим последнее занятие, которое НЕ было пропущено по болезни
                              // (для определения корректного счетчика sessionsCompleted)
                              const lastNonSickEntry = previousEntries.find(
                                e => e.status !== 'absent' || e.absenceCategory !== 'sick'
                              ) || lastEntry;
                              
                              // Проверяем, активен ли текущий абонемент
                              const isSubscriptionActive = lastNonSickEntry.paymentType === 'subscription' && 
                                                           lastNonSickEntry.sessionsCompleted < lastNonSickEntry.totalSessions;
                              
                              // Проверяем, завершен ли текущий абонемент
                              const isSubscriptionCompleted = lastNonSickEntry.paymentType === 'subscription' && 
                                                              lastNonSickEntry.sessionsCompleted === lastNonSickEntry.totalSessions;
                              
                              // Если абонемент завершен и есть предоплаченный - активируем его
                              if (isSubscriptionCompleted && lastNonSickEntry.prepaidSubscriptionType) {
                                const prepaidSessions = lastNonSickEntry.prepaidSubscriptionType;
                                let paymentTypeDetailed: 'subscription4' | 'subscription8' | 'subscription12' = 'subscription4';
                                if (prepaidSessions === 8) paymentTypeDetailed = 'subscription8';
                                else if (prepaidSessions === 12) paymentTypeDetailed = 'subscription12';

                                updatedEntry = {
                                  ...updatedEntry,
                                  paymentType: 'subscription',
                                  paymentTypeDetailed: paymentTypeDetailed,
                                  totalSessions: prepaidSessions,
                                  sessionsCompleted: 1,
                                  paymentMethod: lastNonSickEntry.paymentMethod,
                                  paymentTotalAmount: lastNonSickEntry.paymentTotalAmount,
                                  paymentAmount: lastNonSickEntry.paymentAmount,
                                  subscriptionCost: lastNonSickEntry.subscriptionCost,
                                  prepaidSubscriptionType: undefined,
                                  prepaidSubscriptionActivated: false
                                };
                              }
                              // Если абонемент активен - продолжаем его
                              else if (isSubscriptionActive) {
                                updatedEntry = {
                                  ...updatedEntry,
                                  paymentType: lastNonSickEntry.paymentType,
                                  paymentTypeDetailed: lastNonSickEntry.paymentTypeDetailed,
                                  totalSessions: lastNonSickEntry.totalSessions,
                                  sessionsCompleted: lastNonSickEntry.sessionsCompleted + 1,
                                  paymentMethod: lastNonSickEntry.paymentMethod,
                                  paymentTotalAmount: lastNonSickEntry.paymentTotalAmount,
                                  paymentAmount: lastNonSickEntry.paymentAmount,
                                  subscriptionCost: lastNonSickEntry.subscriptionCost,
                                  prepaidSubscriptionType: lastNonSickEntry.prepaidSubscriptionType,
                                  prepaidSubscriptionActivated: false
                                };
                              }
                            }

                            setNewEntry(updatedEntry);
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
                    
                    <div className="space-y-2">
                      <Label>Услуга <span className="text-red-500">*</span></Label>
                      <Select
                        value={newEntry.serviceType || ''}
                        onValueChange={(value) => {
                          setNewEntry({
                            ...newEntry, 
                            serviceType: value as 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session' | 'logo-diagnosis' | 'logo-session'
                          });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите услугу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neuro-diagnosis">Нейро-диагностика</SelectItem>
                          <SelectItem value="neuro-session">Нейро-занятие</SelectItem>
                          <SelectItem value="psycho-diagnosis">Психо-диагностика</SelectItem>
                          <SelectItem value="psycho-session">Психо-занятие</SelectItem>
                          <SelectItem value="logo-diagnosis">Лого-диагностика</SelectItem>
                          <SelectItem value="logo-session">Лого-занятие</SelectItem>
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
                          value={newEntry.paymentTotalAmount || 0}
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
                              ? (newEntry.paymentTotalAmount || 0)
                              : Math.round((newEntry.paymentTotalAmount || 0) / newEntry.totalSessions) || 0
                          }
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    {/* Секция информации о посещении абонемента */}
                    <div className="space-y-3 border-t pt-4">
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription>
                          📋 Информация о посещении абонемента
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label>Посещаемый абонемент</Label>
                        <Select
                          value={newEntry.totalSessions.toString()}
                          onValueChange={(value) => setNewEntry({...newEntry, totalSessions: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 занятия</SelectItem>
                            <SelectItem value="8">8 занятий</SelectItem>
                            <SelectItem value="12">12 занятий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Занятий пройдено</Label>
                        <Input 
                          type="number"
                          placeholder="Введите количество пройденных занятий"
                          value={newEntry.sessionsCompleted}
                          onChange={(e) => setNewEntry({...newEntry, sessionsCompleted: parseInt(e.target.value) || 0})}
                          min={0}
                          max={newEntry.totalSessions}
                        />
                        {newEntry.childId && (() => {
                          // Находим последнее занятие этого клиента с датой меньше текущей
                          const previousEntries = schedule
                            .filter(e => e.childId === newEntry.childId && e.date < newEntry.date)
                            .sort((a, b) => {
                              const dateCompare = b.date.localeCompare(a.date);
                              if (dateCompare !== 0) return dateCompare;
                              return b.time.localeCompare(a.time);
                            });
                          
                          if (previousEntries.length > 0) {
                            const lastEntry = previousEntries[0];
                            const isCompleted = lastEntry.sessionsCompleted === lastEntry.totalSessions;
                            
                            return (
                              <div className="mt-2 text-xs">
                                <p className="text-gray-600">
                                  Предыдущее занятие: {lastEntry.sessionsCompleted}/{lastEntry.totalSessions} ({new Date(lastEntry.date).toLocaleDateString('ru-RU')})
                                </p>
                                {isCompleted && (
                                  <Alert className="mt-2 bg-orange-50 border-orange-200">
                                    <AlertDescription className="text-xs">
                                      ⚠️ Нужно напомнить о внесении оплаты
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    
                    {/* Секция напоминания об оплате */}
                    {(() => {
                      // Проверяем, есть ли у клиента действующий абонемент
                      if (newEntry.childId) {
                        const clientEntries = schedule.filter(e => e.childId === newEntry.childId);
                        const hasActiveSubscription = clientEntries.some(
                          e => e.paymentType === 'subscription' && 
                          e.sessionsCompleted < e.totalSessions
                        );
                        
                        // Если есть действующий абонемент, не показываем секцию напоминания
                        if (hasActiveSubscription) {
                          return null;
                        }
                      }
                      
                      return (
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
                                  value={newEntry.paymentDueAmount || 0}
                                  onChange={(e) => setNewEntry({
                                    ...newEntry, 
                                    paymentDueAmount: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
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
                  
                  <div className="space-y-2">
                    <Label>Услуга <span className="text-red-500">*</span></Label>
                    <Select
                      value={editingEntry.serviceType || ''}
                      onValueChange={(value) => {
                        setEditingEntry({
                          ...editingEntry,
                          serviceType: value as 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session' | 'logo-diagnosis' | 'logo-session'
                        });
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neuro-diagnosis">Нейро-диагностика</SelectItem>
                        <SelectItem value="neuro-session">Нейро-занятие</SelectItem>
                        <SelectItem value="psycho-diagnosis">Психо-диагностика</SelectItem>
                        <SelectItem value="psycho-session">Психо-занятие</SelectItem>
                        <SelectItem value="logo-diagnosis">Лого-диагностика</SelectItem>
                        <SelectItem value="logo-session">Лого-занятие</SelectItem>
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
                        onValueChange={(value) => {
                          const type = value as 'single' | 'subscription4' | 'subscription8' | 'subscription12';
                          const sessions = type === 'single' ? 1 : type === 'subscription4' ? 4 : type === 'subscription8' ? 8 : 12;
                          setEditingEntry({
                            ...editingEntry, 
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
                      <Label>Сумма оплаты</Label>
                      <Input 
                        type="number"
                        placeholder="Введите сумму оплаты"
                        value={editingEntry.paymentTotalAmount || (editingEntry.paymentType === 'single' ? editingEntry.paymentAmount : editingEntry.subscriptionCost) || 0}
                        onChange={(e) => {
                          const totalAmount = parseInt(e.target.value) || 0;
                          const sessions = editingEntry.totalSessions;
                          const perSessionCost = sessions > 0 ? Math.round(totalAmount / sessions) : 0;
                          
                          setEditingEntry({
                            ...editingEntry, 
                            paymentTotalAmount: totalAmount,
                            paymentAmount: editingEntry.paymentType === 'single' ? totalAmount : perSessionCost,
                            subscriptionCost: editingEntry.paymentType === 'subscription' ? totalAmount : 0
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
                          editingEntry.paymentTypeDetailed === 'single' 
                            ? (editingEntry.paymentTotalAmount || editingEntry.paymentAmount || 0)
                            : Math.round((editingEntry.paymentTotalAmount || editingEntry.subscriptionCost || 0) / editingEntry.totalSessions) || 0
                        }
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  {/* Секция информации о посещении абонемента */}
                  <div className="space-y-3 border-t pt-4">
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription>
                        📋 Информация о посещении абонемента
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label>Посещаемый абонемент</Label>
                      <Select
                        value={editingEntry.totalSessions.toString()}
                        onValueChange={(value) => setEditingEntry({...editingEntry, totalSessions: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 занятия</SelectItem>
                          <SelectItem value="8">8 занятий</SelectItem>
                          <SelectItem value="12">12 занятий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Занятий пройдено</Label>
                      <Input 
                        type="number"
                        placeholder="Введите количество пройденных занятий"
                        value={editingEntry.sessionsCompleted}
                        onChange={(e) => setEditingEntry({...editingEntry, sessionsCompleted: parseInt(e.target.value) || 0})}
                        min={0}
                        max={editingEntry.totalSessions}
                      />
                      {editingEntry.childId && (() => {
                        // Находим последнее занятие этого клиента с датой меньше текущей
                        const previousEntries = schedule
                          .filter(e => e.childId === editingEntry.childId && e.id !== editingEntry.id && e.date < editingEntry.date)
                          .sort((a, b) => {
                            const dateCompare = b.date.localeCompare(a.date);
                            if (dateCompare !== 0) return dateCompare;
                            return b.time.localeCompare(a.time);
                          });
                        
                        if (previousEntries.length > 0) {
                          const lastEntry = previousEntries[0];
                          const isCompleted = lastEntry.sessionsCompleted === lastEntry.totalSessions;
                          
                          return (
                            <div className="mt-2 text-xs">
                              <p className="text-gray-600">
                                Предыдущее занятие: {lastEntry.sessionsCompleted}/{lastEntry.totalSessions} ({new Date(lastEntry.date).toLocaleDateString('ru-RU')})
                              </p>
                              {isCompleted && (
                                <Alert className="mt-2 bg-orange-50 border-orange-200">
                                  <AlertDescription className="text-xs">
                                    ⚠️ Нужно напомнить о внесении оплаты
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Предоплаченный абонемент */}
                    {editingEntry.prepaidSubscriptionType && (
                      <div className="space-y-2">
                        <Label>Предоплаченный абонемент</Label>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                          <p className="text-sm font-medium text-purple-900">
                            {editingEntry.prepaidSubscriptionType} занятия
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Будет активирован после завершения текущего абонемента
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Активация абонемента (появляется при получении оплаты) */}
                    {editingEntry.isPaid && editingEntry.paymentType === 'subscription' && (
                      <div className="space-y-2 pt-2 border-t border-green-200">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="activateSubscription"
                            checked={editingEntry.prepaidSubscriptionActivated || false}
                            onCheckedChange={(checked) => {
                              // Если активируется предоплаченный абонемент
                              if (checked) {
                                const subscriptionType = editingEntry.paymentTypeDetailed;
                                let sessions = 4;
                                if (subscriptionType === 'subscription8') sessions = 8;
                                else if (subscriptionType === 'subscription12') sessions = 12;
                                
                                setEditingEntry({
                                  ...editingEntry, 
                                  prepaidSubscriptionType: sessions as 4 | 8 | 12,
                                  prepaidSubscriptionActivated: true
                                });
                              } else {
                                setEditingEntry({
                                  ...editingEntry, 
                                  prepaidSubscriptionType: undefined,
                                  prepaidSubscriptionActivated: false
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor="activateSubscription"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Активировать абонемент
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 pl-6">
                          Отметьте, если клиент покупает абонемент заранее (до завершения текущего)
                        </p>
                      </div>
                    )}
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
                        id="paymentDueEdit"
                        checked={editingEntry.paymentDueThisDay}
                        onCheckedChange={(checked) => setEditingEntry({
                          ...editingEntry, 
                          paymentDueThisDay: checked as boolean
                        })}
                      />
                      <label
                        htmlFor="paymentDueEdit"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Клиент должен внести оплату в этот день
                      </label>
                    </div>
                    
                    {editingEntry.paymentDueThisDay && (
                      <div className="space-y-3 pl-6">
                        <div className="space-y-2">
                          <Label>Тип ожидаемой оплаты</Label>
                          <Select
                            value={editingEntry.paymentDueType}
                            onValueChange={(value) => setEditingEntry({
                              ...editingEntry, 
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
                            value={editingEntry.paymentDueAmount || 0}
                            onChange={(e) => setEditingEntry({
                              ...editingEntry, 
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
                      value={editingEntry.note || ''}
                      onChange={(e) => setEditingEntry({...editingEntry, note: e.target.value})}
                      className="h-20"
                      placeholder="Дополнительные заметки о занятии"
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
                                {entries.map(entry => {
                                  // Найти полную информацию о клиенте
                                  const child = children.find(c => c.id === entry.childId);
                                  
                                  // Вычислить стоимость занятия
                                  const sessionCost = entry.paymentType === 'subscription' 
                                    ? Math.round((entry.paymentTotalAmount || entry.subscriptionCost || 0) / (entry.totalSessions || 1))
                                    : (entry.paymentTotalAmount || entry.paymentAmount || 0);

                                  // Определение цвета статуса
                                  const getStatusColor = (status: string) => {
                                    switch (status) {
                                      case 'completed': return 'bg-green-50 border-green-200';
                                      case 'absent': return 'bg-red-50 border-red-200';
                                      default: return 'bg-blue-50 border-blue-200';
                                    }
                                  };

                                  return (
                                    <div 
                                      key={entry.id} 
                                      className={`p-2 mb-1 border rounded text-xs cursor-pointer hover:opacity-80 transition-colors ${getStatusColor(entry.status)}`}
                                      onClick={() => openEditDialog(entry)}
                                    >
                                      {/* ФИО клиента */}
                                      <div className="font-semibold mb-1">{entry.childName}</div>
                                      
                                      {/* Услуга */}
                                      {entry.serviceType && (
                                        <div className="text-xs text-gray-600 mb-1">
                                          {entry.serviceType === 'neuro-diagnosis' && '🔬 Нейро-диагностика'}
                                          {entry.serviceType === 'neuro-session' && '🧠 Нейро-занятие'}
                                          {entry.serviceType === 'psycho-diagnosis' && '🔍 Психо-диагностика'}
                                          {entry.serviceType === 'psycho-session' && '💭 Психо-занятие'}
                                          {entry.serviceType === 'logo-diagnosis' && '🗣️ Лого-диагностика'}
                                          {entry.serviceType === 'logo-session' && '📢 Лого-занятие'}
                                        </div>
                                      )}
                                      
                                      {/* Родители */}
                                      {child && (
                                        <div className="text-gray-600 space-y-0.5 mb-2">
                                          {child.motherName && (
                                            <div className="text-xs">
                                              👩 {child.motherName}
                                              {child.motherPhone && <span className="ml-2 text-gray-500">📞 {child.motherPhone}</span>}
                                            </div>
                                          )}
                                          {child.fatherName && (
                                            <div className="text-xs">
                                              👨 {child.fatherName}
                                              {child.fatherPhone && <span className="ml-2 text-gray-500">📞 {child.fatherPhone}</span>}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Статус занятия */}
                                      <div className="mb-2" onClick={(e) => e.stopPropagation()}>
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

                                      {/* Причина пропуска */}
                                      {entry.status === 'absent' && (
                                        <div className="mb-2" onClick={(e) => e.stopPropagation()}>
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

                                      {/* Абонемент и стоимость */}
                                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                                        {entry.paymentType === 'subscription' && (
                                          <Badge variant="outline" className="text-xs">
                                            📋 {entry.sessionsCompleted}/{entry.totalSessions}
                                          </Badge>
                                        )}
                                        {sessionCost > 0 ? (
                                          <span className={`font-semibold ${entry.paymentType !== 'subscription' ? 'ml-auto' : ''}`}>
                                            💰 {sessionCost}₽
                                          </span>
                                        ) : (
                                          <span className={`text-xs text-gray-400 ${entry.paymentType !== 'subscription' ? 'ml-auto' : ''}`}>
                                            Стоимость не указана
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Статус оплаты */}
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        {entry.isPaid ? (
                                          <div className="flex items-center gap-1 text-green-600">
                                            <span className="text-xs">✅ Оплата внесена</span>
                                            {entry.paidDate && (
                                              <span className="text-xs text-gray-500">
                                                ({new Date(entry.paidDate).toLocaleDateString('ru-RU')})
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          // Проверяем, есть ли у клиента действующий абонемент
                                          (() => {
                                            const hasActiveSubscription = entry.paymentType === 'subscription' && 
                                              entry.sessionsCompleted < entry.totalSessions;
                                            
                                            // Проверяем, определена ли сумма оплаты
                                            const hasPaymentAmount = (entry.paymentAmount || 0) > 0 || 
                                                                    (entry.subscriptionCost || 0) > 0 ||
                                                                    (entry.paymentTotalAmount || 0) > 0;
                                            
                                            // Если есть действующий абонемент или сумма не определена, не показываем "Ожидается оплата"
                                            if (hasActiveSubscription || !hasPaymentAmount) {
                                              return null;
                                            }
                                            
                                            return (
                                              <div className="flex items-center gap-1 text-orange-600">
                                                <span className="text-xs">⚠️ Ожидается оплата</span>
                                              </div>
                                            );
                                          })()
                                        )}
                                        {entry.paymentDueThisDay && !entry.isPaid && (
                                          <div className="flex items-center gap-1 text-red-600 mt-1">
                                            <span className="text-xs font-semibold">🔔 Оплатить в этот день!</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
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