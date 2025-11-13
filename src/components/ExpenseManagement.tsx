import { useState } from "react";
import { SpecialistSalary, MonthlyExpense, ExpenseSettings, Specialist, ScheduleEntry } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TrendingDown, Settings, Plus, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface ExpenseManagementProps {
  salaries: SpecialistSalary[];
  expenses: MonthlyExpense[];
  expenseSettings: ExpenseSettings;
  specialists: Specialist[];
  schedule: ScheduleEntry[];
  onUpdateSalaries: (salaries: SpecialistSalary[]) => void;
  onUpdateExpenses: (expenses: MonthlyExpense[]) => void;
  onUpdateExpenseSettings: (settings: ExpenseSettings) => void;
  selectedYear: string;
  selectedMonth: string;
}

export function ExpenseManagement({
  salaries,
  expenses,
  expenseSettings,
  specialists,
  schedule,
  onUpdateSalaries,
  onUpdateExpenses,
  onUpdateExpenseSettings,
  selectedYear,
  selectedMonth
}: ExpenseManagementProps) {
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Форма зарплаты
  const [salarySpecialistId, setSalarySpecialistId] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  
  // Форма расходов
  const [expenseMonth, setExpenseMonth] = useState("");
  const [expenseRent, setExpenseRent] = useState("");
  const [expenseMaterials, setExpenseMaterials] = useState("");
  const [expenseStationery, setExpenseStationery] = useState("");
  const [expenseHousehold, setExpenseHousehold] = useState("");
  const [expenseAccounting, setExpenseAccounting] = useState("");
  const [expenseSecurity, setExpenseSecurity] = useState("");
  const [expenseAdvertising, setExpenseAdvertising] = useState("");
  
  // Настройки
  const [taxRate, setTaxRate] = useState(expenseSettings.taxRate.toString());
  const [acquiringRate, setAcquiringRate] = useState(expenseSettings.acquiringRate.toString());

  // Расчет расходов за период
  const calculateTotalExpenses = () => {
    let totalSalaries = 0;
    let totalTaxes = 0;
    let totalAcquiring = 0;
    let totalOtherExpenses = 0;

    // Фильтруем зарплаты
    let filteredSalaries = salaries;
    if (selectedYear !== 'all') {
      filteredSalaries = filteredSalaries.filter(salary => {
        const year = salary.month.split('-')[0];
        return year === selectedYear;
      });
      
      if (selectedMonth !== 'all') {
        filteredSalaries = filteredSalaries.filter(salary => {
          const month = salary.month.split('-')[1];
          return month === selectedMonth;
        });
      }
    }
    totalSalaries = filteredSalaries.reduce((sum, salary) => sum + salary.amount, 0);

    // Фильтруем расходы
    let filteredExpenses = expenses;
    if (selectedYear !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => {
        const year = expense.month.split('-')[0];
        return year === selectedYear;
      });
      
      if (selectedMonth !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => {
          const month = expense.month.split('-')[1];
          return month === selectedMonth;
        });
      }
    }
    filteredExpenses.forEach(expense => {
      totalOtherExpenses += expense.rent + expense.materials + expense.stationery + 
                            expense.household + expense.accounting + expense.security + 
                            expense.advertising;
    });

    // Фильтруем занятия для налогов и комиссий
    let filteredSchedule = schedule.filter(entry => entry.status === 'completed');
    if (selectedYear !== 'all') {
      filteredSchedule = filteredSchedule.filter(entry => {
        const entryYear = new Date(entry.date).getFullYear().toString();
        return entryYear === selectedYear;
      });
      
      if (selectedMonth !== 'all') {
        filteredSchedule = filteredSchedule.filter(entry => {
          const entryMonth = (new Date(entry.date).getMonth() + 1).toString().padStart(2, '0');
          return entryMonth === selectedMonth;
        });
      }
    }

    // Расчет налогов
    const totalIncome = filteredSchedule.reduce((sum, entry) => sum + entry.paymentAmount, 0);
    totalTaxes = totalIncome * (expenseSettings.taxRate / 100);

    // Расчет комиссий за эквайринг (только для безналичных платежей)
    const cardPayments = filteredSchedule.filter(entry => entry.paymentMethod === 'card');
    const cardIncome = cardPayments.reduce((sum, entry) => sum + entry.paymentAmount, 0);
    totalAcquiring = cardIncome * (expenseSettings.acquiringRate / 100);

    return {
      salaries: totalSalaries,
      taxes: totalTaxes,
      acquiring: totalAcquiring,
      other: totalOtherExpenses,
      total: totalSalaries + totalTaxes + totalAcquiring + totalOtherExpenses
    };
  };

  const handleAddSalary = () => {
    if (!salarySpecialistId || !salaryMonth || !salaryAmount) return;

    const specialist = specialists.find(s => s.id === salarySpecialistId);
    if (!specialist) return;

    const newSalary: SpecialistSalary = {
      id: Date.now().toString(),
      specialistId: salarySpecialistId,
      specialistName: `${specialist.lastName} ${specialist.firstName}`,
      month: salaryMonth,
      amount: parseFloat(salaryAmount)
    };

    onUpdateSalaries([...salaries, newSalary]);
    
    // Сброс формы
    setSalarySpecialistId("");
    setSalaryMonth("");
    setSalaryAmount("");
    setShowSalaryForm(false);
  };

  const handleDeleteSalary = (id: string) => {
    onUpdateSalaries(salaries.filter(s => s.id !== id));
  };

  const handleAddExpense = () => {
    if (!expenseMonth) return;

    // Проверяем, существует ли уже запись за этот месяц
    const existingExpense = expenses.find(e => e.month === expenseMonth);
    
    if (existingExpense) {
      // Обновляем существующую запись
      const updatedExpenses = expenses.map(e =>
        e.month === expenseMonth
          ? {
              ...e,
              rent: parseFloat(expenseRent) || 0,
              materials: parseFloat(expenseMaterials) || 0,
              stationery: parseFloat(expenseStationery) || 0,
              household: parseFloat(expenseHousehold) || 0,
              accounting: parseFloat(expenseAccounting) || 0,
              security: parseFloat(expenseSecurity) || 0,
              advertising: parseFloat(expenseAdvertising) || 0
            }
          : e
      );
      onUpdateExpenses(updatedExpenses);
    } else {
      // Создаем новую запись
      const newExpense: MonthlyExpense = {
        id: Date.now().toString(),
        month: expenseMonth,
        rent: parseFloat(expenseRent) || 0,
        materials: parseFloat(expenseMaterials) || 0,
        stationery: parseFloat(expenseStationery) || 0,
        household: parseFloat(expenseHousehold) || 0,
        accounting: parseFloat(expenseAccounting) || 0,
        security: parseFloat(expenseSecurity) || 0,
        advertising: parseFloat(expenseAdvertising) || 0
      };
      onUpdateExpenses([...expenses, newExpense]);
    }

    // Сброс формы
    setExpenseMonth("");
    setExpenseRent("");
    setExpenseMaterials("");
    setExpenseStationery("");
    setExpenseHousehold("");
    setExpenseAccounting("");
    setExpenseSecurity("");
    setExpenseAdvertising("");
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
  };

  const handleSaveSettings = () => {
    onUpdateExpenseSettings({
      taxRate: parseFloat(taxRate) || 0,
      acquiringRate: parseFloat(acquiringRate) || 0
    });
    setShowSettings(false);
  };

  const totalExpenses = calculateTotalExpenses();

  return (
    <div className="space-y-4">
      {/* Настройки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Настройки расчета расходов</CardTitle>
              <CardDescription>Процентные ставки для автоматического расчета</CardDescription>
            </div>
            <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Скрыть' : 'Настроить'}
            </Button>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Налоги (% от дохода)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Комиссия эквайринга (% от безнала)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={acquiringRate}
                  onChange={(e) => setAcquiringRate(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings}>Сохранить настройки</Button>
          </CardContent>
        )}
      </Card>

      {/* Общая статистика расходов */}
      <Card>
        <CardHeader>
          <CardTitle>Общие расходы за выбранный период</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Зарплаты</p>
              <p className="text-2xl">{totalExpenses.salaries.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Налоги ({expenseSettings.taxRate}%)</p>
              <p className="text-2xl">{totalExpenses.taxes.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Эквайринг ({expenseSettings.acquiringRate}%)</p>
              <p className="text-2xl">{totalExpenses.acquiring.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Прочие расходы</p>
              <p className="text-2xl">{totalExpenses.other.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg col-span-2 md:col-span-2">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Итого расходов</p>
                  <p className="text-3xl">{totalExpenses.total.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Зарплаты */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Зарплаты специалистов</CardTitle>
            <Button onClick={() => setShowSalaryForm(!showSalaryForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить зарплату
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSalaryForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Специалист</Label>
                  <Select value={salarySpecialistId} onValueChange={setSalarySpecialistId}>
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
                  <Label>Месяц (YYYY-MM)</Label>
                  <Input
                    type="month"
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма</Label>
                  <Input
                    type="number"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSalary}>Добавить</Button>
                <Button onClick={() => setShowSalaryForm(false)} variant="outline">Отмена</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Специалист</TableHead>
                <TableHead>Месяц</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Нет записей о зарплатах
                  </TableCell>
                </TableRow>
              ) : (
                salaries
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map(salary => (
                    <TableRow key={salary.id}>
                      <TableCell>{salary.specialistName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {new Date(salary.month + '-01').toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                        </Badge>
                      </TableCell>
                      <TableCell>{salary.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSalary(salary.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Прочие расходы */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Прочие расходы</CardTitle>
            <Button onClick={() => setShowExpenseForm(!showExpenseForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить расходы
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showExpenseForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="space-y-2">
                <Label>Месяц (YYYY-MM)</Label>
                <Input
                  type="month"
                  value={expenseMonth}
                  onChange={(e) => setExpenseMonth(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Аренда</Label>
                  <Input
                    type="number"
                    value={expenseRent}
                    onChange={(e) => setExpenseRent(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Материалы</Label>
                  <Input
                    type="number"
                    value={expenseMaterials}
                    onChange={(e) => setExpenseMaterials(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Канцелярия</Label>
                  <Input
                    type="number"
                    value={expenseStationery}
                    onChange={(e) => setExpenseStationery(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Хозяйственные</Label>
                  <Input
                    type="number"
                    value={expenseHousehold}
                    onChange={(e) => setExpenseHousehold(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бухгалтерия</Label>
                  <Input
                    type="number"
                    value={expenseAccounting}
                    onChange={(e) => setExpenseAccounting(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Охрана</Label>
                  <Input
                    type="number"
                    value={expenseSecurity}
                    onChange={(e) => setExpenseSecurity(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Реклама</Label>
                  <Input
                    type="number"
                    value={expenseAdvertising}
                    onChange={(e) => setExpenseAdvertising(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense}>Сохранить</Button>
                <Button onClick={() => setShowExpenseForm(false)} variant="outline">Отмена</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Месяц</TableHead>
                <TableHead>Аренда</TableHead>
                <TableHead>Материалы</TableHead>
                <TableHead>Канцелярия</TableHead>
                <TableHead>Хозяйственные</TableHead>
                <TableHead>Бухгалтерия</TableHead>
                <TableHead>Охрана</TableHead>
                <TableHead>Реклама</TableHead>
                <TableHead>Итого</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    Нет записей о расходах
                  </TableCell>
                </TableRow>
              ) : (
                expenses
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map(expense => {
                    const total = expense.rent + expense.materials + expense.stationery + 
                                  expense.household + expense.accounting + expense.security + 
                                  expense.advertising;
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {new Date(expense.month + '-01').toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.rent.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.materials.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.stationery.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.household.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.accounting.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.security.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{expense.advertising.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{total.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
