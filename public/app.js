const API = '/api';
let currentGiftId = null;
let isAdmin = false;

async function loadGifts() {
  const container = document.getElementById('gifts-container');
  try {
    const res = await fetch(`${API}/gifts`);
    const gifts = await res.json();
    if (gifts.length === 0) {
      container.innerHTML = '<p class="loading">Список подарков пока пуст. Родители добавят их скоро! 🎀</p>';
      return;
    }
    container.innerHTML = gifts.map(gift => {
      const isGroup = gift.is_group_gift;
      const progress = gift.target_amount && gift.target_amount > 0
        ? Math.min(100, Math.round((gift.collected_amount / gift.target_amount) * 100)) : 0;
      return `
        <article class="gift-card" data-id="${gift.id}">
          ${gift.image_url ? `<img src="${gift.image_url}" alt="${gift.title}" class="gift-image" onerror="this.style.display='none'">` : ''}
          <h3 class="gift-title">${escapeHtml(gift.title)}</h3>
          ${isGroup ? '<span class="group-badge">👥 Можно в складчину</span>' : ''}
          <p class="gift-desc">${escapeHtml(gift.description || '')}</p>
          ${gift.price ? `<p class="gift-price">${formatPrice(gift.price)} ₽</p>` : ''}
          ${isGroup && gift.target_amount ? `
            <div class="group-info">
              <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
              <small>Собрано: ${formatPrice(gift.collected_amount || 0)} / ${formatPrice(gift.target_amount)} ₽</small>
              ${gift.contributors?.length ? `<br><small>Участников: ${gift.contributors.length}</small>` : ''}
            </div>` : ''}
          ${gift.status === 'reserved' ? `<p class="status-badge status-reserved">Забронировано: ${escapeHtml(gift.reserved_by_name)}</p>` : ''}
          ${gift.status === 'purchased' ? `<p class="status-badge status-purchased">✅ Подарено!</p>` : ''}
          <div class="gift-actions">
            <a href="${gift.link}" target="_blank" class="btn btn-secondary">🔗 Посмотреть</a>
            ${gift.status === 'available' ? `
              ${isGroup
                ? `<button class="btn btn-primary" onclick="openGroupModal(${gift.id}, '${escapeHtml(gift.title)}', ${gift.target_amount}, ${gift.collected_amount || 0})">👥 В складчину</button>`
                : `<button class="btn btn-primary" onclick="openReserveModal(${gift.id}, '${escapeHtml(gift.title)}')">🔒 Забронировать</button>`}
            ` : ''}
          </div>
        </article>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p class="loading">❌ Не удалось загрузить подарки. Попробуйте позже.</p>';
  }
}

function openReserveModal(id, title) {
  currentGiftId = id;
  document.getElementById('modal-gift-title').textContent = title;
  document.getElementById('reserve-modal').showModal();
}

function openGroupModal(id, title, target, collected) {
  currentGiftId = id;
  document.getElementById('group-gift-title').textContent = title;
  document.getElementById('target').textContent = formatPrice(target);
  document.getElementById('collected').textContent = formatPrice(collected);
  document.getElementById('group-progress').max = target;
  document.getElementById('group-progress').value = collected;
  document.getElementById('group-modal').showModal();
}

document.getElementById('reserve-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('reserve-name').value;
  const res = await fetch(`${API}/gifts/${currentGiftId}/reserve`, {
    method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (res.ok) { alert(`✅ ${name}, вы забронировали подарок! Спасибо! 🎀`); document.getElementById('reserve-modal').close(); loadGifts(); }
  else alert('⚠️ ' + (data.error || 'Ошибка бронирования'));
};

document.getElementById('group-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('group-name').value;
  const amount = parseFloat(document.getElementById('group-amount').value);
  const res = await fetch(`${API}/gifts/${currentGiftId}/contribute`, {
    method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name, amount })
  });
  const data = await res.json();
  if (res.ok) { alert(`✅ Спасибо, ${name}! Ваш вклад ${formatPrice(amount)} ₽ принят! 🎁`); document.getElementById('group-modal').close(); loadGifts(); }
  else alert('⚠️ ' + (data.error || 'Ошибка'));
};

document.getElementById('toggle-admin').onclick = () => {
  const panel = document.getElementById('admin-panel');
  panel.hidden = !panel.hidden;
  if (!panel.hidden && !isAdmin) {
    const key = prompt('Введите ключ администратора:');
    if (key) isAdmin = true; else panel.hidden = true;
  }
};

document.getElementById('add-gift-form').onsubmit = async (e) => {
  e.preventDefault();
  const gift = {
    admin_key: document.getElementById('admin-key').value,
    title: document.getElementById('gift-title').value,
    description: document.getElementById('gift-desc').value,
    link: document.getElementById('gift-link').value,
    image_url: document.getElementById('gift-image').value,
    price: document.getElementById('gift-price').value || null,
    is_group_gift: document.getElementById('gift-group').checked,
    target_amount: document.getElementById('gift-target').value || null
  };
  const res = await fetch(`${API}/gifts`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(gift) });
  const data = await res.json();
  if (res.ok) { alert('✅ Подарок добавлен!'); e.target.reset(); loadGifts(); }
  else alert('⚠️ ' + (data.error || 'Ошибка добавления'));
};

document.getElementById('close-reserve').onclick = () => document.getElementById('reserve-modal').close();
document.getElementById('close-group').onclick = () => document.getElementById('group-modal').close();

function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function formatPrice(num) { return new Intl.NumberFormat('ru-RU').format(num); }

document.addEventListener('DOMContentLoaded', () => { loadGifts(); setInterval(loadGifts, 30000); });
