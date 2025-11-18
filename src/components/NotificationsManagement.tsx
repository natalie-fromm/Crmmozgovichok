import { useState, useEffect } from "react";
import { Child, ScheduleEntry } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, Plus, Trash2, Edit } from "lucide-react";
import { MessengerNotificationPanel } from "./MessengerNotificationPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface NotificationsManagementProps {
  children: Child[];
  schedule: ScheduleEntry[];
  onUpdateChild: (child: Child) => void;
}

interface NotificationLog {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  phone: string;
  messenger: string;
  message: string;
  date: string;
  time: string;
  status: 'pending' | 'sent' | 'failed';
}

interface MessengerSettings {
  selectedParents: Set<string>;
  messageTemplate: string;
  notificationTime: string;
}

interface AutoSendSchedule {
  id: string;
  name: string;
  enabled: boolean;
  time: string;
  messenger: 'whatsapp' | 'telegram' | 'vk';
  template: string;
  lastSendDate: string;
}

export function NotificationsManagement({ children, schedule, onUpdateChild }: NotificationsManagementProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  
  // Отдельные настройки для каждого мессенджера
  const [whatsappSettings, setWhatsappSettings] = useState<MessengerSettings>({
    selectedParents: new Set(),
    messageTemplate: "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    notificationTime: "18:00"
  });
  
  const [telegramSettings, setTelegramSettings] = useState<MessengerSettings>({
    selectedParents: new Set(),
    messageTemplate: "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    notificationTime: "18:00"
  });
  
  const [vkSettings, setVkSettings] = useState<MessengerSettings>({
    selectedParents: new Set(),
    messageTemplate: "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    notificationTime: "18:00"
  });

  // Множественные автоматические рассылки
  const [autoSendSchedules, setAutoSendSchedules] = useState<AutoSendSchedule[]>(() => {
    const saved = localStorage.getItem('autoSendSchedules');
    return saved ? JSON.parse(saved) : [];
  });

  // Диалог создания/редактирования рассылки
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AutoSendSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    time: '18:00',
    messenger: 'whatsapp' as 'whatsapp' | 'telegram' | 'vk',
    template: "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение"
  });

  // Сохранение расписаний в localStorage
  useEffect(() => {
    localStorage.setItem('autoSendSchedules', JSON.stringify(autoSendSchedules));
  }, [autoSendSchedules]);

  // Открыть диалог создания новой рассылки
  const openNewScheduleDialog = () => {
    setEditingSchedule(null);
    setScheduleForm({
      name: '',
      time: '18:00',
      messenger: 'whatsapp',
      template: "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение"
    });
    setScheduleDialogOpen(true);
  };

  // Открыть диалог редактирования рассылки
  const openEditScheduleDialog = (scheduleItem: AutoSendSchedule) => {
    setEditingSchedule(scheduleItem);
    setScheduleForm({
      name: scheduleItem.name,
      time: scheduleItem.time,
      messenger: scheduleItem.messenger,
      template: scheduleItem.template
    });
    setScheduleDialogOpen(true);
  };

  // Сохранить рассылку
  const saveSchedule = () => {
    if (!scheduleForm.name.trim()) {
      alert('Пожалуйста, введите название рассылки');
      return;
    }

    if (editingSchedule) {
      // Редактирование существующей рассылки
      setAutoSendSchedules(autoSendSchedules.map(s => 
        s.id === editingSchedule.id
          ? { ...s, ...scheduleForm }
          : s
      ));
    } else {
      // Создание новой рассылки
      const newSchedule: AutoSendSchedule = {
        id: Date.now().toString(),
        ...scheduleForm,
        enabled: true,
        lastSendDate: ''
      };
      setAutoSendSchedules([...autoSendSchedules, newSchedule]);
    }

    setScheduleDialogOpen(false);
  };

  // Удалить рассылку
  const deleteSchedule = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту рассылку?')) {
      setAutoSendSchedules(autoSendSchedules.filter(s => s.id !== id));
    }
  };

  // Переключить включение/выключение рассылки
  const toggleSchedule = (id: string) => {
    setAutoSendSchedules(autoSendSchedules.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Функция автоматической отправки оповещений для конкретной рассылки
  const performAutoSend = (scheduleItem: AutoSendSchedule) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Проверяем, что не отправляли сегодня
    if (scheduleItem.lastSendDate === todayString) {
      return;
    }

    // Получаем завтрашнюю дату
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // Получаем занятия на завтра
    const tomorrowSchedule = schedule.filter(entry => entry.date === tomorrowString);
    
    if (tomorrowSchedule.length === 0) {
      return; // Нет занятий на завтра
    }

    // Формируем список родителей для рассылки
    const parentsToNotify: Array<{
      id: string;
      childId: string;
      childName: string;
      parentName: string;
      phone: string;
      parentType: 'mother' | 'father';
      sessionTime: string;
      specialist: string;
    }> = [];

    tomorrowSchedule.forEach(entry => {
      const child = children.find(c => c.id === entry.childId);
      if (child) {
        if (child.motherPhone) {
          parentsToNotify.push({
            id: `${child.id}-mother`,
            childId: child.id,
            childName: child.name,
            parentName: child.motherName || 'Мама',
            phone: child.motherPhone,
            parentType: 'mother',
            sessionTime: entry.time,
            specialist: entry.specialistName
          });
        }
        
        if (child.fatherPhone) {
          parentsToNotify.push({
            id: `${child.id}-father`,
            childId: child.id,
            childName: child.name,
            parentName: child.fatherName || 'Папа',
            phone: child.fatherPhone,
            parentType: 'father',
            sessionTime: entry.time,
            specialist: entry.specialistName
          });
        }
      }
    });

    // Отправляем оповещения
    const newLogs: NotificationLog[] = [];
    
    parentsToNotify.forEach(parent => {
      const message = scheduleItem.template
        .replace('{parentName}', parent.parentName)
        .replace('{childName}', parent.childName)
        .replace('{date}', tomorrow.toLocaleDateString('ru-RU'))
        .replace('{time}', parent.sessionTime)
        .replace('{specialist}', parent.specialist);
      
      const cleanPhone = parent.phone.replace(/\D/g, '');
      let link = '';
      
      switch (scheduleItem.messenger) {
        case 'whatsapp':
          link = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          break;
        case 'telegram':
          link = `https://t.me/+${cleanPhone}`;
          break;
        case 'vk':
          link = `https://vk.me/+${cleanPhone}`;
          break;
      }
      
      // Открываем ссылку для WhatsApp
      if (scheduleItem.messenger === 'whatsapp') {
        window.open(link, '_blank');
      }
      
      newLogs.push({
        id: Date.now().toString() + Math.random(),
        childId: parent.childId,
        childName: parent.childName,
        parentName: parent.parentName,
        phone: parent.phone,
        messenger: scheduleItem.messenger,
        message: message,
        date: tomorrowString,
        time: scheduleItem.time,
        status: 'sent'
      });

      // Обновляем историю оповещений в карточке клиента
      const child = children.find(c => c.id === parent.childId);
      if (child) {
        const notificationEntry = {
          id: Date.now().toString() + Math.random(),
          date: tomorrowString,
          time: scheduleItem.time,
          messenger: scheduleItem.messenger,
          recipientName: parent.parentName,
          recipientPhone: parent.phone,
          message: message,
          sentBy: `Автоматическая рассылка: ${scheduleItem.name}`
        };

        const updatedChild = {
          ...child,
          notificationHistory: [
            ...(child.notificationHistory || []),
            notificationEntry
          ]
        };

        onUpdateChild(updatedChild);
      }
    });

    setNotificationLogs([...newLogs, ...notificationLogs]);
    
    // Обновляем дату последней отправки для этой рассылки
    setAutoSendSchedules(autoSendSchedules.map(s =>
      s.id === scheduleItem.id ? { ...s, lastSendDate: todayString } : s
    ));
  };

  // Проверка времени для всех автоматических рассылок
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Проверяем каждую активную рассылку
      autoSendSchedules.forEach(scheduleItem => {
        if (scheduleItem.enabled && currentTime === scheduleItem.time) {
          performAutoSend(scheduleItem);
        }
      });
    };

    // Проверяем каждую минуту
    const interval = setInterval(checkTime, 60000);
    
    // Проверяем сразу при загрузке
    checkTime();

    return () => clearInterval(interval);
  }, [autoSendSchedules, schedule, children]);

  // Получаем список занятий на выбранную дату
  const getScheduleForDate = () => {
    return schedule.filter(entry => entry.date === selectedDate);
  };

  const scheduledSessions = getScheduleForDate();

  // Получаем уникальные данные родителей для выбранной даты
  const getParentsForDate = () => {
    const parents: Array<{
      id: string;
      childId: string;
      childName: string;
      parentName: string;
      phone: string;
      parentType: 'mother' | 'father';
      sessionTime: string;
      specialist: string;
    }> = [];

    scheduledSessions.forEach(entry => {
      const child = children.find(c => c.id === entry.childId);
      if (child) {
        // Добавляем маму, если есть телефон
        if (child.motherPhone) {
          parents.push({
            id: `${child.id}-mother`,
            childId: child.id,
            childName: child.name,
            parentName: child.motherName || 'Мама',
            phone: child.motherPhone,
            parentType: 'mother',
            sessionTime: entry.time,
            specialist: entry.specialistName
          });
        }
        
        // Добавляем папу, если есть телефон
        if (child.fatherPhone) {
          parents.push({
            id: `${child.id}-father`,
            childId: child.id,
            childName: child.name,
            parentName: child.fatherName || 'Папа',
            phone: child.fatherPhone,
            parentType: 'father',
            sessionTime: entry.time,
            specialist: entry.specialistName
          });
        }
      }
    });

    return parents;
  };

  const parents = getParentsForDate();

  const toggleParentSelection = (parentId: string, messenger: 'whatsapp' | 'telegram' | 'vk') => {
    const newSelection = new Set(messenger === 'whatsapp' ? whatsappSettings.selectedParents : messenger === 'telegram' ? telegramSettings.selectedParents : vkSettings.selectedParents);
    if (newSelection.has(parentId)) {
      newSelection.delete(parentId);
    } else {
      newSelection.add(parentId);
    }
    if (messenger === 'whatsapp') {
      setWhatsappSettings({ ...whatsappSettings, selectedParents: newSelection });
    } else if (messenger === 'telegram') {
      setTelegramSettings({ ...telegramSettings, selectedParents: newSelection });
    } else if (messenger === 'vk') {
      setVkSettings({ ...vkSettings, selectedParents: newSelection });
    }
  };

  const selectAllParents = (messenger: 'whatsapp' | 'telegram' | 'vk') => {
    const currentSettings = messenger === 'whatsapp' ? whatsappSettings : messenger === 'telegram' ? telegramSettings : vkSettings;
    if (currentSettings.selectedParents.size === parents.length) {
      if (messenger === 'whatsapp') {
        setWhatsappSettings({ ...whatsappSettings, selectedParents: new Set() });
      } else if (messenger === 'telegram') {
        setTelegramSettings({ ...telegramSettings, selectedParents: new Set() });
      } else if (messenger === 'vk') {
        setVkSettings({ ...vkSettings, selectedParents: new Set() });
      }
    } else {
      if (messenger === 'whatsapp') {
        setWhatsappSettings({ ...whatsappSettings, selectedParents: new Set(parents.map(p => p.id)) });
      } else if (messenger === 'telegram') {
        setTelegramSettings({ ...telegramSettings, selectedParents: new Set(parents.map(p => p.id)) });
      } else if (messenger === 'vk') {
        setVkSettings({ ...vkSettings, selectedParents: new Set(parents.map(p => p.id)) });
      }
    }
  };

  const formatMessage = (parent: typeof parents[0], messenger: 'whatsapp' | 'telegram' | 'vk') => {
    const template = messenger === 'whatsapp' ? whatsappSettings.messageTemplate : messenger === 'telegram' ? telegramSettings.messageTemplate : vkSettings.messageTemplate;
    return template
      .replace('{parentName}', parent.parentName)
      .replace('{childName}', parent.childName)
      .replace('{date}', new Date(selectedDate).toLocaleDateString('ru-RU'))
      .replace('{time}', parent.sessionTime)
      .replace('{specialist}', parent.specialist);
  };

  const getMessengerLink = (phone: string, message: string, messenger: 'whatsapp' | 'telegram' | 'vk') => {
    // Убираем все символы кроме цифр из номера телефона
    const cleanPhone = phone.replace(/\D/g, '');
    
    switch (messenger) {
      case 'whatsapp':
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      case 'telegram':
        return `https://t.me/+${cleanPhone}`;
      case 'vk':
        return `https://vk.me/+${cleanPhone}`;
      default:
        return '';
    }
  };

  const sendNotifications = (messenger: 'whatsapp' | 'telegram' | 'vk') => {
    const newLogs: NotificationLog[] = [];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    parents.forEach(parent => {
      const currentSettings = messenger === 'whatsapp' ? whatsappSettings : messenger === 'telegram' ? telegramSettings : vkSettings;
      if (currentSettings.selectedParents.has(parent.id)) {
        const message = formatMessage(parent, messenger);
        const link = getMessengerLink(parent.phone, message, messenger);
        
        // Открываем ссылку в новой вкладке (для WhatsApp это откроет веб-версию)
        if (messenger === 'whatsapp') {
          window.open(link, '_blank');
        }
        
        newLogs.push({
          id: Date.now().toString() + Math.random(),
          childId: parent.childId,
          childName: parent.childName,
          parentName: parent.parentName,
          phone: parent.phone,
          messenger: messenger,
          message: message,
          date: selectedDate,
          time: currentTime,
          status: 'sent'
        });

        // Обновляем историю оповещений в карточке клиента
        const child = children.find(c => c.id === parent.childId);
        if (child) {
          const notificationEntry = {
            id: Date.now().toString() + Math.random(),
            date: selectedDate,
            time: currentTime,
            messenger: messenger,
            recipientName: parent.parentName,
            recipientPhone: parent.phone,
            message: message,
            sentBy: 'Администратор'
          };

          const updatedChild = {
            ...child,
            notificationHistory: [
              ...(child.notificationHistory || []),
              notificationEntry
            ]
          };

          onUpdateChild(updatedChild);
        }
      }
    });

    setNotificationLogs([...newLogs, ...notificationLogs]);
    if (messenger === 'whatsapp') {
      setWhatsappSettings({ ...whatsappSettings, selectedParents: new Set() });
    } else if (messenger === 'telegram') {
      setTelegramSettings({ ...telegramSettings, selectedParents: new Set() });
    } else if (messenger === 'vk') {
      setVkSettings({ ...vkSettings, selectedParents: new Set() });
    }
  };

  const getMessengerIcon = (messenger: string) => {
    return <MessageSquare className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getMessengerBadgeColor = (messenger: string) => {
    switch (messenger) {
      case 'whatsapp':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'telegram':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'vk':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Настройка уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle>Отправка оповещений</CardTitle>
          <CardDescription>
            Создайте и отправьте оповещения родителям о предстоящих занятиях по разным мессенджерам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Выбор даты */}
          <div className="space-y-2">
            <Label>Дата занятий</Label>
            <Input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Вкладки для разных мессенджеров */}
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="telegram">
                <MessageSquare className="w-4 h-4 mr-2" />
                Telegram
              </TabsTrigger>
              <TabsTrigger value="vk">
                <MessageSquare className="w-4 h-4 mr-2" />
                VK Мессенджер
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="whatsapp" className="mt-6">
              <MessengerNotificationPanel
                messenger="whatsapp"
                messengerName="WhatsApp"
                selectedDate={selectedDate}
                parents={parents}
                children={children}
                onUpdateChild={onUpdateChild}
                onLogNotification={(log) => setNotificationLogs([log, ...notificationLogs])}
              />
            </TabsContent>
            
            <TabsContent value="telegram" className="mt-6">
              <MessengerNotificationPanel
                messenger="telegram"
                messengerName="Telegram"
                selectedDate={selectedDate}
                parents={parents}
                children={children}
                onUpdateChild={onUpdateChild}
                onLogNotification={(log) => setNotificationLogs([log, ...notificationLogs])}
              />
            </TabsContent>
            
            <TabsContent value="vk" className="mt-6">
              <MessengerNotificationPanel
                messenger="vk"
                messengerName="VK Мессенджер"
                selectedDate={selectedDate}
                parents={parents}
                children={children}
                onUpdateChild={onUpdateChild}
                onLogNotification={(log) => setNotificationLogs([log, ...notificationLogs])}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Автоматические рассылки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Автоматические рассылки</CardTitle>
              <CardDescription>
                Создайте несколько вариантов автоматических рассылок с разным временем и шаблонами
              </CardDescription>
            </div>
            <Button onClick={openNewScheduleDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Создать рассылку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {autoSendSchedules.length === 0 ? (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Автоматические рассылки не настроены. Нажмите "Создать рассылку" для добавления новой.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {autoSendSchedules.map(scheduleItem => (
                <div
                  key={scheduleItem.id}
                  className={`p-4 border rounded-lg ${scheduleItem.enabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Switch
                          checked={scheduleItem.enabled}
                          onCheckedChange={() => toggleSchedule(scheduleItem.id)}
                        />
                        <div>
                          <h3 className="font-semibold">{scheduleItem.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getMessengerBadgeColor(scheduleItem.messenger)}>
                              {scheduleItem.messenger === 'whatsapp' ? 'WhatsApp' : 
                               scheduleItem.messenger === 'telegram' ? 'Telegram' : 'VK'}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scheduleItem.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm text-muted-foreground mb-1">Шаблон сообщения:</p>
                        <p className="text-sm">{scheduleItem.template}</p>
                      </div>

                      {scheduleItem.lastSendDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Последняя отправка: {new Date(scheduleItem.lastSendDate).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditScheduleDialog(scheduleItem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSchedule(scheduleItem.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Каждая рассылка будет автоматически отправляться в указанное время всем родителям, у которых есть занятия на следующий день. Вы можете создать несколько рассылок с разным временем и шаблонами.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования рассылки */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Редактировать рассылку' : 'Создать новую рассылку'}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры автоматической рассылки оповещений
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название рассылки</Label>
              <Input
                placeholder="Например: Вечернее напоминание"
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Время отправки</Label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Мессенджер</Label>
                <Select
                  value={scheduleForm.messenger}
                  onValueChange={(value: any) => setScheduleForm({ ...scheduleForm, messenger: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="vk">VK Мессенджер</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Шаблон сообщения</Label>
              <Textarea
                rows={6}
                value={scheduleForm.template}
                onChange={(e) => setScheduleForm({ ...scheduleForm, template: e.target.value })}
                placeholder="Используйте переменные: {parentName}, {childName}, {date}, {time}, {specialist}"
              />
              <p className="text-xs text-muted-foreground">
                Доступные переменные: {'{parentName}'}, {'{childName}'}, {'{date}'}, {'{time}'}, {'{specialist}'}
              </p>
            </div>

            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Рассылка будет отправляться ежедневно в {scheduleForm.time} всем родителям из расписания на следующий день.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveSchedule}>
              {editingSchedule ? 'Сохранить изменения' : 'Создать рассылку'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* История оповещений */}
      {notificationLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История оповещений</CardTitle>
            <CardDescription>
              Последние отправленные уведомления
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата/Время</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Родитель</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Мессенджер</TableHead>
                  <TableHead>Сообщение</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationLogs.slice(0, 20).map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.date).toLocaleDateString('ru-RU')}<br/>
                      <span className="text-muted-foreground">{log.time}</span>
                    </TableCell>
                    <TableCell>{log.childName}</TableCell>
                    <TableCell>{log.parentName}</TableCell>
                    <TableCell className="font-mono text-sm">{log.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getMessengerIcon(log.messenger)}
                        <span className="ml-1">{log.messenger}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        <span className="text-sm capitalize">{
                          log.status === 'sent' ? 'Отправлено' :
                          log.status === 'failed' ? 'Ошибка' : 'Ожидание'
                        }</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
