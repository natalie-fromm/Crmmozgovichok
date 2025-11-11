import jsPDF from 'jspdf';
import { Child, ChildStatistics } from '../types';

// Функция для добавления текста с поддержкой кириллицы
const addText = (pdf: jsPDF, text: string, x: number, y: number, maxWidth?: number) => {
  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 7);
  } else {
    pdf.text(text, x, y);
    return y + 7;
  }
};

export const exportChildCardToPDF = (child: Child, statistics: ChildStatistics) => {
  const pdf = new jsPDF();
  let yPos = 20;

  // Заголовок
  pdf.setFontSize(18);
  yPos = addText(pdf, `Kартоčка rebёнka: ${child.name}`, 20, yPos);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, `Šифр: ${child.code}`, 20, yPos + 5);
  
  // Основная информация
  pdf.setFontSize(14);
  yPos = addText(pdf, 'Osnovnye dannye:', 20, yPos + 10);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, `Vozrast: ${child.age} let`, 20, yPos + 5);
  yPos = addText(pdf, `Imя mamy: ${child.motherName}`, 20, yPos);
  yPos = addText(pdf, `Imя papy: ${child.fatherName}`, 20, yPos);
  yPos = addText(pdf, `Data pervogo obraščenija: ${new Date(child.firstVisitDate).toLocaleDateString('ru-RU')}`, 20, yPos);
  
  // Жалобы
  pdf.setFontSize(14);
  yPos = addText(pdf, 'Pervičnye žaloby:', 20, yPos + 10);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, child.primaryComplaints, 20, yPos + 5, 170);
  
  if (child.additionalComplaints.length > 0) {
    pdf.setFontSize(14);
    yPos = addText(pdf, 'Dopolnitelnye žaloby:', 20, yPos + 10);
    
    pdf.setFontSize(10);
    child.additionalComplaints.forEach(complaint => {
      yPos = addText(pdf, `- ${complaint}`, 25, yPos + 5, 165);
    });
  }
  
  // Статистика
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }
  
  pdf.setFontSize(14);
  yPos = addText(pdf, 'Statistika:', 20, yPos + 10);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, `Vsego zanătij: ${statistics.totalSessions}`, 20, yPos + 5);
  yPos = addText(pdf, `Zanătij v etom mesjace: ${statistics.sessionsThisMonth}`, 20, yPos);
  yPos = addText(pdf, `Propuskov: ${statistics.totalAbsences}`, 20, yPos);
  yPos = addText(pdf, `Posesčaemost': ${statistics.attendanceRate.toFixed(1)}%`, 20, yPos);
  yPos = addText(pdf, `Oplata za vse vremja: ${statistics.totalPayments} rub`, 20, yPos);
  
  // Занятия
  if (child.sessions.length > 0) {
    if (yPos > 230) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFontSize(14);
    yPos = addText(pdf, 'Istorija zanătij:', 20, yPos + 10);
    
    pdf.setFontSize(9);
    child.sessions.slice(0, 5).forEach((session, idx) => {
      if (yPos > 260) {
        pdf.addPage();
        yPos = 20;
      }
      
      yPos = addText(pdf, `${idx + 1}. ${new Date(session.date).toLocaleDateString('ru-RU')} - ${session.specialistName}`, 20, yPos + 5);
      session.exercises.forEach(exercise => {
        yPos = addText(pdf, `   Zadanie: ${exercise.description}`, 25, yPos + 3, 160);
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      });
    });
  }
  
  // Ежемесячные отчеты
  if (child.monthlyReports.length > 0) {
    pdf.addPage();
    yPos = 20;
    
    pdf.setFontSize(14);
    yPos = addText(pdf, 'Ežemesjačnye otčёty:', 20, yPos);
    
    pdf.setFontSize(10);
    child.monthlyReports.forEach((report, idx) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      const monthDate = new Date(report.month + '-01');
      yPos = addText(pdf, `Otčёt za ${monthDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`, 20, yPos + 10);
      
      pdf.setFontSize(9);
      yPos = addText(pdf, 'Dostiženija:', 20, yPos + 5);
      yPos = addText(pdf, report.achievements, 25, yPos + 3, 165);
      
      yPos = addText(pdf, 'Celi na sledujuščij mesjac:', 20, yPos + 5);
      yPos = addText(pdf, report.nextMonthGoals, 25, yPos + 3, 165);
      
      pdf.setFontSize(10);
    });
  }
  
  pdf.save(`kарточка_${child.code}_${child.name}.pdf`);
};

export const exportStatisticsToPDF = (children: Child[], calculateStats: (id: string) => ChildStatistics) => {
  const pdf = new jsPDF();
  let yPos = 20;

  pdf.setFontSize(18);
  yPos = addText(pdf, 'Statistika po vsem detjam', 20, yPos);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, `Data: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos + 5);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalChildren = children.length;
  const totalSessionsThisMonth = children.reduce((sum, child) => {
    const stats = calculateStats(child.id);
    return sum + stats.sessionsThisMonth;
  }, 0);
  const totalRevenueThisMonth = children.reduce((sum, child) => {
    const stats = calculateStats(child.id);
    return sum + (stats.monthlyPayments[currentMonth] || 0);
  }, 0);
  
  pdf.setFontSize(14);
  yPos = addText(pdf, 'Obščaja statistika:', 20, yPos + 10);
  
  pdf.setFontSize(10);
  yPos = addText(pdf, `Vsego detej: ${totalChildren}`, 20, yPos + 5);
  yPos = addText(pdf, `Zanătij v tekušcem mesjace: ${totalSessionsThisMonth}`, 20, yPos);
  yPos = addText(pdf, `Dohod za mesjac: ${totalRevenueThisMonth.toLocaleString('ru-RU')} rub`, 20, yPos);
  
  pdf.setFontSize(14);
  yPos = addText(pdf, 'Po každomy rebenku:', 20, yPos + 15);
  
  pdf.setFontSize(9);
  children.forEach((child, idx) => {
    if (yPos > 260) {
      pdf.addPage();
      yPos = 20;
    }
    
    const stats = calculateStats(child.id);
    
    yPos = addText(pdf, `${idx + 1}. ${child.name} (${child.code})`, 20, yPos + 7);
    yPos = addText(pdf, `   Zanătij: ${stats.totalSessions} | Propuskov: ${stats.totalAbsences} | Posesčaemost': ${stats.attendanceRate.toFixed(1)}%`, 25, yPos + 3);
    yPos = addText(pdf, `   Oplata: ${stats.totalPayments.toLocaleString('ru-RU')} rub`, 25, yPos + 3);
  });
  
  pdf.save(`statistika_${new Date().toISOString().split('T')[0]}.pdf`);
};
