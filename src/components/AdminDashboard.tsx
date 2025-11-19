import { useState, useEffect } from "react";
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
import { CreateTestDialog } from "./CreateTestDialog";
import { TestViewDialog } from "./TestViewDialog";
import { Users, Calendar, BarChart3, LogOut, Search, TrendingUp, DollarSign, Download, Plus, Archive, ArchiveRestore, UserCog, BookOpen, UserPlus, FolderOpen, FileText, Bell, Award, Trash2, Eye, Pencil } from "lucide-react";
import { exportStatisticsToPDF } from "../utils/pdfExport";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";
import { ClientDashboard } from "./ClientDashboard";

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
  const [showCreateTestDialog, setShowCreateTestDialog] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [showTestViewDialog, setShowTestViewDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testToEdit, setTestToEdit] = useState<any>(null);
  const [selectedDiaryChild, setSelectedDiaryChild] = useState<Child | null>(null);
  const [viewArchivedDiaries, setViewArchivedDiaries] = useState(false);
  const [searchDiaryQuery, setSearchDiaryQuery] = useState('');

  // Загрузка тестов из localStorage при монтировании
  useEffect(() => {
    const savedTests = localStorage.getItem('certification-tests');
    if (savedTests) {
      try {
        setTests(JSON.parse(savedTests));
      } catch (error) {
        console.error('Ошибка загрузки тестов из localStorage:', error);
      }
    }
  }, []);

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
  const activeChildren = filteredChildren.filter(child => !child.archived)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru')); // Сортировка по фамилии
  const archivedChildren = filteredChildren.filter(child => child.archived)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru')); // Сортировка по фамилии

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

  // Функция для расчета дохода по типам услуг
  const calculateIncomeByService = () => {
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
    
    const incomeByService: Record<string, number> = {
      'neuro-diagnosis': 0,
      'neuro-session': 0,
      'psycho-diagnosis': 0,
      'psycho-session': 0,
      'logo-diagnosis': 0,
      'logo-session': 0,
      'unspecified': 0
    };
    
    filteredSchedule.forEach(entry => {
      const serviceType = entry.serviceType || 'unspecified';
      incomeByService[serviceType] = (incomeByService[serviceType] || 0) + entry.paymentAmount;
    });
    
    return incomeByService;
  };

  // Получаем доступные года из дат занятий
  const availableIncomeYears = Array.from(new Set(
    schedule.map(entry => new Date(entry.date).getFullYear().toString())
  )).sort((a, b) => b.localeCompare(a));

  const handleArchiveToggle = (child: Child) => {
    const updatedChild = { 
      ...child, 
      archived: !child.archived,
      archivedDate: !child.archived ? new Date().toISOString() : undefined
    };
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

      <CreateTestDialog
        open={showCreateTestDialog}
        onOpenChange={(open) => {
          setShowCreateTestDialog(open);
          if (!open) {
            setTestToEdit(null);
          }
        }}
        existingTest={testToEdit}
        onSave={(test) => {
          console.log('Получен тест для сохранения:', test);
          console.log('Текущие тесты:', tests);
          
          let updatedTests;
          if (testToEdit) {
            // Режим редактирования - обновляем существующий тест
            updatedTests = tests.map(t => t.id === test.id ? test : t);
            console.log('Тест обновлён:', test);
          } else {
            // Режим создания - добавляем новый тест
            updatedTests = [...tests, test];
            console.log('Создан новый тест:', test);
          }
          
          console.log('Обновлённые тесты:', updatedTests);
          setTests(updatedTests);
          localStorage.setItem('certification-tests', JSON.stringify(updatedTests));
          console.log('Тесты сохранены в localStorage');
          setTestToEdit(null);
        }}
      />

      <TestViewDialog
        open={showTestViewDialog}
        onOpenChange={setShowTestViewDialog}
        test={selectedTest}
      />

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
            <TabsTrigger value="diaries" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Дневники
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Просвещение
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
            <TabsTrigger value="certification" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Аттестация
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
                      {viewArchived ? 'Архив клиентов' : `Активных: ${activeChildren.length}`}
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
                      style={viewArchived ? { backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' } : { backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' }}
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
                      {viewArchived && <TableHead>Дата архивирования</TableHead>}
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
                          {viewArchived && (
                            <TableCell>
                              {child.archivedDate ? new Date(child.archivedDate).toLocaleDateString('ru-RU') : '-'}
                            </TableCell>
                          )}
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
                                style={child.archived ? { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' } : {}}
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

          <TabsContent value="diaries">
            {selectedDiaryChild ? (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDiaryChild(null)}
                  className="mb-4"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Назад к списку
                </Button>
                <ClientDashboard 
                  currentUser={{ 
                    id: 'admin', 
                    name: 'Администратор', 
                    role: 'admin',
                    email: 'admin@example.com',
                    phone: '',
                    specialization: '',
                    salary: 0,
                    category: 'admin'
                  }}
                  child={selectedDiaryChild}
                  schedule={schedule}
                  onLogout={() => setSelectedDiaryChild(null)}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle>Дневники успеха</CardTitle>
                      <CardDescription>
                        {viewArchivedDiaries ? 'Архив клиентов' : `Активных клиентов: ${children.filter(c => !c.archived).length}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={viewArchivedDiaries ? 'default' : 'outline'}
                        onClick={() => setViewArchivedDiaries(!viewArchivedDiaries)}
                        className={viewArchivedDiaries ? '' : 'bg-gray-400 text-white hover:bg-gray-500 border-gray-400'}
                      >
                        {viewArchivedDiaries ? (
                          <>
                            <ArchiveRestore className="w-4 h-4 mr-2" />
                            Активные
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4 mr-2" />
                            Архив
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Поле поиска */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Поиск по фамилии, имени, отчеству или шифру..."
                      value={searchDiaryQuery}
                      onChange={(e) => setSearchDiaryQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {children
                      .filter(child => viewArchivedDiaries ? child.archived : !child.archived)
                      .filter(child => {
                        if (!searchDiaryQuery.trim()) return true;
                        const query = searchDiaryQuery.toLowerCase();
                        return (
                          child.name.toLowerCase().includes(query) ||
                          child.code.toLowerCase().includes(query)
                        );
                      })
                      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                      .map(child => {
                        // Вычисляем статистику по занятиям
                        const childSchedule = schedule.filter(entry => entry.childId === child.id);
                        const totalScheduled = childSchedule.length;
                        const completed = childSchedule.filter(entry => entry.status === 'completed').length;
                        const absent = childSchedule.filter(entry => entry.status === 'absent').length;
                        const attendanceRate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

                        return (
                          <Card 
                            key={child.id}
                            className="hover:bg-gray-100 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div 
                                className="flex items-start justify-between cursor-pointer mb-3"
                                onClick={() => setSelectedDiaryChild(child)}
                              >
                                <div className="flex items-center gap-3">
                                  <Users className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{child.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Шифр: {child.code}
                                    </p>
                                  </div>
                                </div>
                                {child.archived && !viewArchivedDiaries && (
                                  <Badge variant="secondary">
                                    <Archive className="w-3 h-3 mr-1" />
                                    Архив
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Статистика */}
                              <div 
                                className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 cursor-pointer"
                                onClick={() => setSelectedDiaryChild(child)}
                              >
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-muted-foreground">Начало</p>
                                  <p className="font-medium text-sm">
                                    {new Date(child.firstVisitDate).toLocaleDateString('ru-RU')}
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-muted-foreground">Назначено</p>
                                  <p className="font-medium text-sm">{totalScheduled}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="text-xs text-muted-foreground">Пройдено</p>
                                  <p className="font-medium text-sm text-green-700">{completed}</p>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                  <p className="text-xs text-muted-foreground">Пропущено</p>
                                  <p className="font-medium text-sm text-red-700">{absent}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-xs text-muted-foreground">Посещаемость</p>
                                  <p className="font-medium text-sm text-blue-700">{attendanceRate}%</p>
                                </div>
                              </div>

                              {/* Кнопка архивирования */}
                              <Button
                                variant="outline"
                                size="sm"
                                className={`w-full ${
                                  child.archived 
                                    ? 'bg-green-500 text-white hover:bg-green-600 border-green-500' 
                                    : 'bg-gray-400 text-white hover:bg-gray-500 border-gray-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedChild = {
                                    ...child,
                                    archived: !child.archived,
                                    archivedDate: !child.archived ? new Date().toISOString() : undefined
                                  };
                                  onUpdateChild(updatedChild);
                                }}
                              >
                                {child.archived ? (
                                  <>
                                    <ArchiveRestore className="w-4 h-4 mr-2" />
                                    Восстановить
                                  </>
                                ) : (
                                  <>
                                    <Archive className="w-4 h-4 mr-2" />
                                    Архивировать
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    {(() => {
                      const filteredChildren = children
                        .filter(child => viewArchivedDiaries ? child.archived : !child.archived)
                        .filter(child => {
                          if (!searchDiaryQuery.trim()) return true;
                          const query = searchDiaryQuery.toLowerCase();
                          return (
                            child.name.toLowerCase().includes(query) ||
                            child.code.toLowerCase().includes(query)
                          );
                        });
                      
                      if (filteredChildren.length === 0) {
                        return (
                          <p className="text-center text-muted-foreground py-8">
                            {searchDiaryQuery.trim() 
                              ? 'Клиенты не найдены по вашему запросу' 
                              : (viewArchivedDiaries ? 'Нет клиентов в архиве' : 'Нет активных клиентов')
                            }
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Просвещение</CardTitle>
                <CardDescription>
                  Управление материалами для копилки знаний клиентов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Почитать */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Почитать
                      </CardTitle>
                      <CardDescription>
                        Статьи и материалы для чтения
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Материалы для клиентов появятся здесь
                        </p>
                        <Button className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Посмотреть */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Посмотреть
                      </CardTitle>
                      <CardDescription>
                        Видео и обучающие материалы
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Материалы для клиентов появятся здесь
                        </p>
                        <Button className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Позаниматься */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Позаниматься
                      </CardTitle>
                      <CardDescription>
                        Практические упражнения
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Материалы для клиентов появятся здесь
                        </p>
                        <Button className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                          <SelectValue placeholder="Выбеите год" />
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
                          <SelectValue placeholder="ыберите год" />
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

                  <div className="pt-4">
                    <h3 className="mb-3">Доход по типам услуг</h3>
                    <div className="space-y-3">
                      {(() => {
                        const incomeByService = calculateIncomeByService();
                        const getServiceLabel = (serviceType: string) => {
                          switch (serviceType) {
                            case 'neuro-diagnosis': return 'Нейро-диагностика';
                            case 'neuro-session': return 'Нейро-занятие';
                            case 'psycho-diagnosis': return 'Психо-диагностика';
                            case 'psycho-session': return 'Психо-занятие';
                            case 'logo-diagnosis': return 'Лого-диагностика';
                            case 'logo-session': return 'Лого-занятие';
                            case 'unspecified': return 'Не указано';
                            default: return serviceType;
                          }
                        };

                        const getServiceColor = (serviceType: string) => {
                          switch (serviceType) {
                            case 'neuro-diagnosis': return 'from-blue-50 to-blue-100 border-blue-200';
                            case 'neuro-session': return 'from-indigo-50 to-indigo-100 border-indigo-200';
                            case 'psycho-diagnosis': return 'from-green-50 to-green-100 border-green-200';
                            case 'psycho-session': return 'from-teal-50 to-teal-100 border-teal-200';
                            case 'logo-diagnosis': return 'from-orange-50 to-orange-100 border-orange-200';
                            case 'logo-session': return 'from-amber-50 to-amber-100 border-amber-200';
                            case 'unspecified': return 'from-gray-50 to-gray-100 border-gray-200';
                            default: return 'from-blue-50 to-blue-100 border-blue-200';
                          }
                        };

                        return Object.entries(incomeByService)
                          .filter(([_, amount]) => amount > 0)
                          .map(([serviceType, amount]) => (
                            <div 
                              key={serviceType} 
                              className={`flex items-center justify-between p-4 bg-gradient-to-r ${getServiceColor(serviceType)} rounded-lg border`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <span>{getServiceLabel(serviceType)}</span>
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

          <TabsContent value="certification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Аттестация
                </CardTitle>
                <CardDescription>
                  Управление аттестацией специалистов и тестами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="specialists-certification" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="specialists-certification">Аттестация специалистов</TabsTrigger>
                    <TabsTrigger value="tests">Тесты</TabsTrigger>
                  </TabsList>

                  <TabsContent value="specialists-certification">
                    <div className="space-y-6">
                      {/* Активные специалисты */}
                      <div>
                        <h3 className="mb-3">Активные специалисты</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Фамилия, Имя</TableHead>
                              <TableHead>Роль</TableHead>
                              <TableHead>Категория</TableHead>
                              <TableHead>Дата регистрации</TableHead>
                              <TableHead>Дата деактивации</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead>Аттестация</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {specialists
                              .filter(s => s.active !== false)
                              .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'ru'))
                              .map((specialist) => (
                                <TableRow key={specialist.id}>
                                  <TableCell>{specialist.lastName} {specialist.firstName}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {specialist.role === 'admin' ? 'Администратор' : 'Специалист'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {specialist.category ? (
                                      <Badge>
                                        {specialist.category === 'neuropsychologist' && 'Нейропсихолог'}
                                        {specialist.category === 'psychologist' && 'Психолог'}
                                        {specialist.category === 'speech_therapist' && 'Логопед'}
                                        {specialist.category === 'special_educator' && 'Дефектолог'}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">Не указана</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {specialist.createdAt 
                                      ? new Date(specialist.createdAt).toLocaleDateString('ru-RU')
                                      : <span className="text-muted-foreground text-sm">Не указана</span>
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-muted-foreground text-sm">—</span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                    >
                                      Активен
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                    >
                                      Назначить
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Деактивированные специалисты */}
                      {specialists.filter(s => s.active === false).length > 0 && (
                        <div>
                          <h3 className="mb-3 text-muted-foreground">Деактивированные специалисты</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Фамилия, Имя</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Категория</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                                <TableHead>Дата деактивации</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Аттестация</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {specialists
                                .filter(s => s.active === false)
                                .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'ru'))
                                .map((specialist) => (
                                  <TableRow key={specialist.id}>
                                    <TableCell className="text-muted-foreground">
                                      {specialist.lastName} {specialist.firstName}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {specialist.role === 'admin' ? 'Администратор' : 'Специалист'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {specialist.category ? (
                                        <Badge variant="outline">
                                          {specialist.category === 'neuropsychologist' && 'Нейропсихолог'}
                                          {specialist.category === 'psychologist' && 'Психолог'}
                                          {specialist.category === 'speech_therapist' && 'Логопед'}
                                          {specialist.category === 'special_educator' && 'Дефектолог'}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">Не указана</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {specialist.createdAt 
                                        ? new Date(specialist.createdAt).toLocaleDateString('ru-RU')
                                        : <span className="text-muted-foreground text-sm">Не указана</span>
                                      }
                                    </TableCell>
                                    <TableCell>
                                      {specialist.deactivationDate 
                                        ? new Date(specialist.deactivationDate).toLocaleDateString('ru-RU')
                                        : <span className="text-muted-foreground text-sm">Не указана</span>
                                      }
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        Деактивирован
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                      >
                                        Назначить
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="tests">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Тесты для аттестации</CardTitle>
                            <CardDescription>
                              Создание и управление тестами для аттестации специалистов
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                            onClick={() => setShowCreateTestDialog(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Создать тест
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Вложенные вкладки для активных и архивированных тестов */}
                        <Tabs defaultValue="active" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="active">
                              Активные тесты ({tests.filter(t => !t.archived).length})
                            </TabsTrigger>
                            <TabsTrigger value="archived">
                              Архивированные ({tests.filter(t => t.archived).length})
                            </TabsTrigger>
                          </TabsList>

                          {/* Активные тесты */}
                          <TabsContent value="active">
                            {tests.filter(t => !t.archived).length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                <p>Пока нет активных тестов</p>
                                <p className="text-sm mt-2">Создайте первый тест для аттестации специалистов</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Наименование теста</TableHead>
                                    <TableHead>Срок назначения</TableHead>
                                    <TableHead>Количество вопросов</TableHead>
                                    <TableHead>Дата создания</TableHead>
                                    <TableHead>Действия</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tests.filter(t => !t.archived).map((test) => {
                                    const getDeadlineLabel = (deadline: string) => {
                                      switch (deadline) {
                                        case '1-week': return '1 неделя';
                                        case '1-month': return '1 месяц';
                                        case '1-quarter': return '1 квартал';
                                        case '6-months': return '1 полугодие';
                                        case '1-year': return '1 год';
                                        case '2-years': return '2 года';
                                        case '3-years': return '3 года';
                                        case '4-years': return '4 года';
                                        case '5-years': return '5 лет';
                                        case '6-years': return '6 лет';
                                        case '7-years': return '7 лет';
                                        case '8-years': return '8 лет';
                                        case '9-years': return '9 лет';
                                        case '10-years': return '10 лет';
                                        default: return deadline;
                                      }
                                    };

                                    return (
                                      <TableRow key={test.id}>
                                        <TableCell>{test.name}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{getDeadlineLabel(test.deadline)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge>{test.questions?.length || 0}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString('ru-RU') : '-'}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2 flex-wrap">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                              onClick={() => {
                                                setSelectedTest(test);
                                                setShowTestViewDialog(true);
                                              }}
                                            >
                                              <Eye className="w-4 h-4 mr-1" />
                                              Просмотр
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                              onClick={() => {
                                                setTestToEdit(test);
                                                setShowCreateTestDialog(true);
                                              }}
                                            >
                                              <Pencil className="w-4 h-4 mr-1" />
                                              Редактирование
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                                              onClick={() => {
                                                const updatedTests = tests.filter(t => t.id !== test.id);
                                                setTests(updatedTests);
                                                localStorage.setItem('certification-tests', JSON.stringify(updatedTests));
                                              }}
                                            >
                                              <Trash2 className="w-4 h-4 mr-1" />
                                              Удалить
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                                              onClick={() => {
                                                const updatedTests = tests.map(t => 
                                                  t.id === test.id ? { ...t, archived: true } : t
                                                );
                                                setTests(updatedTests);
                                                localStorage.setItem('certification-tests', JSON.stringify(updatedTests));
                                              }}
                                            >
                                              <Archive className="w-4 h-4 mr-1" />
                                              Архивировать
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>

                          {/* Архивированные тесты */}
                          <TabsContent value="archived">
                            {tests.filter(t => t.archived).length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                <p>Нет архивированных тестов</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Наименование теста</TableHead>
                                    <TableHead>Срок назначения</TableHead>
                                    <TableHead>Количество вопросов</TableHead>
                                    <TableHead>Дата создания</TableHead>
                                    <TableHead>Действия</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tests.filter(t => t.archived).map((test) => {
                                    const getDeadlineLabel = (deadline: string) => {
                                      switch (deadline) {
                                        case '1-week': return '1 неделя';
                                        case '1-month': return '1 месяц';
                                        case '1-quarter': return '1 квартал';
                                        case '6-months': return '1 полугодие';
                                        case '1-year': return '1 год';
                                        case '2-years': return '2 года';
                                        case '3-years': return '3 года';
                                        case '4-years': return '4 года';
                                        case '5-years': return '5 лет';
                                        case '6-years': return '6 лет';
                                        case '7-years': return '7 лет';
                                        case '8-years': return '8 лет';
                                        case '9-years': return '9 лет';
                                        case '10-years': return '10 лет';
                                        default: return deadline;
                                      }
                                    };

                                    return (
                                      <TableRow key={test.id} className="bg-gray-50">
                                        <TableCell className="text-muted-foreground">{test.name}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{getDeadlineLabel(test.deadline)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge>{test.questions?.length || 0}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString('ru-RU') : '-'}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2 flex-wrap">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                                              onClick={() => {
                                                setSelectedTest(test);
                                                setShowTestViewDialog(true);
                                              }}
                                            >
                                              <Eye className="w-4 h-4 mr-1" />
                                              Просмотр
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                                              onClick={() => {
                                                const updatedTests = tests.map(t => 
                                                  t.id === test.id ? { ...t, archived: false } : t
                                                );
                                                setTests(updatedTests);
                                                localStorage.setItem('certification-tests', JSON.stringify(updatedTests));
                                              }}
                                            >
                                              <ArchiveRestore className="w-4 h-4 mr-1" />
                                              Восстановить
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                                              onClick={() => {
                                                const updatedTests = tests.filter(t => t.id !== test.id);
                                                setTests(updatedTests);
                                                localStorage.setItem('certification-tests', JSON.stringify(updatedTests));
                                              }}
                                            >
                                              <Trash2 className="w-4 h-4 mr-1" />
                                              Удалить
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}