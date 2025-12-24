import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Loan {
  id: number;
  name: string;
  logo: string;
  amount_min: number;
  amount_max: number;
  term_min: number;
  term_max: number;
  rate: number;
  approval_rate: number;
  rating: number;
  reviews: number;
  features: string[];
  requirements: string[];
  color: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const API_URL = 'https://functions.poehali.dev/2e78ece3-1fe5-4e54-9183-6ffd1ab6e6e4';

export default function Admin() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    amount_min: 1000,
    amount_max: 100000,
    term_min: 5,
    term_max: 365,
    rate: 0.5,
    approval_rate: 90,
    rating: 4.5,
    reviews: 0,
    features: '',
    requirements: '',
    color: 'from-purple-500 to-pink-500',
    is_active: true
  });

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?active=false`);
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить займы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      logo: '',
      amount_min: 1000,
      amount_max: 100000,
      term_min: 5,
      term_max: 365,
      rate: 0.5,
      approval_rate: 90,
      rating: 4.5,
      reviews: 0,
      features: '',
      requirements: '',
      color: 'from-purple-500 to-pink-500',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (loan: Loan) => {
    setIsCreating(false);
    setEditingLoan(loan);
    setFormData({
      name: loan.name,
      logo: loan.logo,
      amount_min: loan.amount_min,
      amount_max: loan.amount_max,
      term_min: loan.term_min,
      term_max: loan.term_max,
      rate: loan.rate,
      approval_rate: loan.approval_rate,
      rating: loan.rating,
      reviews: loan.reviews,
      features: loan.features.join('\n'),
      requirements: loan.requirements.join('\n'),
      color: loan.color,
      is_active: loan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот займ?')) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Займ удален'
        });
        loadLoans();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить займ',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim()),
        requirements: formData.requirements.split('\n').filter(r => r.trim())
      };

      if (isCreating) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          toast({
            title: 'Успех',
            description: 'Займ создан'
          });
          setIsDialogOpen(false);
          loadLoans();
        }
      } else if (editingLoan) {
        const response = await fetch(`${API_URL}?id=${editingLoan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          toast({
            title: 'Успех',
            description: 'Займ обновлен'
          });
          setIsDialogOpen(false);
          loadLoans();
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить займ',
        variant: 'destructive'
      });
    }
  };

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.is_active).length,
    totalClicks: loans.reduce((sum, l) => sum + l.clicks, 0),
    totalConversions: loans.reduce((sum, l) => sum + l.conversions, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Admin-панель</h1>
              <p className="text-muted-foreground">Управление займами и аналитика</p>
            </div>
            <Button onClick={handleCreate} size="lg">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить займ
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardDescription>Всего займов</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardDescription>Активных</CardDescription>
                <CardTitle className="text-3xl text-green-500">{stats.active}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardDescription>Всего кликов</CardDescription>
                <CardTitle className="text-3xl text-primary">{stats.totalClicks.toLocaleString('ru-RU')}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardDescription>Конверсий</CardDescription>
                <CardTitle className="text-3xl text-secondary">{stats.totalConversions.toLocaleString('ru-RU')}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Список займов</CardTitle>
            <CardDescription>Управляйте предложениями займов</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Займ</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Срок</TableHead>
                      <TableHead>Ставка</TableHead>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead>Клики</TableHead>
                      <TableHead>Конверсии</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{loan.logo}</span>
                            <span className="font-semibold">{loan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {loan.amount_min.toLocaleString('ru-RU')} - {loan.amount_max.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>{loan.term_min}-{loan.term_max} дн</TableCell>
                        <TableCell>{loan.rate}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-500" fill="currentColor" />
                            {loan.rating}
                          </div>
                        </TableCell>
                        <TableCell>{loan.clicks.toLocaleString('ru-RU')}</TableCell>
                        <TableCell>{loan.conversions.toLocaleString('ru-RU')}</TableCell>
                        <TableCell>
                          <Badge variant={loan.is_active ? 'default' : 'secondary'}>
                            {loan.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(loan)}>
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(loan.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Создать займ' : 'Редактировать займ'}</DialogTitle>
              <DialogDescription>
                {isCreating ? 'Заполните форму для создания нового займа' : 'Измените данные займа'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Эмодзи</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount_min">Мин. сумма</Label>
                  <Input
                    id="amount_min"
                    type="number"
                    value={formData.amount_min}
                    onChange={(e) => setFormData({ ...formData, amount_min: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount_max">Макс. сумма</Label>
                  <Input
                    id="amount_max"
                    type="number"
                    value={formData.amount_max}
                    onChange={(e) => setFormData({ ...formData, amount_max: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term_min">Мин. срок (дни)</Label>
                  <Input
                    id="term_min"
                    type="number"
                    value={formData.term_min}
                    onChange={(e) => setFormData({ ...formData, term_min: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="term_max">Макс. срок (дни)</Label>
                  <Input
                    id="term_max"
                    type="number"
                    value={formData.term_max}
                    onChange={(e) => setFormData({ ...formData, term_max: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rate">Ставка (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="approval_rate">Одобрение (%)</Label>
                  <Input
                    id="approval_rate"
                    type="number"
                    value={formData.approval_rate}
                    onChange={(e) => setFormData({ ...formData, approval_rate: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Рейтинг</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Преимущества (каждое с новой строки)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Требования (каждое с новой строки)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="color">Градиент (Tailwind)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="from-purple-500 to-pink-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активен</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? 'Создать' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
