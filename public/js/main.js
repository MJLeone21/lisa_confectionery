/* =========================================================
   Lisa Confectionery — frontend behaviour
   No cart here — bookings go through the /book form and are
   saved server-side. This file only handles page interactivity.
   ========================================================= */

/* ---------- Mobile nav ---------- */
(function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    })
  );
})();

/* ---------- Menu filter buttons ---------- */
(function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      products.forEach((p) => {
        p.style.display = cat === 'all' || p.dataset.category === cat ? '' : 'none';
      });
    });
  });
})();

/* ---------- Offers countdown (reads the real expiry date from the DB) ---------- */
(function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el || !el.dataset.expires) return;
  const target = new Date(el.dataset.expires);

  function tick() {
    const now = new Date();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    const set = (id, val) => { const n = document.getElementById(id); if (n) n.textContent = String(val).padStart(2, '0'); };
    set('cd-d', d); set('cd-h', h); set('cd-m', m); set('cd-s', s);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Dashboard tab switching ---------- */
(function initDashTabs() {
  const tabs = document.querySelectorAll('.dash-tab');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.dash-panel').forEach((p) => (p.style.display = 'none'));
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.style.display = '';
    });
  });
})();

/* ---------- Admin dashboard: AJAX actions against the JSON API ---------- */
(function initAdminActions() {
  // Order status changes
  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async () => {
      const id = select.dataset.orderId;
      const status = select.value;
      select.disabled = true;
      try {
        const res = await fetch(`/api/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Update failed');
      } catch (err) {
        alert('Could not update order status. Please try again.');
      } finally {
        select.disabled = false;
      }
    });
  });

  // Delete an order
  document.querySelectorAll('[data-delete-order]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteOrder;
      if (!confirm('Delete this order? This cannot be undone.')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!res.ok && res.status !== 204) throw new Error('Delete failed');
        const row = document.querySelector(`[data-order-row="${id}"]`);
        if (row) row.remove();
      } catch (err) {
        alert('Could not delete this order. Please try again.');
        btn.disabled = false;
      }
    });
  });

  // Delete a stock item
  document.querySelectorAll('[data-delete-stock]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteStock;
      if (!confirm('Delete this stock entry?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/stock/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!res.ok && res.status !== 204) throw new Error('Delete failed');
        const row = document.querySelector(`[data-stock-row="${id}"]`);
        if (row) row.remove();
      } catch (err) {
        alert('Could not delete this stock item. Please try again.');
        btn.disabled = false;
      }
    });
  });

  // Delete a product
  document.querySelectorAll('[data-delete-product]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteProduct;
      if (!confirm('Remove this product from the menu?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!res.ok && res.status !== 204) throw new Error('Delete failed');
        const row = document.querySelector(`[data-product-row="${id}"]`);
        if (row) row.remove();
      } catch (err) {
        alert('Could not delete this product. Please try again.');
        btn.disabled = false;
      }
    });
  });

  // Approve a pending testimonial
  document.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.approve;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/testimonials/${id}/approve`, {
          method: 'PATCH',
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('Approve failed');
        const row = document.querySelector(`[data-testimonial-row="${id}"]`);
        if (row) row.remove();
      } catch (err) {
        alert('Could not approve this review. Please try again.');
        btn.disabled = false;
      }
    });
  });

  // Delete a testimonial
  document.querySelectorAll('[data-delete-testimonial]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteTestimonial;
      if (!confirm('Delete this review?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!res.ok && res.status !== 204) throw new Error('Delete failed');
        document.querySelectorAll(`[data-testimonial-row="${id}"]`).forEach((row) => row.remove());
      } catch (err) {
        alert('Could not delete this review. Please try again.');
        btn.disabled = false;
      }
    });
  });

  // Mark all notifications as read
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      markAllReadBtn.disabled = true;
      try {
        const res = await fetch('/api/notifications/mark-all-read', { method: 'PATCH', credentials: 'same-origin' });
        if (!res.ok) throw new Error('Failed');
        document.querySelectorAll('[data-notification-row] td:last-child').forEach((cell) => { cell.textContent = 'Read'; });
        const bellCount = document.querySelector('.nav-bell-count');
        if (bellCount) bellCount.remove();
      } catch (err) {
        alert('Could not mark notifications as read.');
      } finally {
        markAllReadBtn.disabled = false;
      }
    });
  }

  // Delete an offer
  document.querySelectorAll('[data-delete-offer]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteOffer;
      if (!confirm('Delete this offer?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/offers/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!res.ok && res.status !== 204) throw new Error('Delete failed');
        const row = document.querySelector(`[data-offer-row="${id}"]`);
        if (row) row.remove();
      } catch (err) {
        alert('Could not delete this offer. Please try again.');
        btn.disabled = false;
      }
    });
  });
})();
