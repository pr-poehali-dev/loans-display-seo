CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(10) NOT NULL,
    amount_min INTEGER NOT NULL,
    amount_max INTEGER NOT NULL,
    term_min INTEGER NOT NULL,
    term_max INTEGER NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    approval_rate INTEGER NOT NULL CHECK (approval_rate >= 0 AND approval_rate <= 100),
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER NOT NULL DEFAULT 0,
    features TEXT[] NOT NULL,
    requirements TEXT[] NOT NULL,
    color VARCHAR(100) NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loans_active ON loans(is_active);
CREATE INDEX idx_loans_rating ON loans(rating DESC);
CREATE INDEX idx_loans_clicks ON loans(clicks DESC);

INSERT INTO loans (name, logo, amount_min, amount_max, term_min, term_max, rate, approval_rate, rating, reviews, features, requirements, color, clicks, conversions) VALUES
('Быстроденьги', '💰', 1000, 100000, 5, 365, 0.5, 95, 4.8, 2341, ARRAY['Без отказа', 'Мгновенное одобрение', 'Первый займ 0%'], ARRAY['Возраст от 18 лет', 'Паспорт РФ', 'Номер телефона'], 'from-purple-500 to-pink-500', 12453, 8734),
('МигКредит', '⚡', 5000, 150000, 10, 180, 0.8, 92, 4.6, 1876, ARRAY['Онлайн-оформление', 'Без справок', 'На карту любого банка'], ARRAY['Возраст от 21 года', 'Паспорт РФ', 'Постоянный доход'], 'from-cyan-500 to-blue-500', 9821, 7234),
('ДеньгиСразу', '🚀', 2000, 80000, 7, 90, 0.3, 98, 4.9, 3567, ARRAY['Самая низкая ставка', '100% одобрение', 'Без проверки КИ'], ARRAY['Возраст от 18 лет', 'Паспорт', 'Телефон'], 'from-orange-500 to-red-500', 15678, 11234),
('ФинансПлюс', '💎', 10000, 200000, 30, 365, 1.2, 88, 4.5, 1432, ARRAY['Крупные суммы', 'Длительный срок', 'Программа лояльности'], ARRAY['Возраст от 23 лет', 'Паспорт РФ', 'Трудовой стаж от 3 мес'], 'from-emerald-500 to-teal-500', 7654, 5432),
('ТопЗайм', '🎯', 3000, 120000, 14, 270, 0.6, 94, 4.7, 2890, ARRAY['Быстрое решение', 'Без скрытых комиссий', 'Круглосуточно'], ARRAY['Возраст от 20 лет', 'Паспорт РФ', 'Email'], 'from-violet-500 to-purple-500', 11234, 8976),
('КредитЭкспресс', '🏦', 5000, 100000, 10, 120, 0.9, 90, 4.4, 1654, ARRAY['Проверенный сервис', 'Без переплат', 'Гибкие условия'], ARRAY['Возраст от 21 года', 'Паспорт', 'Прописка в РФ'], 'from-amber-500 to-yellow-500', 8432, 6234);