import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MessageSquare, Send, Clock, CheckCircle2, Phone, Calendar } from "lucide-react";
import { Input } from "./ui/input";

// Демонстрационные данные
const demoParents = [
  {
    id: "1-mother",
    childId: "1",
    childName: "Иванов Александр",
    parentName: "Анна Петровна",
    phone: "+7 (916) 123-45-67",
    parentType: "mother",
    sessionTime: "10:00",
    specialist: "Петрова Елена"
  },
  {
    id: "1-father",
    childId: "1",
    childName: "Иванов Александр",
    parentName: "Сергей Иванович",
    phone: "+7 (925) 987-65-43",
    parentType: "father",
    sessionTime: "10:00",
    specialist: "Петрова Елена"
  },
  {
    id: "2-mother",
    childId: "2",
    childName: "Смирнова Мария",
    parentName: "Ольга Викторовна",
    phone: "+7 (903) 555-77-88",
    parentType: "mother",
    sessionTime: "11:30",
    specialist: "Сидорова Анна"
  },
  {
    id: "3-father",
    childId: "3",
    childName: "Петров Дмитрий",
    parentName: "Михаил Андреевич",
    phone: "+7 (915) 222-33-44",
    parentType: "father",
    sessionTime: "14:00",
    specialist: "Козлова Мария"
  }
];

export function PersonalNotificationDemo() {
  const [selectedMessenger, setSelectedMessenger] = useState<'whatsapp' | 'telegram' | 'vk'>('whatsapp');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [messageTemplate, setMessageTemplate] = useState<string>(
    "Добрый день, {parentName}! Напоминаем, что {date} в {time} у вас запланировано занятие. Пожалуйста, подтвердите свое посещение."
  );
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  
  // Настройки для каждого мессенджера отдельно
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappTime, setWhatsappTime] = useState("18:00");
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Добрый день, {parentName}! Напоминаем, что {date} в {time} у вас запланировано занятие. Пожалуйста, подтвердите свое посещение."
  );
  
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramTime, setTelegramTime] = useState("18:00");
  const [telegramTemplate, setTelegramTemplate] = useState(
    "Добрый день, {parentName}! Напоминаем, что {date} в {time} у вас запланировано занятие. Пожалуйста, подтвердите свое посещение."
  );
  
  const [vkEnabled, setVkEnabled] = useState(false);
  const [vkTime, setVkTime] = useState("18:00");
  const [vkTemplate, setVkTemplate] = useState(
    "Добрый день, {parentName}! Напоминаем, что {date} в {time} у вас запланировано занятие. Пожалуйста, подтвердите свое посещение."
  );

  const toggleParent = (parentId: string) => {
    const newSelected = new Set(selectedParents);
    if (newSelected.has(parentId)) {
      newSelected.delete(parentId);
    } else {
      newSelected.add(parentId);
    }
    setSelectedParents(newSelected);
  };

  const selectAll = () => {
    setSelectedParents(new Set(demoParents.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedParents(new Set());
  };

  const formatMessage = (parent: typeof demoParents[0]) => {
    return messageTemplate
      .replace('{parentName}', parent.parentName)
      .replace('{childName}', parent.childName)
      .replace('{date}', new Date(selectedDate).toLocaleDateString('ru-RU'))
      .replace('{time}', parent.sessionTime)
      .replace('{specialist}', parent.specialist);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Демонстрация: Персональная рассылка оповещений</h1>
          <p className="text-muted-foreground">
            Так выглядит интерфейс отправки персональных оповещений во вкладке "Оповещения"
          </p>
        </div>

        <Tabs defaultValue="manual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Send className="w-4 h-4 mr-2" />
              Персональная рассылка
            </TabsTrigger>
            <TabsTrigger value="auto">
              <Clock className="w-4 h-4 mr-2" />
              Автоматическая рассылка
            </TabsTrigger>
          </TabsList>

          {/* Персональная рассылка */}
          <TabsContent value="manual">
            <div className="grid grid-cols-2 gap-6">
              {/* Левая колонка - настройки */}
              <Card>
                <CardHeader>
                  <CardTitle>Настройки рассылки</CardTitle>
                  <CardDescription>Выберите мессенджер, дату и настройте шаблон сообщения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Выбор мессенджера */}
                  <div className="space-y-3">
                    <Label>Мессенджер</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={selectedMessenger === 'whatsapp' ? 'default' : 'outline'}
                        onClick={() => setSelectedMessenger('whatsapp')}
                        className="w-full"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        variant={selectedMessenger === 'telegram' ? 'default' : 'outline'}
                        onClick={() => setSelectedMessenger('telegram')}
                        className="w-full"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Telegram
                      </Button>
                      <Button
                        variant={selectedMessenger === 'vk' ? 'default' : 'outline'}
                        onClick={() => setSelectedMessenger('vk')}
                        className="w-full"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        VK
                      </Button>
                    </div>
                  </div>

                  {/* Выбор даты */}
                  <div className="space-y-2">
                    <Label>Дата занятий</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Шаблон сообщения */}
                  <div className="space-y-2">
                    <Label>Шаблон сообщения</Label>
                    <Textarea
                      value={messageTemplate}
                      onChange={(e) => setMessageTemplate(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="font-semibold">Доступные переменные:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li><code>{'{parentName}'}</code> - имя родителя</li>
                        <li><code>{'{childName}'}</code> - имя ребенка</li>
                        <li><code>{'{date}'}</code> - дата занятия</li>
                        <li><code>{'{time}'}</code> - время занятия</li>
                        <li><code>{'{specialist}'}</code> - имя специалиста</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Правая колонка - список родителей */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Выбор получателей</CardTitle>
                      <CardDescription>
                        Выбрано: {selectedParents.size} из {demoParents.length}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Выбрать всех
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Снять выбор
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoParents.map((parent) => (
                    <div
                      key={parent.id}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => toggleParent(parent.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedParents.has(parent.id)}
                          onCheckedChange={() => toggleParent(parent.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{parent.childName}</p>
                              <p className="text-xs text-muted-foreground">
                                Занятие: {parent.sessionTime} • {parent.specialist}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {parent.parentType === 'mother' ? 'Мать' : 'Отец'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span className="font-medium">{parent.parentName}</span>
                            <span className="text-muted-foreground text-xs font-mono">{parent.phone}</span>
                          </div>
                          {selectedParents.has(parent.id) && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-900">{formatMessage(parent)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Кнопка отправки */}
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    disabled={selectedParents.size === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Отправить {selectedParents.size > 0 ? `(${selectedParents.size})` : ''}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Автоматическая рассылка */}
          <TabsContent value="auto">
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">Настройка автоматических рассылок</p>
                    <p className="text-sm text-muted-foreground">
                      Настройте отдельные рассылки для каждого мессенджера. Каждая рассылка может иметь своё время и шаблон сообщения.
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp рассылка */}
              <Card className={whatsappEnabled ? 'border-green-300 bg-green-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">📱 WhatsApp рассылка</CardTitle>
                        <CardDescription>
                          {whatsappEnabled ? `Активна • Отправка в ${whatsappTime}` : 'Отключена'}
                        </CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={whatsappEnabled}
                      onCheckedChange={(checked) => setWhatsappEnabled(checked as boolean)}
                    />
                  </div>
                </CardHeader>
                {whatsappEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Время отправки</Label>
                      <Input
                        type="time"
                        value={whatsappTime}
                        onChange={(e) => setWhatsappTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Шаблон сообщения</Label>
                      <Textarea
                        value={whatsappTemplate}
                        onChange={(e) => setWhatsappTemplate(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground p-3 bg-white rounded border border-green-200">
                      <p className="font-semibold mb-1">💡 Доступные переменные:</p>
                      <code>{'{parentName}'}</code>, <code>{'{childName}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{specialist}'}</code>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Telegram рассылка */}
              <Card className={telegramEnabled ? 'border-blue-300 bg-blue-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">✈️ Telegram рассылка</CardTitle>
                        <CardDescription>
                          {telegramEnabled ? `Активна • Отправка в ${telegramTime}` : 'Отключена'}
                        </CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={telegramEnabled}
                      onCheckedChange={(checked) => setTelegramEnabled(checked as boolean)}
                    />
                  </div>
                </CardHeader>
                {telegramEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Время отправки</Label>
                      <Input
                        type="time"
                        value={telegramTime}
                        onChange={(e) => setTelegramTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Шаблон сообщения</Label>
                      <Textarea
                        value={telegramTemplate}
                        onChange={(e) => setTelegramTemplate(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground p-3 bg-white rounded border border-blue-200">
                      <p className="font-semibold mb-1">💡 Доступные переменные:</p>
                      <code>{'{parentName}'}</code>, <code>{'{childName}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{specialist}'}</code>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* VK рассылка */}
              <Card className={vkEnabled ? 'border-purple-300 bg-purple-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">💬 VK Мессенджер рассылка</CardTitle>
                        <CardDescription>
                          {vkEnabled ? `Активна • Отправка в ${vkTime}` : 'Отключена'}
                        </CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={vkEnabled}
                      onCheckedChange={(checked) => setVkEnabled(checked as boolean)}
                    />
                  </div>
                </CardHeader>
                {vkEnabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Время отправки</Label>
                      <Input
                        type="time"
                        value={vkTime}
                        onChange={(e) => setVkTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Шаблон сообщения</Label>
                      <Textarea
                        value={vkTemplate}
                        onChange={(e) => setVkTemplate(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground p-3 bg-white rounded border border-purple-200">
                      <p className="font-semibold mb-1">💡 Доступные переменные:</p>
                      <code>{'{parentName}'}</code>, <code>{'{childName}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{specialist}'}</code>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Сводка активных рассылок */}
              {(whatsappEnabled || telegramEnabled || vkEnabled) && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold text-green-900">Активные автоматические рассылки</p>
                      <div className="space-y-1 text-sm text-green-700">
                        {whatsappEnabled && (
                          <p>📱 <strong>WhatsApp</strong> — ежедневно в {whatsappTime}</p>
                        )}
                        {telegramEnabled && (
                          <p>✈️ <strong>Telegram</strong> — ежедневно в {telegramTime}</p>
                        )}
                        {vkEnabled && (
                          <p>💬 <strong>VK Мессенджер</strong> — ежедневно в {vkTime}</p>
                        )}
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        💡 Система автоматически проверит расписание и отправит уведомления родителям о занятиях на следующий день. Каждый клиент получит сообщение в тот мессенджер, который указан в его карточке.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Подсказки */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Как работает персональная рассылка:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Выберите мессенджер</strong> - WhatsApp, Telegram или VK Мессенджер</li>
            <li><strong>Укажите дату занятий</strong> - система покажет только родителей детей с занятиями на эту дату</li>
            <li><strong>Настройте шаблон</strong> - используйте переменные для персонализации сообщений</li>
            <li><strong>Выберите получателей</strong> - отметьте нужных родителей или выберите всех сразу</li>
            <li><strong>Предпросмотр</strong> - при выборе родителя видно, как будет выглядеть его сообщение</li>
            <li><strong>Отправка</strong> - при нажатии кнопки откроются вкладки мессенджера для каждого получателя</li>
            <li><strong>История сохраняется</strong> - все отправленные сообщения записываются в карточку клиента</li>
          </ul>
        </div>
      </div>
    </div>
  );
}