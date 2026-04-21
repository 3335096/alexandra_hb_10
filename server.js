require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 🎁 Получить все подарки
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gifts ORDER BY created_at DESC');
    res.json(result.rows);
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
