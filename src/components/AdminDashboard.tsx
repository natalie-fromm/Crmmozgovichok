import { useState } from "react";
import { Child, Specialist, ScheduleEntry, ChildStatistics, SpecialistSalary, MonthlyExpense, ExpenseSettings } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ChildCardView } from "./ChildCardView";
import { ScheduleView } from "./ScheduleView";
import { NewChildForm } from "./NewChildForm";
import { SpecialistsManagement } from "./SpecialistsManagement";
import { KnowledgeBase } from "./KnowledgeBase";
import { ExpenseManagement } from "./ExpenseManagement";
import { MaterialsManagement } from "./MaterialsManagement";
import { ScenarioManagement } from "./ScenarioManagement";
import { NotificationsManagement } from "./NotificationsManagement";
import { Users, Calendar, BarChart3, LogOut, Search, TrendingUp, DollarSign, Download, Plus, Archive, ArchiveRestore, UserCog, BookOpen, UserPlus, FolderOpen, FileText, Bell } from "lucide-react";
import { exportStatisticsToPDF } from "../utils/pdfExport";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";

interface AdminDashboardProps {
  children: Child[];
  schedule: ScheduleEntry[];
  specialists: Specialist[];
  salaries: SpecialistSalary[];
  expenses: MonthlyExpense[];
  expenseSettings: ExpenseSettings;
  onUpdateChild: (child: Child) => void;
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
  onUpdateSpecialists: (specialists: Specialist[]) => void;
  onUpdateSalaries: (salaries: SpecialistSalary[]) => void;
  onUpdateExpenses: (expenses: MonthlyExpense[]) => void;
  onUpdateExpenseSettings: (settings: ExpenseSettings) => void;
  onLogout: () => void;
  onAddChild?: (child: Child) => void;
}

export function AdminDashboard({ 
  children, 
  schedule, 
  specialists, 
  salaries,
  expenses,
  expenseSettings,
  onUpdateChild, 
  onUpdateSchedule, 
  onUpdateSpecialists, 
  onUpdateSalaries,
  onUpdateExpenses,
  onUpdateExpenseSettings,
  onLogout, 
  onAddChild 
}: AdminDashboardProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [viewArchived, setViewArchived] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedIncomeYear, setSelectedIncomeYear] = useState<string>('all');
  const [selectedIncomeMonth, setSelectedIncomeMonth] = useState<string>('all');

  const calculateStatistics = (childId: string): ChildStatistics => {
    const childSchedule = schedule.filter(e => e.childId === childId);
    const completedSessions = childSchedule.filter(e => e.status === 'completed').length;
    const absences = childSchedule.filter(e => e.status === 'absent').length;
    
    const absencesByCategory: Record<string, number> = {};
    childSchedule.forEach(entry => {
      if (entry.status === 'absent' && entry.absenceCategory) {
        absencesByCategory[entry.absenceCategory] = (absencesByCategory[entry.absenceCategory] || 0) + 1;
      }
    });

    const monthlyPayments: Record<string, number> = {};
    childSchedule.forEach(entry => {
      if (entry.status === 'completed') {
        const month = entry.date.slice(0, 7);
        monthlyPayments[month] = (monthlyPayments[month] || 0) + entry.paymentAmount;
      }
    });

    const totalPayments = Object.values(monthlyPayments).reduce((sum, amount) => sum + amount, 0);
    const totalScheduled = childSchedule.length;
    const attendanceRate = totalScheduled > 0 ? (completedSessions / totalScheduled) * 100 : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const sessionsThisMonth = childSchedule.filter(
      e => e.date.startsWith(currentMonth) && e.status === 'completed'
    ).length;

    return {
      childId,
      totalSessions: completedSessions,
      totalAbsences: absences,
      absencesByCategory,
      attendanceRate,
      monthlyPayments,
      totalPayments,
      sessionsThisMonth
    };
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Разделяем на активные и архивные
  const activeChildren = filteredChildren.filter(child => !child.archived);
  const archivedChildren = filteredChildren.filter(child => child.archived);

  // Выбираем какие дети отображать
  const displayChildren = viewArchived ? archivedChildren : activeChildren;

  // Фунция для расчета новых регистраций
  const calculateNewRegistrations = () => {
    let filteredByPeriod = children;
    
    if (selectedYear !== 'all') {
      filteredByPeriod = filteredByPeriod.filter(child => {
        const registrationYear = new Date(child.firstVisitDate).getFullYear().toString();
        return registrationYear === selectedYear;
      });
      
      if (selectedMonth !== 'all') {
        filteredByPeriod = filteredByPeriod.filter(child => {
          const registrationMonth = (new Date(child.firstVisitDate).getMonth() + 1).toString().padStart(2, '0');
          return registrationMonth === selectedMonth;
        });
      }
    }
    
    return filteredByPeriod.length;
  };

  // Получаем доступные года из дат регистрации
  const availableYears = Array.from(new Set(
    children.map(child => new Date(child.firstVisitDate).getFullYear().toString())
  )).sort((a, b) => b.localeCompare(a));

  // Функция для расчета дохода за период
  const calculateIncome = () => {
    let filteredSchedule = schedule.filter(entry => entry.status === 'completed');
    
    if (selectedIncomeYear !== 'all') {
      filteredSchedule = filteredSchedule.filter(entry => {
        const entryYear = new Date(entry.date).getFullYear().toString();
        return entryYear === selectedIncomeYear;
      });
      
      if (selectedIncomeMonth !== 'all') {
        filteredSchedule = filteredSchedule.filter(entry => {
          const entryMonth = (new Date(entry.date).getMonth() + 1).toString().padStart(2, '0');
          return entryMonth === selectedIncomeMonth;
        });
      }
    }
    
    return filteredSchedule.reduce((sum, entry) => sum + entry.paymentAmount, 0);
  };

  // Функция для расчета дохода по категориям специалистов
  const calculateIncomeByCategory = () => {
    let filteredSchedule = schedule.filter(entry => entry.status === 'completed');
    
    if (selectedIncomeYear !== 'all') {
      filteredSchedule = filteredSchedule.filter(entry => {
        const entryYear = new Date(entry.date).getFullYear().toString();
        return entryYear === selectedIncomeYear;
      });
      
      if (selectedIncomeMonth !== 'all') {
        filteredSchedule = filteredSchedule.filter(entry => {
          const entryMonth = (new Date(entry.date).getMonth() + 1).toString().padStart(2, '0');
          return entryMonth === selectedIncomeMonth;
        });
      }
    }
    
    const incomeByCategory: Record<string, number> = {
      neuropsychologist: 0,
      psychologist: 0,
      speech_therapist: 0,
      special_educator: 0,
      uncategorized: 0
    };
    
    filteredSchedule.forEach(entry => {
      const specialist = specialists.find(s => s.id === entry.specialistId);
      const category = specialist?.category || 'uncategorized';
      incomeByCategory[category] = (incomeByCategory[category] || 0) + entry.paymentAmount;
    });
    
    return incomeByCategory;
  };

  // Получаем доступные года из дат занятий
  const availableIncomeYears = Array.from(new Set(
    schedule.map(entry => new Date(entry.date).getFullYear().toString())
  )).sort((a, b) => b.localeCompare(a));

  const handleArchiveToggle = (child: Child) => {
    const updatedChild = { ...child, archived: !child.archived };
    onUpdateChild(updatedChild);
  };

  const handleAddChild = (newChild: Child) => {
    if (onAddChild) {
      onAddChild(newChild);
    }
    setShowNewChildForm(false);
  };

  const handleUpdateChild = (updatedChild: Child) => {
    onUpdateChild(updatedChild);
    setSelectedChild(updatedChild);
  };

  if (selectedChild) {
    const stats = calculateStatistics(selectedChild.id);
    const canEdit = !selectedChild.archived; // Архивные карточки только для чтения
    return (
      <ChildCardView
        child={selectedChild}
        statistics={stats}
        onBack={() => {
          setSelectedChild(null);
          setIsReadOnly(false);
        }}
        onUpdate={(updatedChild) => {
          onUpdateChild(updatedChild);
          setSelectedChild(updatedChild);
        }}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showNewChildForm && (
        <NewChildForm
          onSave={handleAddChild}
          onCancel={() => setShowNewChildForm(false)}
          existingChildren={children}
        />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Логотип" className="w-10 h-10" />
            <div>
              <h1>CRM-МОЗГОВИЧОК</h1>
              <p className="text-sm text-muted-foreground">Панель администратора</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="children" className="space-y-4">
          <TabsList>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Оповещения
            </TabsTrigger>
            <TabsTrigger value="specialists" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Специалисты
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Материалы
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Сценарии
            </TabsTrigger>
            <TabsTrigger value="knowledgebase" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              База знаний
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="children">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle>Карточки клиентов</CardTitle>
                    <CardDescription>
                      {viewArchived ? `Архив: ${archivedChildren.length}` : `Активных: ${activeChildren.length}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск по имени или шифру"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewArchived(!viewArchived)}
                    >
                      {viewArchived ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Активные
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 mr-2" />
                          Архив
                        </>
                      )}
                    </Button>
                    {!viewArchived && (
                      <Button
                        size="sm"
                        onClick={() => setShowNewChildForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Создать карточку
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Шифр</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Возраст</TableHead>
                      <TableHead>Дата рождения</TableHead>
                      <TableHead>Дата обращения</TableHead>
                      <TableHead>Занятия</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayChildren.map((child) => {
                      const stats = calculateStatistics(child.id);
                      const childSchedule = schedule.filter(e => e.childId === child.id);
                      const totalScheduled = childSchedule.length; // всего запланировано
                      const completedSessions = stats.totalSessions; // фактически посещено
                      
                      // Проверяем, осталось ли 7 или меньше дней до дня рождения
                      const today = new Date();
                      const currentYear = today.getFullYear();
                      const birthDate = new Date(child.birthDate);
                      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                      
                      // Если день рождения уже прошел в этом году, смотрим на следующий год
                      if (birthdayThisYear < today) {
                        birthdayThisYear.setFullYear(currentYear + 1);
                      }
                      
                      const daysUntilBirthday = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isBirthdaySoon = daysUntilBirthday <= 7 && daysUntilBirthday >= 0;
                      
                      return (
                        <TableRow key={child.id}>
                          <TableCell>
                            <Badge variant="outline">{child.code}</Badge>
                          </TableCell>
                          <TableCell>{child.name}</TableCell>
                          <TableCell>{child.age} лет</TableCell>
                          <TableCell 
                            style={{ 
                              color: isBirthdaySoon ? '#bd0688' : 'inherit',
                              fontWeight: isBirthdaySoon ? 'bold' : 'normal'
                            }}
                          >
                            {new Date(child.birthDate).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>{new Date(child.firstVisitDate).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>
                            <Badge>{completedSessions} / {totalScheduled}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedChild(child)}
                                style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                              >
                                Открыть карточку
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchiveToggle(child)}
                              >
                                {child.archived ? (
                                  <>
                                    <ArchiveRestore className="w-4 h-4 mr-1" />
                                    Восстановить
                                  </>
                                ) : (
                                  <>
                                    <Archive className="w-4 h-4 mr-1" />
                                    Архивировать
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleView schedule={schedule} specialists={specialists} children={children} onUpdateSchedule={onUpdateSchedule} />
          </TabsContent>

          <TabsContent value="statistics">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Всего клиентов</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{children.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Занятий в этом месяце</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">
                      {children.reduce((sum, child) => {
                        const stats = calculateStatistics(child.id);
                        return sum + stats.sessionsThisMonth;
                      }, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Доход за месяц</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">
                      {children.reduce((sum, child) => {
                        const stats = calculateStatistics(child.id);
                        const currentMonth = new Date().toISOString().slice(0, 7);
                        return sum + (stats.monthlyPayments[currentMonth] || 0);
                      }, 0).toLocaleString('ru-RU')} ₽
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                      <Select 
                        value={selectedYear} 
                        onValueChange={(value) => {
                          setSelectedYear(value);
                          if (value === 'all') {
                            setSelectedMonth('all');
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Выберите год" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все года</SelectItem>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedYear !== 'all' && (
                      <div className="space-y-2">
                        <label className="text-sm">Месяц:</label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Выберите месяц" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все месяцы</SelectItem>
                            <SelectItem value="01">Январь</SelectItem>
                            <SelectItem value="02">Февраль</SelectItem>
                            <SelectItem value="03">Март</SelectItem>
                            <SelectItem value="04">Апрель</SelectItem>
                            <SelectItem value="05">Май</SelectItem>
                            <SelectItem value="06">Июнь</SelectItem>
                            <SelectItem value="07">Июль</SelectItem>
                            <SelectItem value="08">Август</SelectItem>
                            <SelectItem value="09">Сентябрь</SelectItem>
                            <SelectItem value="10">Октябрь</SelectItem>
                            <SelectItem value="11">Ноябрь</SelectItem>
                            <SelectItem value="12">Декабрь</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="p-3 bg-white rounded-full">
                        <UserPlus className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedYear === 'all' 
                            ? 'Всего клиентов зарегистрировано'
                            : selectedMonth === 'all'
                              ? `Зарегистрировано в ${selectedYear} году`
                              : `Зарегистрировано в ${['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][parseInt(selectedMonth) - 1]} ${selectedYear}`
                          }
                        </p>
                        <div className="text-3xl mt-1">{calculateNewRegistrations()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Подробная статистика по клиентам</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Имя</TableHead>
                        <TableHead>Занятий всего</TableHead>
                        <TableHead>Занятий в месяце</TableHead>
                        <TableHead>Пропусков</TableHead>
                        <TableHead>Посещаемость</TableHead>
                        <TableHead>Оплата за месяц</TableHead>
                        <TableHead>Всего оплачено</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {children.map((child) => {
                        const stats = calculateStatistics(child.id);
                        const currentMonth = new Date().toISOString().slice(0, 7);
                        return (
                          <TableRow key={child.id}>
                            <TableCell>{child.name}</TableCell>
                            <TableCell>{stats.totalSessions}</TableCell>
                            <TableCell>{stats.sessionsThisMonth}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span>{stats.totalAbsences}</span>
                                {Object.entries(stats.absencesByCategory).map(([category, count]) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}: {count}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{stats.attendanceRate.toFixed(1)}%</span>
                                <span className="text-xs text-muted-foreground">
                                  {stats.totalSessions}/{stats.totalSessions + stats.totalAbsences}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(stats.monthlyPayments[currentMonth] || 0).toLocaleString('ru-RU')} ₽
                            </TableCell>
                            <TableCell>
                              {stats.totalPayments.toLocaleString('ru-RU')} ₽
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportStatisticsToPDF(children, calculateStatistics)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт в PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика дохода</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Год:</label>
                      <Select 
                        value={selectedIncomeYear} 
                        onValueChange={(value) => {
                          setSelectedIncomeYear(value);
                          if (value === 'all') {
                            setSelectedIncomeMonth('all');
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Выберите год" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все года</SelectItem>
                          {availableIncomeYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedIncomeYear !== 'all' && (
                      <div className="space-y-2">
                        <label className="text-sm">Месяц:</label>
                        <Select value={selectedIncomeMonth} onValueChange={setSelectedIncomeMonth}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Выберите месяц" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все месяцы</SelectItem>
                            <SelectItem value="01">Январь</SelectItem>
                            <SelectItem value="02">Февраль</SelectItem>
                            <SelectItem value="03">Март</SelectItem>
                            <SelectItem value="04">Апрель</SelectItem>
                            <SelectItem value="05">Май</SelectItem>
                            <SelectItem value="06">Июнь</SelectItem>
                            <SelectItem value="07">Июль</SelectItem>
                            <SelectItem value="08">Август</SelectItem>
                            <SelectItem value="09">Сентябрь</SelectItem>
                            <SelectItem value="10">Октябрь</SelectItem>
                            <SelectItem value="11">Ноябрь</SelectItem>
                            <SelectItem value="12">Декабрь</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="p-3 bg-white rounded-full flex items-center justify-center">
                        <span className="text-3xl text-blue-600">₽</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedIncomeYear === 'all' 
                            ? 'Всего дохода'
                            : selectedIncomeMonth === 'all'
                              ? `Доход в ${selectedIncomeYear} году`
                              : `Доход в ${['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][parseInt(selectedIncomeMonth) - 1]} ${selectedIncomeYear}`
                          }
                        </p>
                        <div className="text-3xl mt-1">{calculateIncome().toLocaleString('ru-RU')} ₽</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-3">Доход по категориям специалистов</h3>
                    <div className="space-y-3">
                      {(() => {
                        const incomeByCategory = calculateIncomeByCategory();
                        const getCategoryLabel = (category: string) => {
                          switch (category) {
                            case 'neuropsychologist': return 'Нейропсихологи';
                            case 'psychologist': return 'Психологи';
                            case 'speech_therapist': return 'Логопеды';
                            case 'special_educator': return 'Дефектологи';
                            case 'uncategorized': return 'Без категории';
                            default: return category;
                          }
                        };

                        const getCategoryColor = (category: string) => {
                          switch (category) {
                            case 'neuropsychologist': return 'from-purple-50 to-purple-100 border-purple-200';
                            case 'psychologist': return 'from-green-50 to-green-100 border-green-200';
                            case 'speech_therapist': return 'from-orange-50 to-orange-100 border-orange-200';
                            case 'special_educator': return 'from-pink-50 to-pink-100 border-pink-200';
                            case 'uncategorized': return 'from-gray-50 to-gray-100 border-gray-200';
                            default: return 'from-blue-50 to-blue-100 border-blue-200';
                          }
                        };

                        return Object.entries(incomeByCategory)
                          .filter(([_, amount]) => amount > 0)
                          .map(([category, amount]) => (
                            <div 
                              key={category} 
                              className={`flex items-center justify-between p-4 bg-gradient-to-r ${getCategoryColor(category)} rounded-lg border`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <span>{getCategoryLabel(category)}</span>
                              </div>
                              <span className="font-semibold">{amount.toLocaleString('ru-RU')} ₽</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика расходов */}
              <ExpenseManagement
                salaries={salaries}
                expenses={expenses}
                expenseSettings={expenseSettings}
                specialists={specialists}
                schedule={schedule}
                onUpdateSalaries={onUpdateSalaries}
                onUpdateExpenses={onUpdateExpenses}
                onUpdateExpenseSettings={onUpdateExpenseSettings}
                selectedYear={selectedIncomeYear}
                selectedMonth={selectedIncomeMonth}
              />
            </div>
          </TabsContent>

          <TabsContent value="specialists">
            <SpecialistsManagement
              specialists={specialists}
              onUpdateSpecialists={onUpdateSpecialists}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsManagement
              children={children}
              schedule={schedule}
              onUpdateChild={handleUpdateChild}
            />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsManagement />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioManagement />
          </TabsContent>

          <TabsContent value="knowledgebase">
            <KnowledgeBase specialists={specialists} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}