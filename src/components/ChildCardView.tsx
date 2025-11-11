import { useState } from "react";
import { Child, Exercise, Session, PhotoAttachment } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Plus, Calendar, User, Phone, FileText, ImagePlus, ArrowLeft, Save, Download, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PhotoUploader } from "./PhotoUploader";
import { exportChildCardToPDF } from "../utils/pdfExport";
import { ChildStatistics } from "../types";

interface ChildCardViewProps {
  child: Child;
  onBack: () => void;
  onUpdate: (child: Child) => void;
  canEdit: boolean;
  statistics?: ChildStatistics;
}

export function ChildCardView({ child, onBack, onUpdate, canEdit, statistics }: ChildCardViewProps) {
  const [editedChild, setEditedChild] = useState<Child>(child);
  
  // Разбиваем полное имя на фамилию, имя и отчество
  const nameParts = editedChild.name.split(' ');
  const [lastName, setLastName] = useState(nameParts[0] || '');
  const [firstName, setFirstName] = useState(nameParts[1] || '');
  const [middleName, setMiddleName] = useState(nameParts[2] || '');
  
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    specialistName: '',
    exercises: [] as Exercise[]
  });
  const [newExercise, setNewExercise] = useState({
    description: '',
    results: '',
    photos: [] as PhotoAttachment[]
  });
  const [newComplaint, setNewComplaint] = useState('');
  const [newMonthlyReport, setNewMonthlyReport] = useState({
    month: new Date().toISOString().slice(0, 7),
    achievements: '',
    nextMonthGoals: ''
  });
  const [isAddingSession, setIsAddingSession] = useState(false);

  const handleSave = () => {
    // Объединяем фамилию, имя и отчество в одно поле
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();
    onUpdate({...editedChild, name: fullName});
  };

  const handleExportPDF = () => {
    if (statistics) {
      exportChildCardToPDF(editedChild, statistics);
    }
  };

  const addComplaint = () => {
    if (newComplaint.trim()) {
      setEditedChild({
        ...editedChild,
        additionalComplaints: [...editedChild.additionalComplaints, newComplaint]
      });
      setNewComplaint('');
    }
  };

  const addExerciseToSession = () => {
    if (newExercise.description && newExercise.results) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        description: newExercise.description,
        results: newExercise.results,
        photos: newExercise.photos
      };
      setNewSession({
        ...newSession,
        exercises: [...newSession.exercises, exercise]
      });
      setNewExercise({ description: '', results: '', photos: [] });
    }
  };

  const addSession = () => {
    if (newSession.specialistName && newSession.exercises.length > 0) {
      const session: Session = {
        id: Date.now().toString(),
        childId: child.id,
        date: newSession.date,
        specialistId: 'current',
        specialistName: newSession.specialistName,
        exercises: newSession.exercises
      };
      setEditedChild({
        ...editedChild,
        sessions: [...editedChild.sessions, session]
      });
      setNewSession({
        date: new Date().toISOString().split('T')[0],
        specialistName: '',
        exercises: []
      });
      setIsAddingSession(false);
    }
  };

  const addMonthlyReport = () => {
    if (newMonthlyReport.achievements && newMonthlyReport.nextMonthGoals) {
      setEditedChild({
        ...editedChild,
        monthlyReports: [...editedChild.monthlyReports, { ...newMonthlyReport, id: Date.now().toString() }]
      });
      setNewMonthlyReport({
        month: new Date().toISOString().slice(0, 7),
        achievements: '',
        nextMonthGoals: ''
      });
    }
  };

  const updateExercisePhotos = (sessionId: string, exerciseId: string, photos: PhotoAttachment[]) => {
    setEditedChild({
      ...editedChild,
      sessions: editedChild.sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, photos } : ex
              )
            }
          : session
      )
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex gap-2">
            {statistics && (
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Экспорт в PDF
              </Button>
            )}
            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтверждение сохранения</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите сохранить изменения?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>НЕТ</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>ДА</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Основная информация</TabsTrigger>
            <TabsTrigger value="sessions">Занятия</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Карточка ребенка</CardTitle>
                    <CardDescription>Шифр: {editedChild.code}</CardDescription>
                  </div>
                  {editedChild.archived && (
                    <Badge variant="outline" className="bg-gray-100">
                      <Archive className="w-3 h-3 mr-1" />
                      Заархивировано
                    </Badge>
                  )}
                  {!canEdit && !editedChild.archived && (
                    <Badge variant="outline" className="bg-amber-100">
                      Только для чтения
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Фамилия</Label>
                    <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!canEdit}
                      placeholder="Фамилия"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!canEdit}
                      placeholder="Имя"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Отчество</Label>
                    <Input 
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      disabled={!canEdit}
                      placeholder="Отчество"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Возраст</Label>
                    <Input 
                      type="number"
                      value={editedChild.age}
                      onChange={(e) => setEditedChild({...editedChild, age: parseInt(e.target.value)})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата рождения</Label>
                    <Input 
                      type="date"
                      value={editedChild.birthDate}
                      onChange={(e) => setEditedChild({...editedChild, birthDate: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата первого обращения</Label>
                    <Input 
                      type="date"
                      value={editedChild.firstVisitDate}
                      onChange={(e) => setEditedChild({...editedChild, firstVisitDate: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Имя мамы</Label>
                    <Input 
                      value={editedChild.motherName}
                      onChange={(e) => setEditedChild({...editedChild, motherName: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Имя папы</Label>
                    <Input 
                      value={editedChild.fatherName}
                      onChange={(e) => setEditedChild({...editedChild, fatherName: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Первичные жалобы</Label>
                  <Textarea 
                    value={editedChild.primaryComplaints}
                    onChange={(e) => setEditedChild({...editedChild, primaryComplaints: e.target.value})}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Дополнительные жалобы</Label>
                  <div className="space-y-2">
                    {editedChild.additionalComplaints.map((complaint, index) => (
                      <div key={index} className="p-3 bg-amber-50 rounded-md border border-amber-200">
                        {complaint}
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="Добавить новую жалобу"
                        value={newComplaint}
                        onChange={(e) => setNewComplaint(e.target.value)}
                      />
                      <Button onClick={addComplaint} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Значимое из диагностики</Label>
                  <Textarea 
                    value={editedChild.diagnosticInfo || ''}
                    onChange={(e) => setEditedChild({...editedChild, diagnosticInfo: e.target.value})}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Значимая информация из диагностики..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Посещение иных занятий</Label>
                  <Textarea 
                    value={editedChild.otherActivities || ''}
                    onChange={(e) => setEditedChild({...editedChild, otherActivities: e.target.value})}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Другие занятия, которые посещает ребенок..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Интересы ребенка</Label>
                  <Textarea 
                    value={editedChild.interests || ''}
                    onChange={(e) => setEditedChild({...editedChild, interests: e.target.value})}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Интересы и увлечения ребенка..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="space-y-4">
              {canEdit && (
                <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить занятие
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Новое занятие</DialogTitle>
                      <DialogDescription>Добавьте информацию о проведенном занятии</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Дата занятия</Label>
                          <Input 
                            type="date"
                            value={newSession.date}
                            onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Специалист</Label>
                          <Input 
                            value={newSession.specialistName}
                            onChange={(e) => setNewSession({...newSession, specialistName: e.target.value})}
                            placeholder="ФИО специалиста"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="mb-2 block">Задания</Label>
                        {newSession.exercises.map((exercise, index) => (
                          <div key={index} className="mb-3 p-3 bg-green-50 rounded-md border border-green-200">
                            <p className="text-sm mb-1"><strong>Задание:</strong> {exercise.description}</p>
                            <p className="text-sm"><strong>Результаты:</strong> {exercise.results}</p>
                          </div>
                        ))}
                        
                        <Card className="mt-3">
                          <CardHeader>
                            <CardTitle className="text-sm">Добавить задание</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <Label>Описание задания</Label>
                              <Textarea 
                                value={newExercise.description}
                                onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                                placeholder="Например: Упражнение на концентрацию внимания"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Результаты выполнения</Label>
                              <Textarea 
                                value={newExercise.results}
                                onChange={(e) => setNewExercise({...newExercise, results: e.target.value})}
                                placeholder="Описание результатов работы ребенка"
                                rows={3}
                              />
                            </div>
                            <PhotoUploader
                              photos={newExercise.photos}
                              onPhotosChange={(photos) => setNewExercise({...newExercise, photos})}
                            />
                            <Button onClick={addExerciseToSession} size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              Добавить задание
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <Button onClick={addSession} className="w-full">
                        Сохранить занятие
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {editedChild.sessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Занятий пока нет
                  </CardContent>
                </Card>
              ) : (
                editedChild.sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.date).toLocaleDateString('ru-RU')}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3" />
                            {session.specialistName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {session.exercises.map((exercise) => (
                        <div key={exercise.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="mb-2">
                            <Badge variant="outline" className="mb-2">Задание</Badge>
                            <p className="text-sm">{exercise.description}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">Результаты</Badge>
                            <p className="text-sm">{exercise.results}</p>
                          </div>
                          {exercise.photos.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">Фотографии:</p>
                              <div className="grid grid-cols-4 gap-2">
                                {exercise.photos.map((photo) => (
                                  <div key={photo.id} className="aspect-square bg-gray-200 rounded overflow-hidden">
                                    <img
                                      src={photo.url}
                                      alt={photo.fileName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              {canEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Добавить ежемесячный отчет</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Месяц</Label>
                      <Input 
                        type="month"
                        value={newMonthlyReport.month}
                        onChange={(e) => setNewMonthlyReport({...newMonthlyReport, month: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Достижения за месяц</Label>
                      <Textarea 
                        value={newMonthlyReport.achievements}
                        onChange={(e) => setNewMonthlyReport({...newMonthlyReport, achievements: e.target.value})}
                        placeholder="Чего достигли за месяц"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Цели на следующий месяц</Label>
                      <Textarea 
                        value={newMonthlyReport.nextMonthGoals}
                        onChange={(e) => setNewMonthlyReport({...newMonthlyReport, nextMonthGoals: e.target.value})}
                        placeholder="Планы работы на следующий месяц"
                        rows={3}
                      />
                    </div>
                    <Button onClick={addMonthlyReport}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить отчет
                    </Button>
                  </CardContent>
                </Card>
              )}

              {editedChild.monthlyReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Отчетов пока нет
                  </CardContent>
                </Card>
              ) : (
                editedChild.monthlyReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <CardTitle>
                        Отчет за {new Date(report.month + '-01').toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-green-700">Достижения</Label>
                        <p className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                          {report.achievements}
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Цели на следующий месяц</Label>
                        <p className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                          {report.nextMonthGoals}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}