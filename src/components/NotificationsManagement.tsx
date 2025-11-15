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
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import { MessengerNotificationPanel } from "./MessengerNotificationPanel";

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

  // Настройки автоматической рассылки
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('autoSendEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [autoSendTime, setAutoSendTime] = useState<string>(() => {
    return localStorage.getItem('autoSendTime') || '18:00';
  });
  const [autoSendMessenger, setAutoSendMessenger] = useState<'whatsapp' | 'telegram' | 'vk'>(() => {
    return (localStorage.getItem('autoSendMessenger') as any) || 'whatsapp';
  });
  const [autoSendTemplate, setAutoSendTemplate] = useState<string>(() => {
    return localStorage.getItem('autoSendTemplate') || 
      "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение";
  });
  const [lastAutoSendDate, setLastAutoSendDate] = useState<string>(() => {
    return localStorage.getItem('lastAutoSendDate') || '';
  });

  // Сохранение настроек автоматической рассылки в localStorage
  useEffect(() => {
    localStorage.setItem('autoSendEnabled', JSON.stringify(autoSendEnabled));
  }, [autoSendEnabled]);

  useEffect(() => {
    localStorage.setItem('autoSendTime', autoSendTime);
  }, [autoSendTime]);

  useEffect(() => {
    localStorage.setItem('autoSendMessenger', autoSendMessenger);
  }, [autoSendMessenger]);

  useEffect(() => {
    localStorage.setItem('autoSendTemplate', autoSendTemplate);
  }, [autoSendTemplate]);

  useEffect(() => {
    localStorage.setItem('lastAutoSendDate', lastAutoSendDate);
  }, [lastAutoSendDate]);

  // Функция автоматической отправки оповещений
  const performAutoSend = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Проверяем, что не отправляли сегодня
    if (lastAutoSendDate === todayString) {
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
      const message = autoSendTemplate
        .replace('{parentName}', parent.parentName)
        .replace('{childName}', parent.childName)
        .replace('{date}', tomorrow.toLocaleDateString('ru-RU'))
        .replace('{time}', parent.sessionTime)
        .replace('{specialist}', parent.specialist);
      
      const cleanPhone = parent.phone.replace(/\D/g, '');
      let link = '';
      
      switch (autoSendMessenger) {
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
      if (autoSendMessenger === 'whatsapp') {
        window.open(link, '_blank');
      }
      
      newLogs.push({
        id: Date.now().toString() + Math.random(),
        childId: parent.childId,
        childName: parent.childName,
        parentName: parent.parentName,
        phone: parent.phone,
        messenger: autoSendMessenger,
        message: message,
        date: tomorrowString,
        time: autoSendTime,
        status: 'sent'
      });

      // Обновляем историю оповещений в карточке клиента
      const child = children.find(c => c.id === parent.childId);
      if (child) {
        const notificationEntry = {
          id: Date.now().toString() + Math.random(),
          date: tomorrowString,
          time: autoSendTime,
          messenger: autoSendMessenger,
          recipientName: parent.parentName,
          recipientPhone: parent.phone,
          message: message,
          sentBy: 'Автоматическая рассылка'
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
    setLastAutoSendDate(todayString);
  };

  // Проверка времени для автоматической рассылки
  useEffect(() => {
    if (!autoSendEnabled) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentTime === autoSendTime) {
        performAutoSend();
      }
    };

    // Проверяем каждую минуту
    const interval = setInterval(checkTime, 60000);
    
    // Проверяем сразу при загрузке
    checkTime();

    return () => clearInterval(interval);
  }, [autoSendEnabled, autoSendTime, schedule, children, lastAutoSendDate]);

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

      {/* Настройки автоматической рассылки */}
      <Card>
        <CardHeader>
          <CardTitle>Автоматическая рассылка</CardTitle>
          <CardDescription>
            Настройте автоматическую отправку оповещений о занятиях на следующий день ежедневно в 18:00
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Включение/выключение автоматической рассылки */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Автоматическая ежедневная рассылка
              </Label>
              <p className="text-sm text-muted-foreground">
                {autoSendEnabled 
                  ? `Рассылка включена. Оповещения отправляются ежедневно в ${autoSendTime}`
                  : 'Рассылка отключена. Включите для автоматической отправки'}
              </p>
              {lastAutoSendDate && autoSendEnabled && (
                <p className="text-xs text-muted-foreground">
                  Последняя рассылка: {new Date(lastAutoSendDate).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
            <Switch
              checked={autoSendEnabled}
              onCheckedChange={setAutoSendEnabled}
            />
          </div>

          {autoSendEnabled && (
            <>
              {/* Время отправки */}
              <div className="space-y-2">
                <Label>Время отправки (по умолчанию 18:00)</Label>
                <Input 
                  type="time"
                  value={autoSendTime}
                  onChange={(e) => setAutoSendTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Рассылка будет отправляться ежедневно в указанное время
                </p>
              </div>

              {/* Мессенджер */}
              <div className="space-y-2">
                <Label>Мессенджер для рассылки</Label>
                <Select value={autoSendMessenger} onValueChange={(value: any) => setAutoSendMessenger(value)}>
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

              {/* Шаблон сообщения */}
              <div className="space-y-2">
                <Label>Шаблон сообщения для автоматической рассылки</Label>
                <Textarea 
                  value={autoSendTemplate}
                  onChange={(e) => setAutoSendTemplate(e.target.value)}
                  rows={4}
                  placeholder="Используйте переменные: {parentName}, {childName}, {date}, {time}, {specialist}"
                />
                <p className="text-xs text-muted-foreground">
                  Доступные переменные: {'{parentName}'}, {'{childName}'}, {'{date}'}, {'{time}'}, {'{specialist}'}
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Система будет автоматически проверять расписание на следующий день и отправлять оповещения всем родителям, у которых указаны телефоны. Рассылка происходит один раз в день в {autoSendTime}.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

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