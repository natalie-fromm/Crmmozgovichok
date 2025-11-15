import { useState, useEffect } from 'react';
import { Child, Specialist, ScheduleEntry, Notification, SpecialistSalary, MonthlyExpense, ExpenseSettings } from './types';
import { mockChildren, mockSpecialists, mockSchedule } from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SpecialistDashboard } from './components/SpecialistDashboard';
import { NotificationHistoryDemo } from './components/NotificationHistoryDemo';
import { PersonalNotificationDemo } from './components/PersonalNotificationDemo';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  // Демонстрация интерфейса "История оповещений"
  // Раскомментируйте строку ниже, чтобы увидеть демонстрацию
  // return <NotificationHistoryDemo />;
  
  // Демонстрация интерфейса "Персональная рассылка"
  // return <PersonalNotificationDemo />;

  const [currentUser, setCurrentUser] = useState<Specialist | null>(null);
  const [children, setChildren] = useLocalStorage<Child[]>('crm_children', mockChildren);
  const [schedule, setSchedule] = useLocalStorage<ScheduleEntry[]>('crm_schedule', mockSchedule);
  const [specialists, setSpecialists] = useLocalStorage<Specialist[]>('crm_specialists', mockSpecialists);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('crm_notifications', []);
  const [salaries, setSalaries] = useLocalStorage<SpecialistSalary[]>('crm_salaries', []);
  const [expenses, setExpenses] = useLocalStorage<MonthlyExpense[]>('crm_expenses', []);
  const [expenseSettings, setExpenseSettings] = useLocalStorage<ExpenseSettings>('crm_expense_settings', {
    taxRate: 0,
    acquiringRate: 0
  });

  // Защита от скриншотов и скачивания для специалистов
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return;

    // Блокировка контекстного меню (правая кнопка мыши)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Блокировка горячих клавиш
    const preventKeydown = (e: KeyboardEvent) => {
      // Ctrl+S, Ctrl+P (сохранение и печать)
      if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+S (сохранить как)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        return false;
      }
      // PrintScreen, F12 (инструменты разработчика)
      if (e.key === 'PrintScreen' || e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (инструменты разработчика)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Блокировка выделения текста
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Блокировка перетаскивания изображений
    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Добавляем обработчики
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeydown);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventDragStart);
    document.addEventListener('copy', preventSelection);

    // Убираем обработчики при размонтировании
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeydown);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventDragStart);
      document.removeEventListener('copy', preventSelection);
    };
  }, [currentUser]);

  // Генерация уведомлений о расписании
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowSchedule = schedule.filter(
      entry => entry.specialistId === currentUser.id && entry.date === tomorrowStr
    );

    if (tomorrowSchedule.length > 0) {
      const existingNotif = notifications.find(
        n => n.specialistId === currentUser.id && n.message.includes(tomorrowStr)
      );

      if (!existingNotif) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          specialistId: currentUser.id,
          title: 'Расписание на завтра',
          message: `У вас запланировано ${tomorrowSchedule.length} занятий на ${tomorrow.toLocaleDateString('ru-RU')}`,
          type: 'schedule',
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications([...notifications, newNotification]);
      }
    }
  }, [currentUser, schedule]);

  const handleLogin = (specialist: Specialist) => {
    setCurrentUser(specialist);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateChild = (updatedChild: Child) => {
    setChildren(children.map(child =>
      child.id === updatedChild.id ? updatedChild : child
    ));
  };

  const handleAddChild = (newChild: Child) => {
    setChildren([...children, newChild]);
  };

  const handleUpdateSchedule = (updatedSchedule: ScheduleEntry[]) => {
    setSchedule(updatedSchedule);
  };

  const handleUpdateSpecialists = (updatedSpecialists: Specialist[]) => {
    setSpecialists(updatedSpecialists);
  };

  const userNotifications = currentUser
    ? notifications.filter(n => n.specialistId === currentUser.id)
    : [];

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      setNotifications(notifications.map(n =>
        n.specialistId === currentUser.id ? { ...n, read: true } : n
      ));
    }
  };

  if (!currentUser) {
    return <LoginPage specialists={specialists} onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        children={children}
        schedule={schedule}
        specialists={specialists}
        salaries={salaries}
        expenses={expenses}
        expenseSettings={expenseSettings}
        onUpdateChild={handleUpdateChild}
        onUpdateSchedule={handleUpdateSchedule}
        onUpdateSpecialists={handleUpdateSpecialists}
        onUpdateSalaries={setSalaries}
        onUpdateExpenses={setExpenses}
        onUpdateExpenseSettings={setExpenseSettings}
        onLogout={handleLogout}
        onAddChild={handleAddChild}
      />
    );
  }

  return (
    <SpecialistDashboard
      specialist={currentUser}
      children={children}
      schedule={schedule}
      onUpdateChild={handleUpdateChild}
      onLogout={handleLogout}
      notifications={userNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}