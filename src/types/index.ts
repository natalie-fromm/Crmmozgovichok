export interface Child {
  id: string;
  code: string; // шифр
  name: string; // Фамилия Имя Отчество (для администратора показывается полностью, для специалистов - сокращённо)
  age: number;
  birthDate: string; // дата рождения в формате YYYY-MM-DD
  motherName: string;
  motherPhone?: string; // телефон матери
  fatherName: string;
  fatherPhone?: string; // телефон отца
  firstVisitDate: string;
  primaryComplaints: string;
  additionalComplaints: string[];
  sessions: Session[];
  monthlyReports: MonthlyReport[];
  archived?: boolean; // флаг архивирования карточки
  diagnosticInfo?: string; // значимое из диагностики
  otherActivities?: string; // посещение иных занятий
  interests?: string; // интересы ребенка
  notificationHistory?: NotificationHistoryEntry[]; // история оповещений
}

export interface NotificationHistoryEntry {
  id: string;
  date: string; // дата отправки
  time: string; // время отправки
  messenger: 'whatsapp' | 'telegram' | 'vk'; // мессенджер
  recipientName: string; // имя получателя
  recipientPhone: string; // телефон получателя
  message: string; // текст сообщения
  sentBy: string; // кто отправил (auto или имя специалиста)
}

export interface Session {
  id: string;
  childId: string;
  date: string;
  specialistId: string;
  specialistName: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  description: string;
  results: string;
  photos: PhotoAttachment[];
}

export interface PhotoAttachment {
  id: string;
  url: string; // base64 data URL
  fileName: string;
  uploadedAt: string;
}

export interface MonthlyReport {
  id: string;
  month: string; // YYYY-MM
  achievements: string;
  nextMonthGoals: string;
}

export interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'specialist';
  category?: 'neuropsychologist' | 'psychologist' | 'speech_therapist' | 'special_educator'; // Категория специалиста
  email: string;
  password: string;
  active?: boolean; // флаг активности специалиста
  createdAt?: string; // дата создания аккаунта
  birthday?: string; // день рождения
  other?: string; // иное (дополнительная информация)
  deactivationDate?: string; // дата деактивации специалиста
}

export interface ScheduleEntry {
  id: string;
  childId: string;
  childName: string;
  date: string;
  time: string;
  specialistId: string;
  specialistName: string;
  serviceType?: 'neuro-diagnosis' | 'neuro-session' | 'psycho-diagnosis' | 'psycho-session'; // Тип услуги
  paymentAmount: number;
  paymentType?: 'single' | 'subscription'; // Разово или Абонемент
  paymentMethod?: 'cash' | 'card'; // Нал или Безнал
  sessionsCompleted: number; // пройдено занятий по абонементу
  totalSessions: number; // всего занятий в абонементе
  subscriptionCost?: number; // стоимость абонемента
  status: 'scheduled' | 'completed' | 'absent';
  absenceReason?: string;
  absenceCategory?: 'sick' | 'family' | 'other' | 'cancelled';
  note?: string; // примечание к занятию
  isPaid?: boolean; // оплачено ли занятие
  paidAmount?: number; // фактически внесенная сумма
  paidDate?: string; // дата оплаты
  // Напоминание об оплате (отдельно от факта проведения занятия)
  paymentDueThisDay?: boolean; // требуется внесение оплаты в этот день
  paymentDueType?: 'single' | 'subscription4' | 'subscription8' | 'subscription12'; // тип ожидаемой оплаты
  paymentDueAmount?: number; // сумма ожидаемой оплаты
  paymentTypeDetailed?: 'single' | 'subscription4' | 'subscription8' | 'subscription12'; // детальный тип оплаты
  paymentTotalAmount?: number; // общая сумма оплаты (для расчета стоимости занятия)
  // Предоплаченный абонемент
  prepaidSubscriptionType?: 4 | 8 | 12; // тип предоплаченного абонемента (количество занятий)
  prepaidSubscriptionActivated?: boolean; // флаг активации предоплаченного абонемента
}

export interface ChildStatistics {
  childId: string;
  totalSessions: number;
  totalAbsences: number;
  absencesByCategory: Record<string, number>;
  attendanceRate: number;
  monthlyPayments: Record<string, number>;
  totalPayments: number;
  sessionsThisMonth: number;
}

export interface Notification {
  id: string;
  specialistId: string;
  title: string;
  message: string;
  type: 'schedule' | 'reminder' | 'info';
  read: boolean;
  createdAt: string;
}

export interface SpecialistSalary {
  id: string;
  specialistId: string;
  specialistName: string;
  month: string; // YYYY-MM
  amount: number;
}

export interface MonthlyExpense {
  id: string;
  month: string; // YYYY-MM
  rent: number; // аренда
  materials: number; // материалы
  stationery: number; // канцелярия
  household: number; // хозяйственные
  accounting: number; // бухгалтерия
  security: number; // охрана
  advertising: number; // реклама
}

export interface ExpenseSettings {
  taxRate: number; // процент налога
  acquiringRate: number; // процент комиссии за эквайринг
}