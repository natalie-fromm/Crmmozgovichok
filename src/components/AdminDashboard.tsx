import { useState } from "react";
import { Child, ScheduleEntry, ChildStatistics, Specialist } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChildCardView } from "./ChildCardView";
import { ScheduleView } from "./ScheduleView";
import { NewChildForm } from "./NewChildForm";
import { SpecialistsManagement } from "./SpecialistsManagement";
import { Users, Calendar, BarChart3, LogOut, Search, TrendingUp, DollarSign, Download, Plus, Archive, ArchiveRestore, UserCog } from "lucide-react";
import { exportStatisticsToPDF } from "../utils/pdfExport";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";

interface AdminDashboardProps {
  children: Child[];
  schedule: ScheduleEntry[];
  specialists: Specialist[];
  onUpdateChild: (child: Child) => void;
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
  onUpdateSpecialists: (specialists: Specialist[]) => void;
  onLogout: () => void;
  onAddChild?: (child: Child) => void;
}

export function AdminDashboard({ children, schedule, specialists, onUpdateChild, onUpdateSchedule, onUpdateSpecialists, onLogout, onAddChild }: AdminDashboardProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [viewArchived, setViewArchived] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

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
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="specialists" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Специалисты
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
                    <CardTitle className="text-sm">Всего детей</CardTitle>
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
                  <CardTitle>Подробная статистика по детям</CardTitle>
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
            </div>
          </TabsContent>

          <TabsContent value="specialists">
            <SpecialistsManagement
              specialists={specialists}
              onUpdateSpecialists={onUpdateSpecialists}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}