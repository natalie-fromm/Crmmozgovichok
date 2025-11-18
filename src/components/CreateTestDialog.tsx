import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { Badge } from "./ui/badge";

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer?: string;
}

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (test: any) => void;
  existingTest?: any; // Для режима редактирования
}

export function CreateTestDialog({ open, onOpenChange, onSave, existingTest }: CreateTestDialogProps) {
  const [testName, setTestName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [purpose, setPurpose] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Загружаем данные теста при открытии в режиме редактирования
  useEffect(() => {
    if (open && existingTest) {
      setTestName(existingTest.name || "");
      setDeadline(existingTest.deadline || "");
      setPurpose(existingTest.purpose || "");
      setQuestions(existingTest.questions || []);
    } else if (open && !existingTest) {
      // Сброс формы для нового теста
      setTestName("");
      setDeadline("");
      setPurpose("");
      setQuestions([]);
    }
  }, [open, existingTest]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: 'text',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          type: 'multiple-choice' as const,
          options: [...(q.options || []), ""]
        };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        return {
          ...q,
          options: newOptions,
          type: newOptions.length > 0 ? 'multiple-choice' as const : 'text' as const
        };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (questionId: string, optionIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddTextField = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          type: 'text' as const,
          options: []
        };
      }
      return q;
    }));
  };

  const handleSave = () => {
    const test = {
      id: existingTest ? existingTest.id : Date.now().toString(),
      name: testName,
      deadline,
      purpose,
      questions,
      createdAt: existingTest ? existingTest.createdAt : new Date().toISOString(),
    };
    console.log('Сохранение теста:', test);
    onSave(test);
    // Сброс формы
    setTestName("");
    setDeadline("");
    setPurpose("");
    setQuestions([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTestName("");
    setDeadline("");
    setPurpose("");
    setQuestions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // При закрытии диалога сбрасываем форму
        setTestName("");
        setDeadline("");
        setPurpose("");
        setQuestions([]);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingTest ? 'Редактировать тест' : 'Создать тест'}</DialogTitle>
          <DialogDescription>
            Заполните информацию о тесте и добавьте вопросы
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Наименование теста */}
          <div className="space-y-2">
            <Label htmlFor="test-name">Наименование теста</Label>
            <Input
              id="test-name"
              placeholder="Введите название теста"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Срок назначения теста */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Срок назначения теста</Label>
            <Select value={deadline} onValueChange={setDeadline}>
              <SelectTrigger id="deadline" className="w-full">
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-week">1 неделя</SelectItem>
                <SelectItem value="1-month">1 месяц</SelectItem>
                <SelectItem value="1-quarter">1 квартал</SelectItem>
                <SelectItem value="6-months">1 полугодие</SelectItem>
                <SelectItem value="1-year">1 год</SelectItem>
                <SelectItem value="2-years">2 года</SelectItem>
                <SelectItem value="3-years">3 года</SelectItem>
                <SelectItem value="4-years">4 года</SelectItem>
                <SelectItem value="5-years">5 лет</SelectItem>
                <SelectItem value="6-years">6 лет</SelectItem>
                <SelectItem value="7-years">7 лет</SelectItem>
                <SelectItem value="8-years">8 лет</SelectItem>
                <SelectItem value="9-years">9 лет</SelectItem>
                <SelectItem value="10-years">10 лет</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Цель назначения теста */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Цель назначения теста</Label>
            <Textarea
              id="purpose"
              placeholder="Опишите цель назначения теста"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Проверка знаний */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base">Проверка знаний</h3>
              <Button
                type="button"
                size="sm"
                onClick={handleAddQuestion}
                style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить вопрос
              </Button>
            </div>

            {/* Список вопросов */}
            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base flex items-center flex-wrap gap-2">
                        <span>Вопрос {questionIndex + 1}</span>
                        {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                          <Badge variant="outline" className="text-xs">Варианты ответов</Badge>
                        )}
                        {question.type === 'text' && (
                          <Badge variant="outline" className="text-xs">Текстовый ответ</Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Текст вопроса */}
                    <div className="space-y-2">
                      <Label htmlFor={`question-text-${question.id}`}>Текст вопроса</Label>
                      <Textarea
                        id={`question-text-${question.id}`}
                        placeholder="Введите текст вопроса"
                        value={question.text}
                        onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                        rows={2}
                      />
                    </div>

                    {/* Кнопки для добавления типов ответов */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(question.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить вариант ответа
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTextField(question.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить поле для текстового ответа
                      </Button>
                    </div>

                    {/* Варианты ответов */}
                    {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                      <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                        <Label className="text-sm text-muted-foreground">Варианты ответов:</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {optionIndex + 1}
                            </Badge>
                            <Input
                              placeholder={`Вариант ответа ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => handleOptionTextChange(question.id, optionIndex, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOption(question.id, optionIndex)}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Поле для текстового ответа */}
                    {question.type === 'text' && (!question.options || question.options.length === 0) && (
                      <div className="space-y-2 pl-4 border-l-2 border-green-200">
                        <Label className="text-sm text-muted-foreground">
                          Специалист будет вводить текстовый ответ
                        </Label>
                        <Textarea
                          placeholder="Здесь будет поле для ввода ответа специалистом"
                          disabled
                          rows={2}
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Нажмите "Добавить вопрос" для создания первого вопроса</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!testName || !deadline || !purpose || questions.length === 0}
            style={{ backgroundColor: '#53b4e9', color: 'white', borderColor: '#53b4e9' }}
          >
            Сохранить тест
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}