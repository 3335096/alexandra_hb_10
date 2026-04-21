require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const INDEX_HTML_PATH = path.join(__dirname, 'public', 'index.html');
let indexHtmlTemplate = null;

function getPublicBaseUrl(req) {
  const fromEnv = process.env.PUBLIC_URL || process.env.BASE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  const proto =
    req.get('x-forwarded-proto') ||
    (req.secure ? 'https' : 'http');
  const host = req.get('host') || 'localhost';
  return `${proto}://${host}`;
}

const app = express();
const PORT = process.env.PORT || 3000;

function normalizeContributors(row) {
  let c = row.contributors;
  if (c == null) return [];
  if (typeof c === 'string') {
    try {
      c = JSON.parse(c);
    } catch {
      return [];
    }
  }
  return Array.isArray(c) ? c : [];
}

/** Без имён брони, списка вкладов и заметки админа — только для гостей */
function sanitizeGiftRow(row) {
  const contributors = normalizeContributors(row);
  const contributorCount = contributors.length;
  const {
    reserved_by_name: _r,
    reserved_at: _a,
    admin_note: _n,
    contributors: _c,
    ...rest
  } = row;
  return {
    ...rest,
    contributors: [],
    contributor_count: contributorCount,
    reserved_by_name: null,
    reserved_at: null,
    admin_note: null
  };
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  try {
    if (!indexHtmlTemplate) {
      indexHtmlTemplate = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    }
    const baseUrl = getPublicBaseUrl(req);
    const html = indexHtmlTemplate.replace(/\{\{BASE_URL\}\}/g, baseUrl);
    res.type('html').send(html);
  } catch (err) {
    console.error(err);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// 🎁 Получить все подарки (полные данные только с заголовком X-Admin-Key)
app.get('/api/gifts', async (req, res) => {
  try {
    const adminHeader = req.headers['x-admin-key'];
    const isAdmin =
      adminHeader &&
      process.env.ADMIN_KEY &&
      adminHeader === process.env.ADMIN_KEY;

    const result = await db.query('SELECT * FROM gifts ORDER BY created_at DESC');
    const rows = result.rows.map((row) => {
      const normalized = { ...row, contributors: normalizeContributors(row) };
      if (isAdmin) return normalized;
      return sanitizeGiftRow(normalized);
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки подарков' });
  }
});

// ➕ Добавить подарок (админ)
app.post('/api/gifts', async (req, res) => {
  const { admin_key } = req.body;
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Неверный ключ администратора' });
  }
  
  const { title, description, link, image_url, price, is_group_gift, target_amount } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO gifts (title, description, link, image_url, price, is_group_gift, target_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, link, image_url, price, is_group_gift, target_amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка добавления подарка' });
  }
});

// 🔒 Зарезервировать подарок (просто имя)
app.put('/api/gifts/:id/reserve', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Введите ваше имя (мин. 2 символа)' });
  }
  
  try {
    const result = await db.query(
      `UPDATE gifts 
       SET status = 'reserved', reserved_by_name = $1, reserved_at = NOW()
       WHERE id = $2 AND status = 'available'
       RETURNING *`,
      [name.trim(), req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Подарок уже забронирован!' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка бронирования' });
  }
});

// 👥 Присоединиться к складчине
app.put('/api/gifts/:id/contribute', async (req, res) => {
  const { name, amount } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Введите ваше имя' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Укажите корректную сумму' });
  }
  if (Number(amount) < 50) {
    return res.status(400).json({ error: 'Минимальный взнос 50 ₽' });
  }
  
  try {
    // Получаем текущие данные
    const gift = await db.query('SELECT * FROM gifts WHERE id = $1', [req.params.id]);
    if (gift.rows.length === 0) return res.status(404).json({ error: 'Подарок не найден' });
    
    const current = gift.rows[0];
    const contributors = current.contributors || [];
    const newContributors = [...contributors, { name: name.trim(), amount: Number(amount), date: new Date() }];
    const newCollected = (Number(current.collected_amount) || 0) + Number(amount);
    
    // Проверяем, собрана ли полная сумма
    const newStatus = (current.target_amount && newCollected >= current.target_amount) 
      ? 'purchased' 
      : current.status;
    
    const result = await db.query(
      `UPDATE gifts 
       SET contributors = $1, collected_amount = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [JSON.stringify(newContributors), newCollected, newStatus, req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка участия в складчине' });
  }
});

// ✏️ Изменить подарок (админ): цена, цель складчины, заметка
app.patch('/api/gifts/:id', async (req, res) => {
  const { admin_key, price, target_amount, admin_note, is_group_gift } = req.body;
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Неверный ключ администратора' });
  }

  const fields = [];
  const values = [];
  let n = 1;
  let skipTargetFromBody = false;

  if (is_group_gift !== undefined) {
    fields.push(`is_group_gift = $${n++}`);
    values.push(Boolean(is_group_gift));
    if (!is_group_gift) {
      fields.push(`target_amount = $${n++}`);
      values.push(null);
      skipTargetFromBody = true;
    }
  }

  if (price !== undefined) {
    fields.push(`price = $${n++}`);
    values.push(price === '' || price === null ? null : Number(price));
  }
  if (target_amount !== undefined && !skipTargetFromBody) {
    fields.push(`target_amount = $${n++}`);
    values.push(target_amount === '' || target_amount === null ? null : Number(target_amount));
  }
  if (admin_note !== undefined) {
    fields.push(`admin_note = $${n++}`);
    values.push(admin_note === '' || admin_note === null ? null : String(admin_note));
  }

  if (fields.length === 0) {
    return res.status(400).json({
      error: 'Укажите цену, цель, заметку, тип подарка (складчина) или другие поля',
    });
  }

  values.push(req.params.id);

  try {
    const result = await db.query(
      `UPDATE gifts SET ${fields.join(', ')} WHERE id = $${n} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Подарок не найден' });
    }
    const row = result.rows[0];
    row.contributors = normalizeContributors(row);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

// ❌ Отменить бронь (админ)
app.delete('/api/gifts/:id', async (req, res) => {
  const { admin_key } = req.body;
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Неверный ключ администратора' });
  }
  
  try {
    await db.query('DELETE FROM gifts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// 🚀 Запуск
app.listen(PORT, async () => {
  console.log(`🎁 Сервер запущен на порту ${PORT}`);
  if (process.env.DATABASE_URL) {
    await db.init();
  }
});
