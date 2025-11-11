import { useState, useEffect } from 'react';
import { Child, Specialist, ScheduleEntry, Notification } from './types';
import { mockChildren, mockSpecialists, mockSchedule } from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SpecialistDashboard } from './components/SpecialistDashboard';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Specialist | null>(null);
  const [children, setChildren] = useLocalStorage<Child[]>('crm_children', mockChildren);
  const [schedule, setSchedule] = useLocalStorage<ScheduleEntry[]>('crm_schedule', mockSchedule);
  const [specialists, setSpecialists] = useLocalStorage<Specialist[]>('crm_specialists', mockSpecialists);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('crm_notifications', []);

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
        onUpdateChild={handleUpdateChild}
        onUpdateSchedule={handleUpdateSchedule}
        onUpdateSpecialists={handleUpdateSpecialists}
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