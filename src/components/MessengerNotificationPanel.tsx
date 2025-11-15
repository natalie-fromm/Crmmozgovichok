import { useState } from "react";
import { Child, ScheduleEntry } from "../types";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Send, AlertCircle } from "lucide-react";

interface MessengerNotificationPanelProps {
  messenger: 'whatsapp' | 'telegram' | 'vk';
  messengerName: string;
  selectedDate: string;
  parents: Array<{
    id: string;
    childId: string;
    childName: string;
    parentName: string;
    phone: string;
    parentType: 'mother' | 'father';
    sessionTime: string;
    specialist: string;
  }>;
  children: Child[];
  onUpdateChild: (child: Child) => void;
  onLogNotification: (log: any) => void;
}

export function MessengerNotificationPanel({
  messenger,
  messengerName,
  selectedDate,
  parents,
  children,
  onUpdateChild,
  onLogNotification
}: MessengerNotificationPanelProps) {
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  const [messageTemplate, setMessageTemplate] = useState<string>(
    "Добрый день, {parentName}! Напоминаем, что завтра, {date} в {time}, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение"
  );
  const [notificationTime, setNotificationTime] = useState<string>("18:00");

  const toggleParentSelection = (parentId: string) => {
    const newSelection = new Set(selectedParents);
    if (newSelection.has(parentId)) {
      newSelection.delete(parentId);
    } else {
      newSelection.add(parentId);
    }
    setSelectedParents(newSelection);
  };

  const selectAllParents = () => {
    if (selectedParents.size === parents.length) {
      setSelectedParents(new Set());
    } else {
      setSelectedParents(new Set(parents.map(p => p.id)));
    }
  };

  const formatMessage = (parent: typeof parents[0]) => {
    return messageTemplate
      .replace('{parentName}', parent.parentName)
      .replace('{childName}', parent.childName)
      .replace('{date}', new Date(selectedDate).toLocaleDateString('ru-RU'))
      .replace('{time}', parent.sessionTime)
      .replace('{specialist}', parent.specialist);
  };

  const getMessengerLink = (phone: string, message: string) => {
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

  const sendNotifications = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    parents.forEach(parent => {
      if (selectedParents.has(parent.id)) {
        const message = formatMessage(parent);
        const link = getMessengerLink(parent.phone, message);
        
        // Открываем ссылку в новой вкладке (для WhatsApp это откроет веб-версию)
        if (messenger === 'whatsapp') {
          window.open(link, '_blank');
        }
        
        const log = {
          id: Date.now().toString() + Math.random(),
          childId: parent.childId,
          childName: parent.childName,
          parentName: parent.parentName,
          phone: parent.phone,
          messenger: messenger,
          message: message,
          date: selectedDate,
          time: currentTime,
          status: 'sent' as const
        };

        onLogNotification(log);

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

    setSelectedParents(new Set());
  };

  const getMessengerDescription = () => {
    switch (messenger) {
      case 'whatsapp':
        return 'WhatsApp: будет открыто окно веб-версии для каждого получателя. Вы можете отправить сообщение вручную.';
      case 'telegram':
        return 'Telegram: будет открыта страница чата с указанным номером телефона.';
      case 'vk':
        return 'VK Мессенджер: будет открыта страница диалога с указанным номером.';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Шаблон сообщения */}
        <div className="space-y-2">
          <Label>Шаблон сообщения для {messengerName}</Label>
          <Textarea 
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={4}
            placeholder="Используйте переменные: {parentName}, {childName}, {date}, {time}, {specialist}"
          />
          <p className="text-xs text-muted-foreground">
            Доступные переменные: {'{parentName}'}, {'{childName}'}, {'{date}'}, {'{time}'}, {'{specialist}'}
          </p>
        </div>

        {/* Время отправки */}
        <div className="space-y-2">
          <Label>Время отправки (для справки)</Label>
          <Input 
            type="time"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
          />
        </div>

        {/* Список родителей */}
        {parents.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Получатели ({selectedParents.size} выбрано)</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAllParents}
              >
                {selectedParents.size === parents.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedParents.size === parents.length && parents.length > 0}
                        onCheckedChange={selectAllParents}
                      />
                    </TableHead>
                    <TableHead>Родитель</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Время занятия</TableHead>
                    <TableHead>Специалист</TableHead>
                    <TableHead>Предпросмотр</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map(parent => (
                    <TableRow key={parent.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedParents.has(parent.id)}
                          onCheckedChange={() => toggleParentSelection(parent.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {parent.parentName}
                        <Badge variant="outline" className="ml-2">
                          {parent.parentType === 'mother' ? 'Мать' : 'Отец'}
                        </Badge>
                      </TableCell>
                      <TableCell>{parent.childName}</TableCell>
                      <TableCell className="font-mono text-sm">{parent.phone}</TableCell>
                      <TableCell>{parent.sessionTime}</TableCell>
                      <TableCell>{parent.specialist}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(formatMessage(parent));
                          }}
                        >
                          Просмотр
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center gap-4">
              <Alert className="flex-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getMessengerDescription()}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={sendNotifications}
                disabled={selectedParents.size === 0}
                size="lg"
                className="whitespace-nowrap"
              >
                <Send className="w-4 h-4 mr-2" />
                Отправить ({selectedParents.size})
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              На выбранную дату ({new Date(selectedDate).toLocaleDateString('ru-RU')}) нет запланированных занятий или у родителей не указаны телефоны.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
