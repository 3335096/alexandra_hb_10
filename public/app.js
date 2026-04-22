const API = '/api';
const ADMIN_STORAGE = 'wishlist_admin_key';

let currentGiftId = null;
let giftsById = {};

function getAdminKey() {
  return sessionStorage.getItem(ADMIN_STORAGE) || '';
}

function setAdminKey(k) {
  if (k) sessionStorage.setItem(ADMIN_STORAGE, k);
  else sessionStorage.removeItem(ADMIN_STORAGE);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

function formatPrice(num) {
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatContributorsAdmin(contributors) {
  if (!contributors || !contributors.length) {
    return '<p class="admin-muted">Пока никто не вносил вклад.</p>';
  }
  return (
    '<ul class="admin-contrib-list">' +
    contributors
      .map(
        (c) =>
          `<li><span class="contrib-name">${escapeHtml(c.name)}</span> — <strong>${formatPrice(c.amount)} ₽</strong></li>`
      )
      .join('') +
    '</ul>'
  );
}

function renderGiftCard(gift, showAdminDetail) {
  const isGroup = gift.is_group_gift;
  const progress =
    gift.target_amount && gift.target_amount > 0
      ? Math.min(100, Math.round((gift.collected_amount / gift.target_amount) * 100))
      : 0;
  const peopleCount = gift.contributor_count ?? gift.contributors?.length ?? 0;

  const reservedLine =
    gift.status === 'reserved' && !showAdminDetail
      ? `<p class="status-badge status-reserved">Забронировано</p>`
      : '';

  const adminBlock = showAdminDetail
    ? `
    <div class="gift-admin" data-gift-id="${gift.id}">
      <p class="gift-admin-heading">Только для администратора</p>
      ${gift.status === 'reserved' ? `<p class="admin-lead"><strong>Кто забронировал:</strong> ${gift.reserved_by_name ? escapeHtml(gift.reserved_by_name) : '—'}</p>` : ''}
      <label class="admin-field admin-checkbox-row">
        <span class="admin-checkbox-inner">
          <input type="checkbox" data-field="group" ${gift.is_group_gift ? 'checked' : ''} />
          Подарок в складчину
        </span>
      </label>
      <label class="admin-field">Ссылка на товар
        <input type="url" data-field="link" value="${gift.link ? escapeHtml(gift.link) : ''}" placeholder="https://..." autocomplete="off" />
      </label>
      ${
        isGroup
          ? `<div class="admin-contrib-wrap">
          <p class="gift-admin-sub">Участники складчины</p>
          ${formatContributorsAdmin(gift.contributors)}
        </div>`
          : ''
      }
      <label class="admin-field">Цена на сайте (₽)
        <input type="number" step="0.01" data-field="price" value="${gift.price != null && gift.price !== '' ? escapeHtml(String(gift.price)) : ''}" placeholder="Не указано" />
      </label>
      ${
        isGroup
          ? `<label class="admin-field">Цель складчины (₽)
        <input type="number" step="0.01" data-field="target" value="${gift.target_amount != null && gift.target_amount !== '' ? escapeHtml(String(gift.target_amount)) : ''}" placeholder="Не указано" />
      </label>`
          : ''
      }
      <label class="admin-field">${isGroup ? 'Заметка / ответка по складчине' : 'Заметка (видите только вы)'}
        <textarea data-field="note" rows="2" placeholder="Напоминание себе…">${gift.admin_note ? escapeHtml(gift.admin_note) : ''}</textarea>
      </label>
      <button type="button" class="btn btn-primary btn-admin-save" data-save-id="${gift.id}">Сохранить изменения</button>
      <button type="button" class="btn btn-danger btn-admin-delete" data-delete-id="${gift.id}">Удалить подарок</button>
    </div>
  `
    : '';

  return `
    <article class="gift-card" data-id="${gift.id}">
      ${gift.image_url ? `<img src="${escapeHtml(gift.image_url)}" alt="" class="gift-image" onerror="this.style.display='none'">` : ''}
      <h3 class="gift-title">${escapeHtml(gift.title)}</h3>
      ${isGroup ? '<span class="group-badge">👥 Можно в складчину</span>' : ''}
      <p class="gift-desc">${escapeHtml(gift.description || '')}</p>
      ${gift.price ? `<p class="gift-price">${formatPrice(gift.price)} ₽</p>` : ''}
      ${isGroup && gift.target_amount ? `
        <div class="group-info">
          <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
          <small>Собрано: ${formatPrice(gift.collected_amount || 0)} / ${formatPrice(gift.target_amount)} ₽</small>
          ${peopleCount ? `<br><small>Участников: ${peopleCount}</small>` : ''}
        </div>` : ''}
      ${reservedLine}
      ${gift.status === 'purchased' ? `<p class="status-badge status-purchased">✅ Подарено!</p>` : ''}
      <div class="gift-actions">
        <a href="${escapeHtml(gift.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">🔗 Посмотреть</a>
        ${gift.status === 'available' ? `
          ${isGroup
            ? `<button type="button" class="btn btn-primary btn-open-group" data-gid="${gift.id}">👥 В складчину</button>`
            : `<button type="button" class="btn btn-primary btn-open-reserve" data-gid="${gift.id}">🔒 Забронировать</button>`}
        ` : ''}
      </div>
      ${adminBlock}
    </article>`;
}

async function loadGifts() {
  const container = document.getElementById('gifts-container');
  const adminKey = getAdminKey();
  const headers = {};
  if (adminKey) headers['X-Admin-Key'] = adminKey;

  try {
    const res = await fetch(`${API}/gifts`, { headers });
    const gifts = await res.json();
    if (gifts.length === 0) {
      container.innerHTML =
        '<p class="loading">Список подарков пока пуст. Родители добавят их скоро! 🎀</p>';
      giftsById = {};
      return;
    }

    giftsById = Object.fromEntries(gifts.map((g) => [g.id, g]));
    const showAdminDetail = !!adminKey;

    container.innerHTML = gifts.map((g) => renderGiftCard(g, showAdminDetail)).join('');
  } catch (err) {
    container.innerHTML =
      '<p class="loading">❌ Не удалось загрузить подарки. Попробуйте позже.</p>';
  }
}

async function saveGiftAdmin(id) {
  const card = document.querySelector(`.gift-admin[data-gift-id="${id}"]`);
  if (!card) return;

  const body = { admin_key: getAdminKey() };
  const grp = card.querySelector('[data-field="group"]');
  const linkInp = card.querySelector('[data-field="link"]');
  const p = card.querySelector('[data-field="price"]');
  const t = card.querySelector('[data-field="target"]');
  const n = card.querySelector('[data-field="note"]');

  if (grp) body.is_group_gift = grp.checked;
  if (linkInp) body.link = linkInp.value.trim();
  if (p) body.price = p.value === '' ? null : Number(p.value);
  if (t) body.target_amount = t.value === '' ? null : Number(t.value);
  if (n) body.admin_note = n.value.trim() === '' ? null : n.value;

  try {
    const res = await fetch(`${API}/gifts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      alert('✅ Сохранено');
      loadGifts();
    } else {
      alert('⚠️ ' + (data.error || 'Ошибка сохранения'));
    }
  } catch {
    alert('⚠️ Не удалось сохранить');
  }
}

async function deleteGiftAdmin(id) {
  const gift = giftsById[id];
  const title = gift?.title ? `«${gift.title}»` : `#${id}`;
  const ok = confirm(`Удалить подарок ${title}? Это действие нельзя отменить.`);
  if (!ok) return;

  try {
    const res = await fetch(`${API}/gifts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_key: getAdminKey() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert('✅ Удалено');
      loadGifts();
    } else {
      alert('⚠️ ' + (data.error || 'Ошибка удаления'));
    }
  } catch {
    alert('⚠️ Не удалось удалить');
  }
}

function openReserveModal(id) {
  currentGiftId = id;
  const g = giftsById[id];
  document.getElementById('modal-gift-title').textContent = g ? g.title : '';
  document.getElementById('reserve-modal').showModal();
}

function openGroupModal(id) {
  currentGiftId = id;
  const g = giftsById[id];
  if (!g) return;
  document.getElementById('group-gift-title').textContent = g.title;
  document.getElementById('target').textContent = formatPrice(g.target_amount || 0);
  document.getElementById('collected').textContent = formatPrice(g.collected_amount || 0);
  document.getElementById('group-progress').max = Number(g.target_amount) || 100;
  document.getElementById('group-progress').value = Number(g.collected_amount) || 0;
  document.getElementById('group-modal').showModal();
}

document.getElementById('gifts-container').addEventListener('click', (e) => {
  const saveBtn = e.target.closest('.btn-admin-save');
  if (saveBtn) {
    saveGiftAdmin(Number(saveBtn.dataset.saveId));
    return;
  }
  const delBtn = e.target.closest('.btn-admin-delete');
  if (delBtn) {
    deleteGiftAdmin(Number(delBtn.dataset.deleteId));
    return;
  }
  const r = e.target.closest('.btn-open-reserve');
  if (r) {
    if (typeof burstConfetti === 'function') burstConfetti(e.clientX, e.clientY);
    openReserveModal(Number(r.dataset.gid));
    return;
  }
  const g = e.target.closest('.btn-open-group');
  if (g) {
    if (typeof burstConfetti === 'function') burstConfetti(e.clientX, e.clientY);
    openGroupModal(Number(g.dataset.gid));
    return;
  }
});

document.getElementById('reserve-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('reserve-name').value;
  const res = await fetch(`${API}/gifts/${currentGiftId}/reserve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (res.ok) {
    alert(`✅ ${name}, вы забронировали подарок! Спасибо! 🎀`);
    document.getElementById('reserve-modal').close();
    loadGifts();
  } else alert('⚠️ ' + (data.error || 'Ошибка бронирования'));
};

document.getElementById('group-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('group-name').value;
  const amount = parseFloat(document.getElementById('group-amount').value);
  const res = await fetch(`${API}/gifts/${currentGiftId}/contribute`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, amount }),
  });
  const data = await res.json();
  if (res.ok) {
    alert(`✅ Спасибо, ${name}! Ваш вклад ${formatPrice(amount)} ₽ принят! 🎁`);
    document.getElementById('group-modal').close();
    loadGifts();
  } else alert('⚠️ ' + (data.error || 'Ошибка'));
};

document.getElementById('toggle-admin').onclick = () => {
  const panel = document.getElementById('admin-panel');
  const wasHidden = panel.hidden;
  panel.hidden = !panel.hidden;
  if (!panel.hidden && wasHidden) {
    let k = getAdminKey();
    if (!k) {
      k = prompt('Введите ключ администратора:');
      if (k) setAdminKey(k);
      else {
        panel.hidden = true;
        return;
      }
    }
    const inp = document.getElementById('admin-key');
    if (inp) inp.value = getAdminKey();
  }
  loadGifts();
};

document.getElementById('add-gift-form').onsubmit = async (e) => {
  e.preventDefault();
  const keyVal = document.getElementById('admin-key').value;
  setAdminKey(keyVal);

  const gift = {
    admin_key: keyVal,
    title: document.getElementById('gift-title').value,
    description: document.getElementById('gift-desc').value,
    link: document.getElementById('gift-link').value,
    image_url: document.getElementById('gift-image').value,
    price: document.getElementById('gift-price').value || null,
    is_group_gift: document.getElementById('gift-group').checked,
    target_amount: document.getElementById('gift-target').value || null,
  };
  const res = await fetch(`${API}/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gift),
  });
  const data = await res.json();
  if (res.ok) {
    alert('✅ Подарок добавлен!');
    e.target.reset();
    document.getElementById('admin-key').value = getAdminKey();
    loadGifts();
  } else alert('⚠️ ' + (data.error || 'Ошибка добавления'));
};

document.getElementById('close-reserve').onclick = () =>
  document.getElementById('reserve-modal').close();
document.getElementById('close-group').onclick = () =>
  document.getElementById('group-modal').close();

document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('admin-key');
  if (inp && getAdminKey()) inp.value = getAdminKey();
  loadGifts();
  setInterval(loadGifts, 30000);
});
