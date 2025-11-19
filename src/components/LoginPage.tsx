import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Specialist } from "../types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import logo from "figma:asset/a77c055ce1f22b1a1ba46b904d066b60abd7fc2a.png";

interface LoginPageProps {
  specialists: Specialist[];
  onLogin: (specialist: Specialist) => void;
}

export function LoginPage({ specialists, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Имитация небольшой задержки для реалистичности
    setTimeout(() => {
      const specialist = specialists.find(
        (s) => s.email === email && s.password === password
      );

      if (specialist) {
        // Проверяем, активен ли специалист
        if (specialist.active === false) {
          setError("Ваш аккаунт деактивирован. Обратитесь к администратору.");
        } else {
          onLogin(specialist);
        }
      } else {
        setError("Неверный email или пароль");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Логотип" className="w-24 h-24" />
          </div>
          <CardTitle className="text-2xl font-bold">CRM-МОЗГОВИЧОК</CardTitle>
          <CardDescription>
            Войдите в систему для продолжения работы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Логин</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mozgovichok.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: '#53b4e9' }}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Демо-аккаунты для входа:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <strong>Администратор:</strong> admin@mozgovichok.ru / admin123
              </p>
              <p>
                <strong>Специалист 1:</strong> maria@mozgovichok.ru / maria123
              </p>
              <p>
                <strong>Специалист 2:</strong> elena@mozgovichok.ru / elena123
              </p>
              <p>
                <strong>Клиент:</strong> client@mozgovichok.ru / client123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}