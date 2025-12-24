import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Loan {
  id: number;
  name: string;
  logo: string;
  amount: { min: number; max: number };
  term: { min: number; max: number };
  rate: number;
  approvalRate: number;
  rating: number;
  reviews: number;
  features: string[];
  requirements: string[];
  color: string;
  clicks: number;
  conversions: number;
}

const mockLoans: Loan[] = [
  {
    id: 1,
    name: 'Быстроденьги',
    logo: '💰',
    amount: { min: 1000, max: 100000 },
    term: { min: 5, max: 365 },
    rate: 0.5,
    approvalRate: 95,
    rating: 4.8,
    reviews: 2341,
    features: ['Без отказа', 'Мгновенное одобрение', 'Первый займ 0%'],
    requirements: ['Возраст от 18 лет', 'Паспорт РФ', 'Номер телефона'],
    color: 'from-purple-500 to-pink-500',
    clicks: 12453,
    conversions: 8734
  },
  {
    id: 2,
    name: 'МигКредит',
    logo: '⚡',
    amount: { min: 5000, max: 150000 },
    term: { min: 10, max: 180 },
    rate: 0.8,
    approvalRate: 92,
    rating: 4.6,
    reviews: 1876,
    features: ['Онлайн-оформление', 'Без справок', 'На карту любого банка'],
    requirements: ['Возраст от 21 года', 'Паспорт РФ', 'Постоянный доход'],
    color: 'from-cyan-500 to-blue-500',
    clicks: 9821,
    conversions: 7234
  },
  {
    id: 3,
    name: 'ДеньгиСразу',
    logo: '🚀',
    amount: { min: 2000, max: 80000 },
    term: { min: 7, max: 90 },
    rate: 0.3,
    approvalRate: 98,
    rating: 4.9,
    reviews: 3567,
    features: ['Самая низкая ставка', '100% одобрение', 'Без проверки КИ'],
    requirements: ['Возраст от 18 лет', 'Паспорт', 'Телефон'],
    color: 'from-orange-500 to-red-500',
    clicks: 15678,
    conversions: 11234
  },
  {
    id: 4,
    name: 'ФинансПлюс',
    logo: '💎',
    amount: { min: 10000, max: 200000 },
    term: { min: 30, max: 365 },
    rate: 1.2,
    approvalRate: 88,
    rating: 4.5,
    reviews: 1432,
    features: ['Крупные суммы', 'Длительный срок', 'Программа лояльности'],
    requirements: ['Возраст от 23 лет', 'Паспорт РФ', 'Трудовой стаж от 3 мес'],
    color: 'from-emerald-500 to-teal-500',
    clicks: 7654,
    conversions: 5432
  },
  {
    id: 5,
    name: 'ТопЗайм',
    logo: '🎯',
    amount: { min: 3000, max: 120000 },
    term: { min: 14, max: 270 },
    rate: 0.6,
    approvalRate: 94,
    rating: 4.7,
    reviews: 2890,
    features: ['Быстрое решение', 'Без скрытых комиссий', 'Круглосуточно'],
    requirements: ['Возраст от 20 лет', 'Паспорт РФ', 'Email'],
    color: 'from-violet-500 to-purple-500',
    clicks: 11234,
    conversions: 8976
  },
  {
    id: 6,
    name: 'КредитЭкспресс',
    logo: '🏦',
    amount: { min: 5000, max: 100000 },
    term: { min: 10, max: 120 },
    rate: 0.9,
    approvalRate: 90,
    rating: 4.4,
    reviews: 1654,
    features: ['Проверенный сервис', 'Без переплат', 'Гибкие условия'],
    requirements: ['Возраст от 21 года', 'Паспорт', 'Прописка в РФ'],
    color: 'from-amber-500 to-yellow-500',
    clicks: 8432,
    conversions: 6234
  }
];

const faqData = [
  {
    question: 'Как быстро можно получить займ?',
    answer: 'Большинство займов одобряются в течение 5-15 минут. Деньги поступают на карту моментально после одобрения заявки.'
  },
  {
    question: 'Что нужно для получения займа онлайн?',
    answer: 'Для оформления займа потребуется паспорт РФ, номер телефона и банковская карта. Некоторые МФО могут попросить дополнительные документы для крупных сумм.'
  },
  {
    question: 'Можно ли получить займ с плохой кредитной историей?',
    answer: 'Да, многие МФО одобряют займы даже с негативной кредитной историей. Обратите внимание на займы с пометкой "Без отказа" и "Без проверки КИ".'
  },
  {
    question: 'Как происходит погашение займа?',
    answer: 'Погашение происходит автоматически с привязанной карты в указанную дату или вручную через личный кабинет МФО.'
  }
];

const API_URL = 'https://functions.poehali.dev/2e78ece3-1fe5-4e54-9183-6ffd1ab6e6e4';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmount, setSelectedAmount] = useState([50000]);
  const [selectedTerm, setSelectedTerm] = useState([30]);
  const [sortBy, setSortBy] = useState('rating');
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const transformedLoans = data.map((loan: any) => ({
          id: loan.id,
          name: loan.name,
          logo: loan.logo,
          amount: { min: loan.amount_min, max: loan.amount_max },
          term: { min: loan.term_min, max: loan.term_max },
          rate: loan.rate,
          approvalRate: loan.approval_rate,
          rating: loan.rating,
          reviews: loan.reviews,
          features: loan.features,
          requirements: loan.requirements,
          color: loan.color,
          clicks: loan.clicks,
          conversions: loan.conversions
        }));
        setLoans(transformedLoans);
      } catch (error) {
        console.error('Failed to load loans:', error);
        setLoans(mockLoans);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, []);

  const filteredLoans = loans
    .filter(loan => {
      const matchesSearch = loan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAmount = loan.amount.max >= selectedAmount[0];
      const matchesTerm = loan.term.max >= selectedTerm[0];
      return matchesSearch && matchesAmount && matchesTerm;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'rate': return a.rate - b.rate;
        case 'approval': return b.approvalRate - a.approvalRate;
        case 'popular': return b.clicks - a.clicks;
        default: return 0;
      }
    });

  const toggleCompare = (loanId: number) => {
    setCompareList(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const trackClick = (loanId: number) => {
    console.log(`Клик по займу ID: ${loanId}`);
  };

  return (
    <>
      <Helmet>
        <title>Займы онлайн - Сравнение условий от 50+ МФО | Быстрое одобрение за 5 минут</title>
        <meta name="description" content="⭐ Лучшие займы онлайн 2024: сравните условия от 50+ МФО. Быстрое одобрение за 5 минут, деньги на карту мгновенно. Займы без отказа, первый займ 0%, без проверки КИ." />
        <meta name="keywords" content="займ онлайн, быстрый займ, микрозайм, займ без отказа, займ на карту, микрозайм онлайн, займ без проверки, первый займ 0%" />
        <meta property="og:title" content="Займы онлайн - Быстрое одобрение за 5 минут" />
        <meta property="og:description" content="Сравните условия от 50+ МФО. Займы без отказа, первый займ под 0%." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yoursite.com/" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        <header className="glass-card border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl animate-glow">
                  💸
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">ЗаймыОнлайн</h1>
                  <p className="text-xs text-muted-foreground">Умный поиск выгодных предложений</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Icon name="Phone" size={16} className="mr-2" />
                  Поддержка
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight">
              Найди свой займ за 30 секунд
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Сравниваем условия от 50+ МФО. Одобрение за минуты. Деньги на карту мгновенно.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Поиск: займ без отказа, онлайн, без проверки..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-14 pr-4 text-lg glass-card border-white/20"
              />
              <Icon name="Search" size={24} className="absolute left-4 top-4 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Без отказа', 'Первый займ 0%', 'Мгновенно', 'Без проверки КИ', 'Круглосуточно'].map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover-lift glass-card">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="glass-card mb-12 overflow-hidden animate-scale-in">
            <div className="relative bg-gradient-to-r from-accent via-primary to-secondary p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMThjNC45NyAwIDkuNDctMiAxMi43Mi01LjE3QzMzLjk3IDI3LjQ3IDM2IDIzIDM2IDE4em0tMTggMTVjLTguMjggMC0xNS02LjcyLTE1LTE1czYuNzItMTUgMTUtMTUgMTUgNi43MiAxNSAxNS02LjcyIDE1LTE1IDE1eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-glow">
                  <Icon name="Gift" size={40} className="text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Розыгрыш 20 000 ₽!
                </h3>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Подпишись на наш Telegram-канал и участвуй в розыгрыше. Победитель получит 20 000 рублей на карту!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto"
                    onClick={() => window.open('https://t.me/supportzaiminfo', '_blank')}
                  >
                    <Icon name="Send" size={24} className="mr-3" />
                    Участвовать в конкурсе
                  </Button>
                  <div className="flex items-center gap-2 text-white/80">
                    <Icon name="Users" size={20} />
                    <span className="text-sm">Уже участвуют 1 247 человек</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} />
                    <span>Бесплатное участие</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} />
                    <span>Честный розыгрыш</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} />
                    <span>Итоги каждый месяц</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="glass-card"
            >
              <Icon name="SlidersHorizontal" size={18} className="mr-2" />
              Фильтры
              {showFilters && <Icon name="ChevronUp" size={18} className="ml-2" />}
              {!showFilters && <Icon name="ChevronDown" size={18} className="ml-2" />}
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Сортировка:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                  <SelectItem value="rate">По ставке</SelectItem>
                  <SelectItem value="approval">По одобрению</SelectItem>
                  <SelectItem value="popular">По популярности</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card className="mb-8 glass-card animate-accordion-down">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Сумма займа: {selectedAmount[0].toLocaleString('ru-RU')} ₽
                    </label>
                    <Slider
                      value={selectedAmount}
                      onValueChange={setSelectedAmount}
                      max={200000}
                      min={1000}
                      step={1000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 000 ₽</span>
                      <span>200 000 ₽</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Срок займа: {selectedTerm[0]} дней
                    </label>
                    <Slider
                      value={selectedTerm}
                      onValueChange={setSelectedTerm}
                      max={365}
                      min={5}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 дней</span>
                      <span>365 дней</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Найдено предложений: <span className="font-bold text-primary">{filteredLoans.length}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredLoans.map((loan, index) => (
              <Card
                key={loan.id}
                className="glass-card hover-lift overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${loan.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{loan.logo}</div>
                      <div>
                        <CardTitle className="text-xl">{loan.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-yellow-500">
                            <Icon name="Star" size={16} fill="currentColor" />
                            <span className="text-sm font-semibold ml-1">{loan.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({loan.reviews} отзывов)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      checked={compareList.includes(loan.id)}
                      onCheckedChange={() => toggleCompare(loan.id)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Сумма</p>
                      <p className="font-bold">{loan.amount.min.toLocaleString('ru-RU')} - {loan.amount.max.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Срок</p>
                      <p className="font-bold">{loan.term.min}-{loan.term.max} дней</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ставка</p>
                      <p className="font-bold text-accent">{loan.rate}% в день</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Одобрение</p>
                      <p className="font-bold text-green-500">{loan.approvalRate}%</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    {loan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => trackClick(loan.id)}
                  >
                    Получить займ
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                  <Link to={`/loan/${loan.id}`}>
                    <Button variant="outline" size="icon">
                      <Icon name="Info" size={16} />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {compareList.length > 0 && (
            <Card className="glass-card mb-12 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Сравнение займов ({compareList.length})</span>
                  <Button variant="ghost" size="sm" onClick={() => setCompareList([])}>
                    Очистить
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">МФО</th>
                        <th className="text-left py-3 px-4">Сумма</th>
                        <th className="text-left py-3 px-4">Срок</th>
                        <th className="text-left py-3 px-4">Ставка</th>
                        <th className="text-left py-3 px-4">Рейтинг</th>
                        <th className="text-left py-3 px-4">Одобрение</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareList.map(id => {
                        const loan = mockLoans.find(l => l.id === id);
                        if (!loan) return null;
                        return (
                          <tr key={id} className="border-b border-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{loan.logo}</span>
                                <span className="font-semibold">{loan.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{loan.amount.max.toLocaleString('ru-RU')} ₽</td>
                            <td className="py-3 px-4">{loan.term.max} дней</td>
                            <td className="py-3 px-4 font-bold text-accent">{loan.rate}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center text-yellow-500">
                                <Icon name="Star" size={14} fill="currentColor" />
                                <span className="ml-1">{loan.rating}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-green-500">{loan.approvalRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="faq" className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass-card">
              <TabsTrigger value="faq">Вопросы и ответы</TabsTrigger>
              <TabsTrigger value="tips">Советы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="faq" className="mt-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Часто задаваемые вопросы</CardTitle>
                  <CardDescription>
                    Ответы на популярные вопросы о займах онлайн
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqData.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <Icon name="Shield" size={24} className="text-primary" />
                    </div>
                    <CardTitle>Проверяйте лицензию МФО</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Убедитесь, что компания имеет действующую лицензию ЦБ РФ. Это гарантирует законность деятельности и защиту ваших прав.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                      <Icon name="Calculator" size={24} className="text-secondary" />
                    </div>
                    <CardTitle>Рассчитывайте реальную переплату</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Обращайте внимание не только на процентную ставку, но и на все дополнительные комиссии и сборы.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                      <Icon name="Calendar" size={24} className="text-accent" />
                    </div>
                    <CardTitle>Погашайте вовремя</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Своевременное погашение займа улучшает вашу кредитную историю и дает доступ к более выгодным условиям в будущем.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                      <Icon name="TrendingUp" size={24} className="text-green-500" />
                    </div>
                    <CardTitle>Сравнивайте предложения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Не спешите с выбором. Используйте функцию сравнения, чтобы найти самые выгодные условия для ваших нужд.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <footer className="glass-card border-t border-white/5 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">О сервисе</h3>
                <p className="text-sm text-muted-foreground">
                  Агрегатор займов онлайн. Помогаем найти лучшие условия среди проверенных МФО.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Займы</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Займы без отказа</li>
                  <li>Первый займ 0%</li>
                  <li>Онлайн займы</li>
                  <li>Займы на карту</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Информация</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Как получить займ</li>
                  <li>Требования</li>
                  <li>Условия</li>
                  <li>Отзывы</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Контакты</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="Mail" size={16} />
                    info@zaimy.online
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Phone" size={16} />
                    8 (800) 555-35-35
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 pt-6 text-center text-sm text-muted-foreground">
              <p>© 2024 ЗаймыОнлайн. Все права защищены.</p>
              <p className="mt-2">Информация носит справочный характер и не является публичной офертой.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}