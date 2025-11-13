import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Moon, 
  Sun, 
  Type,
  X,
  BookOpen
} from "lucide-react";
import { Slider } from "./ui/slider";

interface DocumentReaderProps {
  fileName: string;
  fileData: string; // base64 data URL
  onClose: () => void;
}

export function DocumentReader({ fileName, fileData, onClose }: DocumentReaderProps) {
  const [content, setContent] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [showSettings, setShowSettings] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState<string>('Calibri');
  const [encoding, setEncoding] = useState<string>('UTF-8');
  const [rawBytes, setRawBytes] = useState<Uint8Array | null>(null);
  const [isPDF, setIsPDF] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  const linesPerPage = 25; // Количество строк на странице

  useEffect(() => {
    // Извлекаем текст из base64 data URL
    const extractText = async () => {
      try {
        // Определяем расширение файла
        const extension = fileName.toLowerCase().split('.').pop();
        
        // Проверяем, является ли файл PDF
        if (extension === 'pdf') {
          setIsPDF(true);
          
          // Создаем Blob URL для PDF
          try {
            const base64Data = fileData.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
          } catch (error) {
            console.error('Error creating PDF blob:', error);
          }
          
          return; // Для PDF не нужно извлекать текст
        }

        setIsPDF(false);

        // Убираем префикс data URL
        const base64Data = fileData.split(',')[1];
        if (!base64Data) {
          setContent("Не удалось загрузить содержимое файла.");
          return;
        }

        // Декодируем base64
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Сохраняем сырые байты для возможности перекодирования
        setRawBytes(bytes);
        
        if (extension === 'txt') {
          // Пробуем разные кодировки
          let text = '';
          
          try {
            // Сначала пробуем UTF-8
            const decoder = new TextDecoder('utf-8', { fatal: true });
            text = decoder.decode(bytes);
            setEncoding('UTF-8');
          } catch (e) {
            // Если не получилось, пробуем Windows-1251
            try {
              const decoder = new TextDecoder('windows-1251');
              text = decoder.decode(bytes);
              setEncoding('Windows-1251');
            } catch (e2) {
              // В крайнем случае используем UTF-8 без fatal
              const decoder = new TextDecoder('utf-8', { fatal: false });
              text = decoder.decode(bytes);
              setEncoding('UTF-8');
            }
          }
          
          setContent(text);
        } else if (extension === 'doc' || extension === 'docx') {
          // Для doc/docx файлов пытаемся извлечь текст
          try {
            const decoder = new TextDecoder('utf-8', { fatal: false });
            let text = decoder.decode(bytes);
            
            // Убираем управляющие символы и бинарные данные
            text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            
            // Если текста слишком мало или много мусора, показываем сообщение
            if (text.trim().length < 50) {
              setContent("Не удалось прочитать содержимое .doc/.docx файла.\n\nДля корректного отображения документов Word рекомендуется:\n1. Сохранить файл в формате .txt\n2. Скопировать содержимое в текстовый комментарий проекта\n3. Скачать файл для просмотра в Word");
            } else {
              setContent(text);
            }
          } catch (error) {
            setContent("Ошибка при чтении .doc/.docx файла.\n\nРекомендуется использовать формат .txt для текстовых документов.");
          }
        } else {
          setContent("Формат файла не поддерживается для чтения.\n\nПоддерживаемые форматы: .txt, .pdf");
        }
      } catch (error) {
        console.error('Error reading file:', error);
        setContent("Ошибка при загрузке файла.");
      }
    };

    extractText();
  }, [fileData, fileName]);

  // Очистка Blob URL при размонтировании
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Разбиваем текст на страницы
  const pages = useMemo(() => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const pageArray: string[] = [];
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage);
      pageArray.push(pageLines.join('\n'));
    }
    
    return pageArray.length > 0 ? pageArray : [content];
  }, [content, linesPerPage]);

  const totalPages = pages.length;

  // Функция для перекодирования текста
  const changeEncoding = (newEncoding: string) => {
    if (!rawBytes) return;
    
    try {
      const decoder = new TextDecoder(newEncoding);
      const text = decoder.decode(rawBytes);
      setContent(text);
      setEncoding(newEncoding);
      setCurrentPage(0); // Возвращаемся на первую страницу
    } catch (error) {
      console.error('Error changing encoding:', error);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white',
          text: 'text-gray-900',
          border: 'border-gray-200'
        };
      case 'sepia':
        return {
          background: 'bg-[#f4ecd8]',
          text: 'text-[#5c4a2c]',
          border: 'border-[#d4c4a8]'
        };
      case 'dark':
        return {
          background: 'bg-gray-900',
          text: 'text-gray-100',
          border: 'border-gray-700'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Если это PDF, показываем встроенный просмотрщик
  if (isPDF) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-800 flex flex-col">
        {/* Верхняя панель для PDF */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <BookOpen className="w-5 h-5" />
            <h2 className="font-medium truncate max-w-md">{fileName}</h2>
          </div>
        </div>

        {/* PDF просмотрщик через iframe */}
        <div className="flex-1 overflow-hidden">
          {pdfBlobUrl && (
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${themeStyles.background} flex flex-col`}>
      {/* Верхняя панель */}
      <div className={`flex items-center justify-between p-4 border-b ${themeStyles.border} ${themeStyles.background}`}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <BookOpen className="w-5 h-5" />
          <h2 className="font-medium truncate max-w-md">{fileName}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm mr-2">
            {currentPage + 1} / {totalPages}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Настройки */}
      {showSettings && (
        <Card className={`absolute top-16 right-4 z-50 p-4 w-80 shadow-lg ${themeStyles.background}`}>
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4" />
                Размер шрифта: {fontSize}px
              </Label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
              />
            </div>

            <div>
              <Label className="mb-2 block">Межстрочный интервал: {lineHeight}</Label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={1.2}
                max={2.4}
                step={0.1}
              />
            </div>

            <div>
              <Label className="mb-2 block">Шрифт</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={fontFamily === 'Calibri' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontFamily('Calibri')}
                  style={{ fontFamily: 'Calibri, sans-serif' }}
                >
                  Calibri
                </Button>
                <Button
                  variant={fontFamily === 'Arial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontFamily('Arial')}
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Arial
                </Button>
                <Button
                  variant={fontFamily === 'Times New Roman' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontFamily('Times New Roman')}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Times
                </Button>
                <Button
                  variant={fontFamily === 'Georgia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontFamily('Georgia')}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Georgia
                </Button>
              </div>
            </div>

            {rawBytes && (
              <div>
                <Label className="mb-2 block">Кодировка текста</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={encoding === 'UTF-8' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeEncoding('utf-8')}
                  >
                    UTF-8
                  </Button>
                  <Button
                    variant={encoding === 'Windows-1251' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeEncoding('windows-1251')}
                  >
                    Windows-1251
                  </Button>
                  <Button
                    variant={encoding === 'KOI8-R' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeEncoding('koi8-r')}
                  >
                    KOI8-R
                  </Button>
                  <Button
                    variant={encoding === 'ISO-8859-5' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeEncoding('iso-8859-5')}
                  >
                    ISO-8859-5
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Если текст отображается неправильно, попробуйте другую кодировку
                </p>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Тема оформления</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  <Sun className="w-4 h-4 mr-1" />
                  Светлая
                </Button>
                <Button
                  variant={theme === 'sepia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('sepia')}
                  className="flex-1"
                >
                  Сепия
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  <Moon className="w-4 h-4 mr-1" />
                  Темная
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Основная область чтения */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div 
            className={`${themeStyles.text} whitespace-pre-wrap font-serif`}
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontFamily
            }}
          >
            {pages[currentPage] || content}
          </div>
        </div>
      </div>

      {/* Нижняя панель навигации */}
      <div className={`flex items-center justify-between p-4 border-t ${themeStyles.border} ${themeStyles.background}`}>
        <Button
          variant="outline"
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Предыдущая
        </Button>

        {/* Прогресс чтения */}
        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Следующая
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}