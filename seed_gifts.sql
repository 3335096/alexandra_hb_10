-- Однократная заливка подарков (ozon.by). Повторный запуск безопасен: те же ссылки не дублируются.
-- Выполнение: psql "$DATABASE_URL" -f seed_gifts.sql
-- (локально или: Railway → Postgres → Query / или CLI с переменной DATABASE_URL сервиса приложения)

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Хипперсы на телефон котики$$, NULL, 'https://ozon.by/t/4kls8RZ', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/4kls8RZ');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Мини-принтер цветной Xiaomi Mijia Printer AR ZINK$$, NULL, 'https://ozon.by/t/c0yaY2s', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/c0yaY2s');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Лило и Стич / Lilo and Stitch Summer Stitch (10см)$$, NULL, 'https://ozon.by/t/NBqznYN', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBqznYN');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Спортивная бутылка, 720 мл$$, NULL, 'https://ozon.by/t/NBDIzyW', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBDIzyW');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Nike Рюкзак$$, NULL, 'https://ozon.by/t/nPlHvAe', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/nPlHvAe');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Funko POP! Nooks Disney Winnie the Pooh$$, NULL, 'https://ozon.by/t/sS418Sk', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/sS418Sk');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Funko POP! Animation KPop Demon Hunters Derpy with Sussie$$, NULL, 'https://ozon.by/t/Va6vMj8', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/Va6vMj8');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Funko POP! Movies Shrek DW 30th Puss in Boots$$, NULL, 'https://ozon.by/t/hopCF1s', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/hopCF1s');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Neflibata Сумка багет, на плечо$$, NULL, 'https://ozon.by/t/zM1ZiFZ', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/zM1ZiFZ');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Акриловые маркеры для рисования двухцветные кисти 48 шт 96 цветов$$, NULL, 'https://ozon.by/t/NBDIJMA', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBDIJMA');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Набор гуашевых красок HIMI MIYA персиковый 48 цветов по 12 грамм$$, NULL, 'https://ozon.by/t/b2rc3W2', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/b2rc3W2');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Набор для творчества и создания брелков и заколок$$, NULL, 'https://ozon.by/t/uevTvzl', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/uevTvzl');
