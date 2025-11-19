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
    category: 'neuropsychologist',
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
    category: 'psychologist',
    createdAt: '2024-03-10T10:00:00.000Z'
  },
  { 
    id: '4', 
    firstName: 'Ольга', 
    lastName: 'Смирнова', 
    role: 'specialist',
    email: 'olga@mozgovichok.ru',
    password: 'olga123',
    active: true,
    category: 'speech_therapist',
    createdAt: '2024-04-01T10:00:00.000Z'
  },
  { 
    id: '5', 
    firstName: 'Ольга', 
    lastName: 'Козлова', 
    role: 'client',
    email: 'client@mozgovichok.ru',
    password: 'client123',
    active: true,
    childId: '1', // связь с карточкой Козлов Александр Дмитриевич
    createdAt: '2024-09-01T10:00:00.000Z'
  },
];

export const mockChildren: Child[] = [
  {
    id: '1',
    code: 'NP-2024-001',
    name: 'Козлов Александр Дмитриевич',
    age: 7,
    birthDate: '2017-11-15',
    motherName: 'Ольга',
    fatherName: 'Дмитрий',
    firstVisitDate: '2024-01-15',
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
    firstVisitDate: '2024-02-10',
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
    firstVisitDate: '2024-03-05',
    primaryComplaints: 'Дислексия, трудности с обучением чтению',
    additionalComplaints: [
      'Низкая самооценка'
    ],
    sessions: [],
    monthlyReports: []
  },
  {
    id: '4',
    code: 'PS-2024-004',
    name: 'Васильева Анна Сергеевна',
    age: 9,
    birthDate: '2015-08-20',
    motherName: 'Ирина',
    fatherName: 'Сергей',
    firstVisitDate: '2024-05-12',
    primaryComplaints: 'Тревожность, проблемы со сном',
    additionalComplaints: [],
    sessions: [],
    monthlyReports: []
  },
  {
    id: '5',
    code: 'NP-2024-005',
    name: 'Петров Даниил Андреевич',
    age: 5,
    birthDate: '2019-02-14',
    motherName: 'Наталья',
    fatherName: 'Андрей',
    firstVisitDate: '2024-09-20',
    primaryComplaints: 'СДВГ, импульсивность',
    additionalComplaints: [],
    sessions: [],
    monthlyReports: []
  },
  {
    id: '6',
    code: 'LG-2024-006',
    name: 'Смирнов Егор Владимирович',
    age: 6,
    birthDate: '2018-11-05',
    motherName: 'Марина',
    fatherName: 'Владимир',
    firstVisitDate: '2024-10-01',
    primaryComplaints: 'Нарушение звукопроизношения',
    additionalComplaints: [],
    sessions: [],
    monthlyReports: []
  },
  {
    id: '7',
    code: 'PS-2024-007',
    name: 'Николаева Виктория Олеговна',
    age: 10,
    birthDate: '2014-04-15',
    motherName: 'Елена',
    fatherName: 'Олег',
    firstVisitDate: '2024-11-01',
    primaryComplaints: 'Школьная дезадаптация',
    additionalComplaints: [],
    sessions: [],
    monthlyReports: []
  }
];

export const mockSchedule: ScheduleEntry[] = [
  // === ЗАВЕРШЕННЫЕ ЗАНЯТИЯ 2024 ДЛЯ СТАТИСТИКИ ===
  
  // Январь 2024 - Нейро-диагностика
  {
    id: 'completed1',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-01-15',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 3500,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-diagnosis'
  },
  {
    id: 'completed2',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-01-20',
    time: '11:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed3',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-01-25',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // Февраль 2024
  {
    id: 'completed4',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-02-10',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 3000,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-diagnosis'
  },
  {
    id: 'completed5',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-02-15',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed6',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-02-20',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 4,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // Март 2024
  {
    id: 'completed7',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-03-05',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 3200,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-diagnosis'
  },
  {
    id: 'completed8',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-03-12',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },
  {
    id: 'completed9',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-03-18',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 5,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed10',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-03-22',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // Апрель 2024
  {
    id: 'completed11',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-04-05',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },
  {
    id: 'completed12',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-04-10',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 6,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed13',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-04-15',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 4,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // Май 2024
  {
    id: 'completed14',
    childId: '4',
    childName: 'Васильева Анна Сергеевна',
    date: '2024-05-12',
    time: '15:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 3200,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-diagnosis'
  },
  {
    id: 'completed15',
    childId: '4',
    childName: 'Васильева Анна Сергеевна',
    date: '2024-05-20',
    time: '15:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },
  {
    id: 'completed16',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-05-25',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 4,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },

  // Июнь 2024
  {
    id: 'completed17',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-06-05',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 7,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed18',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-06-10',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 5,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed19',
    childId: '4',
    childName: 'Васильева Анна Сергеевна',
    date: '2024-06-15',
    time: '15:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },

  // Июль 2024
  {
    id: 'completed20',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-07-08',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 8,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed21',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-07-12',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 5,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },

  // Август 2024
  {
    id: 'completed22',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-08-05',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 6,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed23',
    childId: '4',
    childName: 'Васильева Анна Сергеевна',
    date: '2024-08-10',
    time: '15:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 4,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },

  // Сентябрь 2024
  {
    id: 'completed24',
    childId: '5',
    childName: 'Петров Даниил Андреевич',
    date: '2024-09-20',
    time: '12:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 3500,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-diagnosis'
  },
  {
    id: 'completed25',
    childId: '3',
    childName: 'Тимофеев Михаил Игоревич',
    date: '2024-09-25',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2400,
    sessionsCompleted: 6,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-session'
  },

  // Октябрь 2024
  {
    id: 'completed26',
    childId: '6',
    childName: 'Смирнов Егор Владимирович',
    date: '2024-10-01',
    time: '13:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 3000,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-diagnosis'
  },
  {
    id: 'completed27',
    childId: '5',
    childName: 'Петров Даниил Андреевич',
    date: '2024-10-05',
    time: '12:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed28',
    childId: '2',
    childName: 'Морозова София Алексеевна',
    date: '2024-10-10',
    time: '14:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 7,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // Ноябрь 2024
  {
    id: 'completed29',
    childId: '7',
    childName: 'Николаева Виктория Олеговна',
    date: '2024-11-01',
    time: '16:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 3200,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'psycho-diagnosis'
  },
  {
    id: 'completed30',
    childId: '5',
    childName: 'Петров Даниил Андреевич',
    date: '2024-11-05',
    time: '12:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },
  {
    id: 'completed31',
    childId: '6',
    childName: 'Смирнов Егор Владимирович',
    date: '2024-11-08',
    time: '13:00',
    specialistId: '4',
    specialistName: 'Ольга Смирнова',
    paymentAmount: 2200,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'completed',
    serviceType: 'neuro-session'
  },

  // === ЗАПЛАНИРОВАННЫЕ ЗАНЯТИЯ ===
  
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
    serviceType: 'neuro-session'
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
    serviceType: 'psycho-session'
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
    serviceType: 'psycho-session'
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
    serviceType: 'neuro-session'
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
    serviceType: 'neuro-session'
  },
  
  // Будущие занятия для демонстрации клиенту
  {
    id: 'sch6',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-11-20',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 1,
    totalSessions: 8,
    status: 'scheduled',
    serviceType: 'neuro-session'
  },
  {
    id: 'sch7',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-11-25',
    time: '10:00',
    specialistId: '2',
    specialistName: 'Мария Петрова',
    paymentAmount: 2500,
    sessionsCompleted: 2,
    totalSessions: 8,
    status: 'scheduled',
    serviceType: 'neuro-session'
  },
  {
    id: 'sch8',
    childId: '1',
    childName: 'Козлов Александр Дмитриевич',
    date: '2024-12-02',
    time: '11:00',
    specialistId: '3',
    specialistName: 'Елена Сидорова',
    paymentAmount: 2500,
    sessionsCompleted: 3,
    totalSessions: 8,
    status: 'scheduled',
    serviceType: 'psycho-session'
  },
];