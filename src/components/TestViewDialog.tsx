import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer?: string;
}

interface Test {
  id: string;
  name: string;
  deadline: string;
  purpose: string;
  questions: Question[];
  createdAt: string;
}

interface TestViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
}

export function TestViewDialog({ open, onOpenChange, test }: TestViewDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!test) return null;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  // Обработка множественного выбора (checkbox)
  const handleMultipleChoiceToggle = (questionId: string, option: string) => {
    const currentAnswers = answers[questionId];
    let newAnswers: string[];

    if (Array.isArray(currentAnswers)) {
      // Если опция уже выбрана - убираем её
      if (currentAnswers.includes(option)) {
        newAnswers = currentAnswers.filter(a => a !== option);
      } else {
        // Иначе добавляем
        newAnswers = [...currentAnswers, option];
      }
    } else {
      // Первый выбор
      newAnswers = [option];
    }

    setAnswers({
      ...answers,
      [questionId]: newAnswers
    });
  };

  const handleSave = () => {
    console.log('Сохранение ответов на тест:', {
      testId: test.id,
      testName: test.name,
      answers,
      completedAt: new Date().toISOString()
    });
    
    // Здесь можно сохранить ответы в localStorage
    const testResults = {
      testId: test.id,
      testName: test.name,
      answers,
      completedAt: new Date().toISOString()
    };
    
    // Получаем существующие результаты или создаем новый массив
    const existingResults = JSON.parse(localStorage.getItem('test-results') || '[]');
    existingResults.push(testResults);
    localStorage.setItem('test-results', JSON.stringify(existingResults));
    
    // Сброс ответов и закрытие
    setAnswers({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    onOpenChange(false);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (test.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const getDeadlineLabel = (deadline: string) => {
    const labels: Record<string, string> = {
      '1-week': '1 неделя',
      '1-month': '1 месяц',
      '1-quarter': '1 квартал',
      '6-months': '1 полугодие',
      '1-year': '1 год',
      '2-years': '2 года',
      '3-years': '3 года',
      '4-years': '4 года',
      '5-years': '5 лет',
      '6-years': '6 лет',
      '7-years': '7 лет',
      '8-years': '8 лет',
      '9-years': '9 лет',
      '10-years': '10 лет',
    };
    return labels[deadline] || deadline;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setAnswers({});
        setCurrentQuestionIndex(0);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test.name}</DialogTitle>
          <DialogDescription>
            <div className="space-y-1 mt-2">
              <div className="flex gap-2 flex-wrap items-center">
                <Badge variant="outline">Срок: {getDeadlineLabel(test.deadline)}</Badge>
                <Badge variant="outline">Вопросов: {test.questions?.length || 0}</Badge>
                <Badge variant="outline" style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}>
                  Заполнено: {Object.keys(answers).length} / {test.questions?.length || 0}
                </Badge>
              </div>
              <p className="text-sm mt-2">{test.purpose}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {test.questions && test.questions.length > 0 ? (
            <>
              {/* Индикатор текущего вопроса */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Вопрос {currentQuestionIndex + 1} из {test.questions.length}
                </Badge>
              </div>

              {/* Текущий вопрос */}
              {(() => {
                const question = test.questions[currentQuestionIndex];
                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge>{currentQuestionIndex + 1}</Badge>
                        <span>{question.text}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Множественный выбор */}
                      {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground mb-3">Можно выбрать несколько вариантов</p>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <Checkbox 
                                checked={Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(option)}
                                onCheckedChange={() => handleMultipleChoiceToggle(question.id, option)}
                                id={`${question.id}-option-${optionIndex}`}
                              />
                              <Label 
                                htmlFor={`${question.id}-option-${optionIndex}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Текстовый ответ */}
                      {question.type === 'text' && (
                        <div className="space-y-2">
                          <Label htmlFor={`answer-${question.id}`}>Ваш ответ:</Label>
                          <Textarea
                            id={`answer-${question.id}`}
                            placeholder="Введите ваш ответ..."
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Кнопки навигации */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Предыдущий
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === test.questions.length - 1}
                  className="flex items-center gap-2"
                >
                  Следующий
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>В этом тесте нет вопросов</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
            disabled={test.questions && test.questions.length > 0 && Object.keys(answers).length === 0}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}