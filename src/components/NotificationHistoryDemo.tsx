import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Phone } from "lucide-react";
import { NotificationHistoryEntry } from "../types";

// Демонстрационные данные
const demoNotifications: NotificationHistoryEntry[] = [
  {
    id: "1",
    date: "2025-11-15",
    time: "18:00",
    messenger: "whatsapp",
    recipientName: "Анна Петровна",
    recipientPhone: "+7 (916) 123-45-67",
    message: "Добрый день, Анна Петровна! Напоминаем, что завтра, 16.11.2025 в 10:00, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    sentBy: "Автоматическая рассылка"
  },
  {
    id: "2",
    date: "2025-11-14",
    time: "14:30",
    messenger: "telegram",
    recipientName: "Сергей Иванович",
    recipientPhone: "+7 (925) 987-65-43",
    message: "Уважаемый Сергей Иванович! Занятие перенесено на 15 ноября в 11:00. Просим подтвердить возможность посещения.",
    sentBy: "Администратор"
  },
  {
    id: "3",
    date: "2025-11-10",
    time: "18:00",
    messenger: "whatsapp",
    recipientName: "Анна Петровна",
    recipientPhone: "+7 (916) 123-45-67",
    message: "Добрый день, Анна Петровна! Напоминаем, что завтра, 11.11.2025 в 10:00, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    sentBy: "Автоматическая рассылка"
  },
  {
    id: "4",
    date: "2025-11-08",
    time: "16:45",
    messenger: "vk",
    recipientName: "Анна Петровна",
    recipientPhone: "+7 (916) 123-45-67",
    message: "Здравствуйте! Напоминаем о предстоящей оплате абонемента на следующий месяц. Стоимость: 12 000 рублей за 8 занятий.",
    sentBy: "Администратор"
  },
  {
    id: "5",
    date: "2025-11-05",
    time: "18:00",
    messenger: "whatsapp",
    recipientName: "Сергей Иванович",
    recipientPhone: "+7 (925) 987-65-43",
    message: "Добрый день, Сергей Иванович! Напоминаем, что завтра, 06.11.2025 в 14:30, у вас запланировано занятие. Пожалуйста, подтвердите свое посещение",
    sentBy: "Автоматическая рассылка"
  }
];

export function NotificationHistoryDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Демонстрация: История оповещений</h1>
          <p className="text-muted-foreground">
            Так выглядит вкладка "История оповещений" в карточке клиента
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>История оповещений</CardTitle>
                <CardDescription>
                  Все отправленные уведомления родителям этого клиента
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {demoNotifications.length} записей
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoNotifications
                .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                .map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            notification.messenger === 'whatsapp' ? 'bg-green-100 border-green-300' :
                            notification.messenger === 'telegram' ? 'bg-blue-100 border-blue-300' :
                            'bg-purple-100 border-purple-300'
                          }`}
                        >
                          {notification.messenger === 'whatsapp' && '📱 WhatsApp'}
                          {notification.messenger === 'telegram' && '✈️ Telegram'}
                          {notification.messenger === 'vk' && '💬 VK'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('ru-RU', { 
                            day: '2-digit', 
                            month: 'long',
                            year: 'numeric'
                          })} в {notification.time}
                        </span>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={
                          notification.sentBy === 'Автоматическая рассылка' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {notification.sentBy === 'Автоматическая рассылка' && '🤖 '}
                        {notification.sentBy === 'Администратор' && '👤 '}
                        {notification.sentBy}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-900">{notification.recipientName}</span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {notification.recipientPhone}
                        </span>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded border border-blue-100 shadow-sm">
                        <p className="text-sm leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Особенности интерфейса:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>📱 Цветная маркировка мессенджеров (WhatsApp - зелёный, Telegram - синий, VK - фиолетовый)</li>
            <li>🤖 Автоматические рассылки помечены специальным бейджем</li>
            <li>📅 Показывается точная дата и время отправки</li>
            <li>👤 Отображается получатель и его телефон</li>
            <li>💬 Полный текст сообщения в отдельном блоке</li>
            <li>📊 Счётчик общего количества оповещений</li>
            <li>🔄 Сортировка от новых к старым</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
