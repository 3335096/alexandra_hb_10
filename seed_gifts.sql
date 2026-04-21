-- Подарки ozon.by. Повторный запуск безопасен: INSERT не дублирует по link.
-- Сначала правим уже сохранённые опечатки в slug, затем добавляем недостающие строки.

UPDATE gifts SET link = 'https://ozon.by/t/4kIs8RZ' WHERE link = 'https://ozon.by/t/4kls8RZ';
UPDATE gifts SET link = 'https://ozon.by/t/NBDlzyW' WHERE link = 'https://ozon.by/t/NBDIzyW';
UPDATE gifts SET link = 'https://ozon.by/t/nPIHvAe' WHERE link = 'https://ozon.by/t/nPlHvAe';
UPDATE gifts SET link = 'https://ozon.by/t/NBDlJMA' WHERE link = 'https://ozon.by/t/NBDIJMA';
UPDATE gifts SET link = 'https://ozon.by/t/uevTvzI' WHERE link = 'https://ozon.by/t/uevTvzl';
UPDATE gifts SET link = 'https://ozon.by/product/figurka-funko-pop-disney-winnie-the-pooh-s3-winnie-the-pooh-1512-80236-3255638358/?at=99tr6mMYvunnPgyqU1LRLYWc1Zw9wlHMEvO97U7JRZkz' WHERE link = 'https://ozon.by/t/sS418Sk';

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Хипперсы на телефон котики$$, NULL, 'https://ozon.by/t/4kIs8RZ', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/4kIs8RZ');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Мини-принтер цветной Xiaomi Mijia Printer AR ZINK$$, NULL, 'https://ozon.by/t/c0yaY2s', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/c0yaY2s');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Лило и Стич / Lilo and Stitch Summer Stitch (10см)$$, NULL, 'https://ozon.by/t/NBqznYN', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBqznYN');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Спортивная бутылка, 720 мл$$, NULL, 'https://ozon.by/t/NBDlzyW', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBDlzyW');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Nike Рюкзак$$, NULL, 'https://ozon.by/t/nPIHvAe', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/nPIHvAe');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Фигурка Funko POP! Nooks Disney Winnie the Pooh$$, NULL, 'https://ozon.by/product/figurka-funko-pop-disney-winnie-the-pooh-s3-winnie-the-pooh-1512-80236-3255638358/?at=99tr6mMYvunnPgyqU1LRLYWc1Zw9wlHMEvO97U7JRZkz', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/product/figurka-funko-pop-disney-winnie-the-pooh-s3-winnie-the-pooh-1512-80236-3255638358/?at=99tr6mMYvunnPgyqU1LRLYWc1Zw9wlHMEvO97U7JRZkz');

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
SELECT $$Акриловые маркеры для рисования двухцветные кисти 48 шт 96 цветов$$, NULL, 'https://ozon.by/t/NBDlJMA', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/NBDlJMA');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Набор гуашевых красок HIMI MIYA персиковый 48 цветов по 12 грамм$$, NULL, 'https://ozon.by/t/b2rc3W2', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/b2rc3W2');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT $$Набор для творчества и создания брелков и заколок$$, NULL, 'https://ozon.by/t/uevTvzI', NULL, NULL, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://ozon.by/t/uevTvzI');

-- Тестовые карточки (проверка брони и складчины). Можно удалить из БД и убрать отсюда после проверки.
INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT
  $$[Тест] Подарок — бронь$$,
  $$Проверка кнопки «Забронировать». Ссылка ведёт на example.com — настоящий товар не заказывайте.$$, 'https://example.com/wishlist-test-reserve', NULL, 1, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://example.com/wishlist-test-reserve');

INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
SELECT
  $$[Тест] Подарок — складчина$$,
  $$Проверка кнопки «В складчину» и сбора суммы. Тестовая цель 5 000 ₽.$$, 'https://example.com/wishlist-test-group', NULL, 100, true, 5000
WHERE NOT EXISTS (SELECT 1 FROM gifts WHERE link = 'https://example.com/wishlist-test-group');
