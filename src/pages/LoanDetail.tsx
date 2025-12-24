import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

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
}

interface Review {
  id: number;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const LOANS_API = 'https://functions.poehali.dev/2e78ece3-1fe5-4e54-9183-6ffd1ab6e6e4';
const REVIEWS_API = 'https://functions.poehali.dev/46915a98-4802-4872-beba-8f90ee813639';

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    rating: 5,
    comment: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const loanResponse = await fetch(`${LOANS_API}?id=${id}`);
        const loanData = await loanResponse.json();
        setLoan(loanData);

        const reviewsResponse = await fetch(`${REVIEWS_API}?loan_id=${id}`);
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.author_name || !reviewForm.comment) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(REVIEWS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: parseInt(id!),
          author_name: reviewForm.author_name,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Отзыв отправлен на модерацию'
        });
        setReviewForm({ author_name: '', rating: 5, comment: '' });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отзыв',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Займ не найден</h1>
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : loan.rating;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  return (
    <>
      <Helmet>
        <title>{loan.name} - Онлайн займ на выгодных условиях | ЗаймыОнлайн</title>
        <meta name="description" content={`${loan.name}: сумма от ${loan.amount_min.toLocaleString('ru-RU')} до ${loan.amount_max.toLocaleString('ru-RU')} ₽, срок от ${loan.term_min} до ${loan.term_max} дней, ставка ${loan.rate}%. ${loan.features.join('. ')}.`} />
        <meta name="keywords" content={`${loan.name}, займ онлайн, быстрый займ, микрозайм, ${loan.features.join(', ')}`} />
        <meta property="og:title" content={`${loan.name} - Онлайн займ`} />
        <meta property="og:description" content={`Сумма до ${loan.amount_max.toLocaleString('ru-RU')} ₽, ставка ${loan.rate}%, одобрение ${loan.approval_rate}%`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://yoursite.com/loan/${loan.id}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative">
          <header className="glass-card border-b border-white/5 sticky top-0 z-50 backdrop-blur-2xl">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                    💸
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">ЗаймыОнлайн</h1>
                  </div>
                </Link>
                <Link to="/">
                  <Button variant="ghost">
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Назад к списку
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card animate-fade-in">
                  <div className={`h-3 bg-gradient-to-r ${loan.color}`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-6xl">{loan.logo}</div>
                      <div className="flex-1">
                        <CardTitle className="text-4xl mb-2">{loan.name}</CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-yellow-500">
                            <Icon name="Star" size={20} fill="currentColor" />
                            <span className="text-lg font-bold ml-1">{avgRating.toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {reviews.length} отзывов
                          </span>
                          <Badge variant="secondary" className="text-green-500">
                            {loan.approval_rate}% одобрение
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <p className="text-sm text-muted-foreground mb-2">Сумма займа</p>
                        <p className="text-3xl font-bold">
                          {loan.amount_min.toLocaleString('ru-RU')} - {loan.amount_max.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5">
                        <p className="text-sm text-muted-foreground mb-2">Срок</p>
                        <p className="text-3xl font-bold">
                          {loan.term_min} - {loan.term_max} дней
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
                        <p className="text-sm text-muted-foreground mb-2">Ставка</p>
                        <p className="text-3xl font-bold text-accent">
                          {loan.rate}% в день
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5">
                        <p className="text-sm text-muted-foreground mb-2">Популярность</p>
                        <p className="text-3xl font-bold text-green-500">
                          {loan.clicks.toLocaleString('ru-RU')} кликов
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-bold mb-4">Преимущества</h3>
                      <div className="grid gap-3">
                        {loan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Icon name="Check" size={16} className="text-green-500" />
                            </div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-bold mb-4">Требования</h3>
                      <div className="grid gap-3">
                        {loan.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Icon name="FileCheck" size={16} className="text-primary" />
                            </div>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Отзывы клиентов</CardTitle>
                    <CardDescription>
                      Реальные отзывы людей, которые воспользовались услугами {loan.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 p-6 rounded-xl bg-muted/30">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center text-yellow-500 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              name="Star"
                              size={20}
                              fill={star <= Math.round(avgRating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          На основе {reviews.length} отзывов
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingDistribution.map(({ stars, count, percentage }) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm w-3">{stars}</span>
                            <Icon name="Star" size={14} className="text-yellow-500" fill="currentColor" />
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-8">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="glass-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{review.author_name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Icon
                                        key={star}
                                        name="Star"
                                        size={14}
                                        fill={star <= review.rating ? 'currentColor' : 'none'}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-bold mb-4">Оставить отзыв</h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <Label htmlFor="author_name">Ваше имя</Label>
                          <Input
                            id="author_name"
                            value={reviewForm.author_name}
                            onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                            placeholder="Иван И."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="rating">Оценка</Label>
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="transition-transform hover:scale-110"
                              >
                                <Icon
                                  name="Star"
                                  size={32}
                                  className="text-yellow-500"
                                  fill={star <= reviewForm.rating ? 'currentColor' : 'none'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="comment">Ваш отзыв</Label>
                          <Textarea
                            id="comment"
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            placeholder="Поделитесь своим опытом..."
                            rows={4}
                            required
                          />
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                          Отправить отзыв
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Отзыв будет опубликован после модерации
                        </p>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="glass-card sticky top-24">
                  <CardHeader>
                    <CardTitle>Получить займ</CardTitle>
                    <CardDescription>
                      Оформите заявку прямо сейчас
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button size="lg" className="w-full" onClick={() => window.open('#', '_blank')}>
                      <Icon name="ExternalLink" size={20} className="mr-2" />
                      Перейти на сайт {loan.name}
                    </Button>

                    <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Shield" size={16} className="text-green-500" />
                        <span>Безопасное оформление</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={16} className="text-blue-500" />
                        <span>Решение за 5 минут</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="CreditCard" size={16} className="text-purple-500" />
                        <span>Деньги на любую карту</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Конверсия: {((loan.conversions / loan.clicks) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.conversions.toLocaleString('ru-RU')} человек получили займ
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
