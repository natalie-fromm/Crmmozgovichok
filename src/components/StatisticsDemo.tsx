import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Users, Calendar, DollarSign, UserPlus, Settings, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function StatisticsDemo() {
  // Демонстрационные данные для статистики
  const totalIncome = 94500; // Общий доход за весь период (с учётом лого-услуг)
  const incomeNovember = 10900; // Доход в ноябре
  
  // Доход по категориям специалистов
  const incomeByCategory = {
    neuropsychologist: 32000, // Нейропсихологи (Мария Петрова)
    psychologist: 27400, // Психологи (Елена Сидорова)
    speech_therapist: 20300, // Логопеды (Ольга Смирнова)
  };

  // Доход по типам услуг
  const incomeByService = {
    'neuro-diagnosis': 13000, // 4 диагностики
    'neuro-session': 35900, // 15 занятий
    'psycho-diagnosis': 9600, // 3 диагностики
    'psycho-session': 21200, // 9 занятий
    'logo-diagnosis': 6000, // 2 диагностики
    'logo-session': 8800, // 4 занятия
  };

  // Зарплаты специалистов за ноябрь 2024
  const salaries = [
    { id: '1', specialistName: 'Мария Петрова', amount: 45000 },
    { id: '2', specialistName: 'Елена Сидорова', amount: 42000 },
    { id: '3', specialistName: 'Ольга Смирнова', amount: 38000 },
  ];

  // Расходы за ноябрь 2024
  const expenses = {
    rent: 50000,
    materials: 8500,
    stationery: 3200,
    household: 4500,
    accounting: 12000,
    security: 6000,
    advertising: 15000,
  };

  // Настройки
  const taxRate = 6; // 6% налог
  const acquiringRate = 2.5; // 2.5% эквайринг

  // Расчёт общих расходов
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
  const totalSalaries = salaries.reduce((sum, s) => sum + s.amount, 0);
  
  // Расчёт налогов и комиссий от дохода ноября
  const taxAmount = (incomeNovember * taxRate) / 100;
  const acquiringAmount = (incomeNovember * acquiringRate) / 100;
  
  // Чистая прибыль
  const netProfit = incomeNovember - totalExpenses - totalSalaries - taxAmount - acquiringAmount;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Демонстрация вкладки "Статистика" - Полный обзор</h1>
          <p className="text-sm text-muted-foreground">
            Пример отображения всех разделов статистики с заполненными данными за ноябрь 2024
          </p>
        </div>

        {/* Карточки основной статистики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Всего клиентов</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">7</div>
              <p className="text-xs text-muted-foreground mt-1">
                Активных клиентов в системе
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Занятий в этом месяце</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">4</div>
              <p className="text-xs text-muted-foreground mt-1">
                Завершенных занятий в ноябре
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Доход за месяц</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">10 900 ₽</div>
              <p className="text-xs text-muted-foreground mt-1">
                Доход в ноябре 2024
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Чистая прибыль</CardTitle>
              {netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                За ноябрь 2024
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Статистика регистраций */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Статистика регистраций клиентов</CardTitle>
                <CardDescription>Просмотр количества новых клиентов за выбранный период</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm">Год:</label>
                <Select value="2024" disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="2024" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все года</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Месяц:</label>
                <Select value="all" disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все месяцы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все месяцы</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="p-3 bg-white rounded-full">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Зарегистрировано в 2024 году
                  </p>
                  <div className="text-3xl mt-1">7</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика дохода */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика дохода</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm">Год:</label>
                <Select value="all" disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все года" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все года</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 opacity-50">
                <label className="text-sm">Месяц:</label>
                <Select disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="p-3 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl text-blue-600">₽</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Всего дохода
                  </p>
                  <div className="text-3xl mt-1">{totalIncome.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>
            </div>

            {/* Доход по категориям специалистов */}
            <div className="pt-4">
              <h3 className="mb-3">Доход по категориям специалистов</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Нейропсихологи</span>
                  </div>
                  <span className="font-semibold">{incomeByCategory.neuropsychologist.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Психологи</span>
                  </div>
                  <span className="font-semibold">{incomeByCategory.psychologist.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Логопеды</span>
                  </div>
                  <span className="font-semibold">{incomeByCategory.speech_therapist.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>

            {/* Доход по типам услуг */}
            <div className="pt-4">
              <h3 className="mb-3">Доход по типам услуг</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Нейро-диагностика</span>
                  </div>
                  <span className="font-semibold">{incomeByService['neuro-diagnosis'].toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Нейро-занятие</span>
                  </div>
                  <span className="font-semibold">{incomeByService['neuro-session'].toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Психо-диагностика</span>
                  </div>
                  <span className="font-semibold">{incomeByService['psycho-diagnosis'].toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Психо-занятие</span>
                  </div>
                  <span className="font-semibold">{incomeByService['psycho-session'].toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Лого-диагностика</span>
                  </div>
                  <span className="font-semibold">{incomeByService['logo-diagnosis'].toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <span>Лого-занятие</span>
                  </div>
                  <span className="font-semibold">{incomeByService['logo-session'].toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Управление зарплатами */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Управление зарплатами специалистов</CardTitle>
                <CardDescription>Просмотр и редактирование зарплат за выбранный месяц</CardDescription>
              </div>
              <Button size="sm">Добавить запись</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="space-y-2">
                <Label>Месяц:</Label>
                <Select value="2024-11" disabled>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ноябрь 2024" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-11">Ноябрь 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm">Специалист</th>
                    <th className="text-right p-3 text-sm">Зарплата</th>
                    <th className="text-right p-3 text-sm w-[100px]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((salary) => (
                    <tr key={salary.id} className="border-b last:border-b-0">
                      <td className="p-3">{salary.specialistName}</td>
                      <td className="p-3 text-right">
                        {salary.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm">Изменить</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="p-3 font-semibold">Итого:</td>
                    <td className="p-3 text-right font-semibold">
                      {totalSalaries.toLocaleString('ru-RU')} ₽
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Управление расходами */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Управление расходами</CardTitle>
                <CardDescription>Учёт месячных расходов центра</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="space-y-2">
                <Label>Месяц:</Label>
                <Select value="2024-11" disabled>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ноябрь 2024" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-11">Ноябрь 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Аренда:</Label>
                <Input type="number" value={expenses.rent} disabled />
              </div>

              <div className="space-y-2">
                <Label>Материалы:</Label>
                <Input type="number" value={expenses.materials} disabled />
              </div>

              <div className="space-y-2">
                <Label>Канцелярия:</Label>
                <Input type="number" value={expenses.stationery} disabled />
              </div>

              <div className="space-y-2">
                <Label>Хозяйственные:</Label>
                <Input type="number" value={expenses.household} disabled />
              </div>

              <div className="space-y-2">
                <Label>Бухгалтерия:</Label>
                <Input type="number" value={expenses.accounting} disabled />
              </div>

              <div className="space-y-2">
                <Label>Охрана:</Label>
                <Input type="number" value={expenses.security} disabled />
              </div>

              <div className="space-y-2">
                <Label>Реклама:</Label>
                <Input type="number" value={expenses.advertising} disabled />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-red-600" />
                  <span className="font-semibold">Общие расходы за месяц:</span>
                </div>
                <span className="font-semibold text-red-600">
                  {totalExpenses.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline">Отмена</Button>
              <Button>Сохранить</Button>
            </div>
          </CardContent>
        </Card>

        {/* Настройки налогов и комиссий */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Настройки налогов и комиссий</CardTitle>
            </div>
            <CardDescription>
              Укажите процент налога и комиссии за эквайринг для расчёта чистой прибыли
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Налог (%):</Label>
                <Input type="number" value={taxRate} disabled />
              </div>

              <div className="space-y-2">
                <Label>Эквайринг (%):</Label>
                <Input type="number" value={acquiringRate} disabled />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Доход за ноябрь:</span>
                <span className="font-semibold">{incomeNovember.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Налог ({taxRate}%):</span>
                <span>- {taxAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Эквайринг ({acquiringRate}%):</span>
                <span>- {acquiringAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Зарплаты:</span>
                <span>- {totalSalaries.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Расходы:</span>
                <span>- {totalExpenses.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Чистая прибыль:</span>
                <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {netProfit.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline">Отмена</Button>
              <Button>Сохранить настройки</Button>
            </div>
          </CardContent>
        </Card>

        {/* Итоговая информация */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Финансовый отчёт за ноябрь 2024
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Общий доход</p>
              <p className="text-2xl text-green-600">{incomeNovember.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Общие затраты</p>
              <p className="text-2xl text-red-600">
                {(totalExpenses + totalSalaries + taxAmount + acquiringAmount).toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Чистая прибыль</p>
              <p className={`text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm">
            <strong>💡 Демонстрация:</strong> Это полный обзор вкладки "Статистика" со всеми заполненными данными. 
            Включает статистику регистраций, дохода по категориям и типам услуг, управление зарплатами и расходами, 
            настройки налогов и комиссий, а также финансовый отчёт с расчётом чистой прибыли.
          </p>
        </div>
      </div>
    </div>
  );
}
