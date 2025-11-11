import { Child, Specialist, ScheduleEntry } from '../types';

export const mockSpecialists: Specialist[] = [
  { 
    id: '1', 
    firstName: 'Анна', 
    lastName: 'Иванова', 
    role: 'admin',
    email: 'admin@mozgovichok.ru',
    password: 'admin123',
    active: true,
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  { 
    id: '2', 
    firstName: 'Мария', 
    lastName: 'Петрова', 
    role: 'specialist',
    email: 'maria@mozgovichok.ru',
    password: 'maria123',
    active: true,
    createdAt: '2024-02-20T10:00:00.000Z'
  },
  { 
    id: '3', 
    firstName: 'Елена', 
    lastName: 'Сидорова', 
    role: 'specialist',
    email: 'elena@mozgovichok.ru',
    password: 'elena123',
    active: true,
    createdAt: '2024-03-10T10:00:00.000Z'
  },
];

export const mockChildren: Child[] = [
  {
    id: '1',
    code: 'NP-2024-001',
    name: 'Козлов Александр Дмитриевич',
    age: 7,
    birthDate: '2017-11-15', // День рождения через 4 дня от 11.11.2024
    motherName: 'Ольга',
    fatherName: 'Дмитрий',
    firstVisitDate: '2024-09-15',
    primaryComplaints: 'Трудности с концентрацией внимания, гиперактивность',
    additionalComplaints: [
      'Сложности с выполнением письменных заданий',
      'Быстрая утомляемость при чтении'
    ],
    sessions: [
      {
        id: 's1',
        childId: '1',
        date: '2024-09-20',
        specialistId: '2',
        specialistName: 'Мария Петрова',
        exercises: [
          {
            id: 'e1',
            description: 'Упражнение на концентрацию внимания "Найди отличия"',
            results: 'Ребенок справился с заданием за 5 минут, нашел 7 из 10 отличий. Отвлекался 3 раза.',
            photos: []
          },
          {
            id: 'e2',
            description: 'Графомоторное упражнение - обводка по контуру',
            results: 'Линии неровные, выходят за контур. Нажим слабый.',
            photos: []
          }
        ]
      }
    ],
    monthlyReports: [
      {
        id: 'mr1',
        month: '2024-09',
        achievements: 'Увеличено время концентрации внимания с 5 до 12 минут. Улучшилась координация движений.',
        nextMonthGoals: 'Продолжить работу над произвольным вниманием. Начать упражнения на развитие памяти.'
      }
    ]
  },
  {
    id: '2',
    code: 'NP-2024-002',
    name: 'Морозова София Алексеевна',
    age: 6,
    birthDate: '2018-03-22',
    motherName: 'Екатерина',
    fatherName: 'Алексей',
    firstVisitDate: '2024-10-01',
    primaryComplaints: 'Задержка речевого развития, сложности с социализацией',
    additionalComplaints: [],
    sessions: [],
    monthlyReports: []
  },
  {
    id: '3',
    code: 'NP-2024-003',
    name: 'Тимофеев Михаил Игоревич',
    age: 8,
    birthDate: '2016-06-10',
    motherName: 'Светлана',
    fatherName: 'Игорь',
    firstVisitDate: '2024-08-10',
    primaryComplaints: 'Дислексия, трудности с обучением чтению',
    additionalComplaints: [
      'Низкая самооценка'
    ],
    sessions: [],
    monthlyReports: []
  }
];

export const mockSchedule: ScheduleEntry[] = [
  // Понедельник 11.11.2024
  {
    id: 'sch1',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-11-11',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 5,
    totalSessions: 8,
    status: 'scheduled',
  },
  {
    id: 'sch2',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-11-11',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2500,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'scheduled',
  },
  // Вторник 12.11.2024
  {
    id: 'sch3',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-11-12',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 7,
    totalSessions: 8,
    status: 'scheduled',
  },
  {
    id: 'sch4',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-11-12',
    time: '14:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2500,
    sessionsCompleted: 6,
    totalSessions: 8,
    status: 'scheduled',
  },
  // Среда 13.11.2024
  {
    id: 'sch5',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-11-13',
    time: '11:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'scheduled',
  },
];