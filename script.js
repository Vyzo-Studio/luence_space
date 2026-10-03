const siteHeader = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const navLinks = document.querySelectorAll('[data-nav-section]');
const sections = document.querySelectorAll('[data-section]');
const revealElements = document.querySelectorAll('.reveal');

const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const portfolioCount = document.getElementById('portfolio-count');
const portfolioLightbox = document.getElementById('portfolio-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

const bookingForm = document.getElementById('booking-form');
const bookingName = document.getElementById('booking-name');
const bookingPhone = document.getElementById('booking-phone');
const bookingService = document.getElementById('booking-service');
const bookingDays = document.getElementById('booking-days');
const bookingTimes = document.getElementById('booking-times');
const bookingMessage = document.getElementById('booking-form-message');
const bookingSubmit = document.getElementById('booking-submit');
const bookingServiceMeta = document.getElementById('booking-service-meta');
const summaryService = document.getElementById('summary-service');
const summaryPrice = document.getElementById('summary-price');
const summaryDate = document.getElementById('summary-date');
const summaryTime = document.getElementById('summary-time');
const serviceCards = document.querySelectorAll('.service-card');

let activeLightboxIndex = 0;

function getBrazilDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

function addDaysToBrazilDate(dateValue, days) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const formattedYear = parts.find(part => part.type === 'year')?.value;
  const formattedMonth = parts.find(part => part.type === 'month')?.value;
  const formattedDay = parts.find(part => part.type === 'day')?.value;

  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}

function getSelectedDateWeekday(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long'
  }).format(date).toLowerCase();
}

function formatBrazilDate(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function openMenu() {
  menuToggle?.classList.add('is-active');
  mainNav?.classList.add('is-open');
  document.body.classList.add('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'true');
  menuToggle?.setAttribute('aria-label', 'Fechar menu');
}

function closeMenu() {
  menuToggle?.classList.remove('is-active');
  mainNav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menu');
}

function toggleMenu() {
  if (mainNav?.classList.contains('is-open')) {
    closeMenu();
    return;
  }

  openMenu();
}

menuToggle?.addEventListener('click', toggleMenu);

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', event => {
  if (
    !document.body.classList.contains('menu-open') ||
    mainNav?.contains(event.target) ||
    menuToggle?.contains(event.target)
  ) {
    return;
  }

  closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    closeMenu();
  }
});

function updateHeaderState() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 18);
}

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach(link => {
        const isCurrent = link.dataset.navSection === entry.target.id;
        link.classList.toggle('is-active', isCurrent);

        if (isCurrent) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, {
    rootMargin: '-30% 0px -58% 0px',
    threshold: 0
  });

  sections.forEach(section => sectionObserver.observe(section));
}

revealElements.forEach(element => {
  const delay = Number(element.dataset.revealDelay || 0);
  element.style.setProperty('--reveal-delay', `${delay}ms`);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -45px 0px'
  });

  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('is-visible'));
}

function getVisiblePortfolioItems() {
  return [...portfolioItems].filter(item => !item.classList.contains('is-hidden'));
}

function updatePortfolioCount() {
  if (!portfolioCount) {
    return;
  }

  const total = getVisiblePortfolioItems().length;
  portfolioCount.textContent = String(total).padStart(2, '0');
}

portfolioFilters.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    portfolioFilters.forEach(item => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    portfolioItems.forEach(item => {
      const categories = item.dataset.category?.split(' ').filter(Boolean) ?? [];
      const shouldShow = filter === 'todos' || categories.includes(filter);
      item.classList.toggle('is-hidden', !shouldShow);
    });

    updatePortfolioCount();
  });
});

function renderLightbox(index) {
  const visibleItems = getVisiblePortfolioItems();

  if (!visibleItems.length || !lightboxImage || !lightboxTitle || !lightboxCounter) {
    return;
  }

  activeLightboxIndex = (index + visibleItems.length) % visibleItems.length;
  const item = visibleItems[activeLightboxIndex];
  const image = item.querySelector('img');
  const title = item.querySelector('.portfolio-meta strong')?.textContent?.trim() || '';

  if (!image) {
    return;
  }

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || '';
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = `${String(activeLightboxIndex + 1).padStart(2, '0')} / ${String(visibleItems.length).padStart(2, '0')}`;
}

function openLightbox(item) {
  if (!portfolioLightbox) {
    return;
  }

  const visibleItems = getVisiblePortfolioItems();
  const index = visibleItems.indexOf(item);

  if (index < 0) {
    return;
  }

  renderLightbox(index);
  portfolioLightbox.hidden = false;
  portfolioLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!portfolioLightbox || !lightboxImage) {
    return;
  }

  portfolioLightbox.hidden = true;
  portfolioLightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.classList.remove('lightbox-open');
}

portfolioItems.forEach(item => {
  item.querySelector('.portfolio-card')?.addEventListener('click', () => openLightbox(item));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => renderLightbox(activeLightboxIndex - 1));
lightboxNext?.addEventListener('click', () => renderLightbox(activeLightboxIndex + 1));

portfolioLightbox?.addEventListener('click', event => {
  if (event.target === portfolioLightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu();

    if (portfolioLightbox && !portfolioLightbox.hidden) {
      closeLightbox();
    }
  }

  if (!portfolioLightbox || portfolioLightbox.hidden) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    renderLightbox(activeLightboxIndex - 1);
  }

  if (event.key === 'ArrowRight') {
    renderLightbox(activeLightboxIndex + 1);
  }
});

let bookingServices = [];
let selectedBookingService = null;
let selectedBookingDate = '';
let selectedBookingTime = '';
let unavailableSlots = new Set();
let bookingRequestInProgress = false;
let pendingServiceName = '';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatPhoneInput(value) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidBookingName(value) {
  const name = String(value || '').trim();
  return name.length >= 2 && name.length <= 80;
}

function isValidBookingPhone(value) {
  const phone = digitsOnly(value);
  return phone.length >= 10 && phone.length <= 13;
}

function formatCurrencyFromCents(cents) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format((Number(cents) || 0) / 100);
}

function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours && mins) {
    return `${hours}h${String(mins).padStart(2, '0')}`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${mins}min`;
}

function getBusinessNowParts() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: window.LUENCE_CONFIG?.timezone || 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(new Date());
  const get = type => parts.find(part => part.type === type)?.value || '';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute'))
  };
}

function dateKeyToUtcDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function addDaysToKey(dateKey, amount) {
  const date = dateKeyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function isOpenScheduleDay(dateKey) {
  const anchor = dateKeyToUtcDate(window.LUENCE_CONFIG?.scheduleAnchor || '2026-10-03');
  const date = dateKeyToUtcDate(dateKey);
  const diff = Math.round((date.getTime() - anchor.getTime()) / 86400000);

  return Math.abs(diff % 2) === 0;
}

function getDayLabel(dateKey) {
  const date = dateKeyToUtcDate(dateKey);

  return {
    weekday: new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      timeZone: 'UTC'
    }).format(date).replace('.', ''),

    day: String(date.getUTCDate()).padStart(2, '0'),

    month: new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      timeZone: 'UTC'
    }).format(date).replace('.', '')
  };
}

function generateServiceSlots(service) {
  if (!service) {
    return [];
  }

  const start = 8 * 60;
  const end = 18 * 60 - Number(service.duration_minutes || 0);
  const slots = [];

  for (let minutes = start; minutes <= end; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push({
      value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      minutes
    });
  }

  return slots;
}

async function luenceRpc(functionName, payload = {}) {
  const config = window.LUENCE_CONFIG;

  if (!config?.supabaseUrl || !config?.publishableKey) {
    throw new Error('A conexão do agendamento não está configurada.');
  }

  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      data.message
        ? data.message
        : 'Não foi possível concluir a operação.';

    throw new Error(message);
  }

  return data;
}

function showBookingMessage(text, type = 'success') {
  if (!bookingMessage) {
    return;
  }

  bookingMessage.textContent = text;
  bookingMessage.hidden = false;
  bookingMessage.classList.toggle('is-error', type === 'error');
  bookingMessage.classList.toggle('is-success', type === 'success');
}

function clearBookingMessage() {
  if (!bookingMessage) {
    return;
  }

  bookingMessage.hidden = true;
  bookingMessage.textContent = '';
  bookingMessage.classList.remove('is-error', 'is-success');
}

function updateBookingSummary() {
  if (summaryService) {
    summaryService.textContent =
      selectedBookingService?.name ||
      'Não selecionado';
  }

  if (summaryPrice) {
    summaryPrice.textContent =
      selectedBookingService
        ? formatCurrencyFromCents(selectedBookingService.price_cents)
        : '—';
  }

  if (summaryDate) {
    summaryDate.textContent =
      selectedBookingDate
        ? formatBrazilDate(selectedBookingDate)
        : 'Não selecionado';
  }

  if (summaryTime) {
    summaryTime.textContent =
      selectedBookingTime ||
      'Não selecionado';
  }
}

function updateBookingServiceMeta() {
  if (!bookingServiceMeta) {
    return;
  }

  if (!selectedBookingService) {
    bookingServiceMeta.hidden = true;
    bookingServiceMeta.innerHTML = '';
    return;
  }

  const promotion =
    selectedBookingService.promotional
      ? `<span>${selectedBookingService.promotional_label || 'VALOR PROMOCIONAL'}</span>`
      : '';

  bookingServiceMeta.innerHTML = `
    <strong>${formatCurrencyFromCents(selectedBookingService.price_cents)}</strong>
    ${promotion}
    <small>Tempo reservado na agenda: ${formatDuration(selectedBookingService.duration_minutes)}.</small>
  `;

  bookingServiceMeta.hidden = false;
}

function updateBookingSubmitState() {
  if (!bookingSubmit) {
    return;
  }

  bookingSubmit.disabled =
    bookingRequestInProgress ||
    !selectedBookingService ||
    !selectedBookingDate ||
    !selectedBookingTime ||
    !isValidBookingName(bookingName?.value) ||
    !isValidBookingPhone(bookingPhone?.value);
}

function isSlotUnavailable(dateKey, time) {
  return unavailableSlots.has(`${dateKey}|${time}`);
}

function isPastSlot(dateKey, slotMinutes) {
  const now = getBusinessNowParts();

  return (
    dateKey === now.date &&
    slotMinutes <= now.minutes
  );
}

function hasAvailableSlot(dateKey) {
  return generateServiceSlots(selectedBookingService).some(slot => (
    !isSlotUnavailable(dateKey, slot.value) &&
    !isPastSlot(dateKey, slot.minutes)
  ));
}

function renderBookingDays() {
  if (!bookingDays) {
    return;
  }

  if (!selectedBookingService) {
    bookingDays.innerHTML =
      '<div class="booking-empty-state">Escolha um serviço para ver os dias disponíveis.</div>';

    return;
  }

  const today = getBusinessNowParts().date;
  const buttons = [];
  let offset = 0;

  while (buttons.length < 7 && offset <= 30) {
    const dateKey = addDaysToKey(today, offset);

    if (isOpenScheduleDay(dateKey)) {
      const label = getDayLabel(dateKey);
      const available = hasAvailableSlot(dateKey);
      const selected = selectedBookingDate === dateKey;

      buttons.push(`
        <button
          class="booking-day${selected ? ' is-selected' : ''}"
          type="button"
          data-date="${dateKey}"
          aria-pressed="${selected ? 'true' : 'false'}"
          ${available ? '' : 'disabled'}
        >
          <span class="booking-day-week">${label.weekday}</span>
          <strong class="booking-day-number">${label.day}</strong>
          <span class="booking-day-month">${label.month}</span>
        </button>
      `);
    }

    offset += 1;
  }

  bookingDays.innerHTML =
    buttons.join('') ||
    '<div class="booking-empty-state">Não há dias disponíveis neste período.</div>';

  bookingDays
    .querySelectorAll('.booking-day:not(:disabled)')
    .forEach(button => {
      button.addEventListener('click', () => {
        selectedBookingDate =
          button.dataset.date || '';

        selectedBookingTime = '';

        clearBookingMessage();
        renderBookingDays();
        renderBookingTimes();
        updateBookingSummary();
        updateBookingSubmitState();
      });
    });
}

function renderBookingTimes() {
  if (!bookingTimes) {
    return;
  }

  if (!selectedBookingService) {
    bookingTimes.innerHTML =
      '<div class="booking-empty-state">Escolha um serviço primeiro.</div>';

    return;
  }

  if (!selectedBookingDate) {
    bookingTimes.innerHTML =
      '<div class="booking-empty-state">Escolha um dia para visualizar os horários.</div>';

    return;
  }

  const slots =
    generateServiceSlots(
      selectedBookingService
    );

  bookingTimes.innerHTML =
    slots
      .map(slot => {
        const unavailable =
          isSlotUnavailable(
            selectedBookingDate,
            slot.value
          ) ||
          isPastSlot(
            selectedBookingDate,
            slot.minutes
          );

        const selected =
          selectedBookingTime ===
          slot.value;

        return `
          <button
            class="booking-time${selected ? ' is-selected' : ''}"
            type="button"
            data-time="${slot.value}"
            aria-pressed="${selected ? 'true' : 'false'}"
            ${unavailable ? 'disabled' : ''}
          >${slot.value}</button>
        `;
      })
      .join('');

  bookingTimes
    .querySelectorAll('.booking-time:not(:disabled)')
    .forEach(button => {
      button.addEventListener('click', () => {
        selectedBookingTime =
          button.dataset.time || '';

        clearBookingMessage();
        renderBookingTimes();
        updateBookingSummary();
        updateBookingSubmitState();
      });
    });
}

async function loadBookingAvailability() {
  if (!selectedBookingService) {
    unavailableSlots = new Set();
    renderBookingDays();
    renderBookingTimes();
    return;
  }

  const today =
    getBusinessNowParts().date;

  const end =
    addDaysToKey(
      today,
      30
    );

  if (bookingDays) {
    bookingDays.innerHTML =
      '<div class="booking-loading-state">Carregando disponibilidade...</div>';
  }

  if (bookingTimes) {
    bookingTimes.innerHTML =
      '<div class="booking-loading-state">Carregando horários...</div>';
  }

  try {
    const rows =
      await luenceRpc(
        'luence_get_unavailable_slots',
        {
          p_service_id:
            selectedBookingService.id,

          p_start_date:
            today,

          p_end_date:
            end
        }
      );

    unavailableSlots =
      new Set(
        Array.isArray(rows)
          ? rows.map(
              row =>
                `${row.booking_date}|${String(row.booking_time || '').slice(0, 5)}`
            )
          : []
      );

    if (
      selectedBookingDate &&
      !hasAvailableSlot(
        selectedBookingDate
      )
    ) {
      selectedBookingDate = '';
      selectedBookingTime = '';
    }

    renderBookingDays();
    renderBookingTimes();
    updateBookingSummary();
    updateBookingSubmitState();
  } catch (error) {
    console.error(error);

    if (bookingDays) {
      bookingDays.innerHTML =
        '<div class="booking-empty-state">Não foi possível carregar a agenda agora.</div>';
    }

    if (bookingTimes) {
      bookingTimes.innerHTML =
        '<div class="booking-empty-state">Tente novamente em alguns instantes.</div>';
    }

    showBookingMessage(
      error.message ||
        'Não foi possível carregar a disponibilidade.',
      'error'
    );
  }
}

async function loadBookingServices() {
  if (!bookingService) {
    return;
  }

  try {
    const rows =
      await luenceRpc(
        'luence_get_services'
      );

    bookingServices =
      Array.isArray(rows)
        ? rows
        : [];

    bookingService.innerHTML =
      '<option value="">Selecione um serviço</option>';

    bookingServices.forEach(service => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        service.id;

      option.textContent =
        `${service.name} — ${formatCurrencyFromCents(service.price_cents)}`;

      bookingService.appendChild(
        option
      );
    });

    if (pendingServiceName) {
      const service =
        bookingServices.find(
          item =>
            item.name ===
            pendingServiceName
        );

      if (service) {
        bookingService.value =
          service.id;

        selectedBookingService =
          service;

        updateBookingServiceMeta();
        updateBookingSummary();

        await loadBookingAvailability();
      }

      pendingServiceName = '';
    }
  } catch (error) {
    console.error(error);

    bookingService.innerHTML =
      '<option value="">Serviços indisponíveis no momento</option>';

    bookingService.disabled =
      true;

    showBookingMessage(
      'Não foi possível carregar os serviços. Tente novamente em alguns instantes.',
      'error'
    );
  }
}

async function handleBookingServiceChange() {
  selectedBookingService =
    bookingServices.find(
      service =>
        service.id ===
        bookingService?.value
    ) ||
    null;

  selectedBookingDate = '';
  selectedBookingTime = '';

  clearBookingMessage();
  updateBookingServiceMeta();
  updateBookingSummary();
  updateBookingSubmitState();

  await loadBookingAvailability();
}

serviceCards.forEach(card => {
  const button =
    card.querySelector('a');

  const serviceName =
    card.dataset.service;

  button?.addEventListener(
    'click',
    () => {
      pendingServiceName =
        serviceName || '';

      if (
        !bookingService ||
        !bookingServices.length
      ) {
        return;
      }

      const service =
        bookingServices.find(
          item =>
            item.name ===
            serviceName
        );

      if (!service) {
        return;
      }

      bookingService.value =
        service.id;

      handleBookingServiceChange();
    }
  );
});

bookingService?.addEventListener(
  'change',
  handleBookingServiceChange
);

bookingPhone?.addEventListener(
  'input',
  event => {
    event.target.value =
      formatPhoneInput(
        event.target.value
      );

    clearBookingMessage();
    updateBookingSubmitState();
  }
);

bookingName?.addEventListener(
  'input',
  () => {
    clearBookingMessage();
    updateBookingSubmitState();
  }
);

function buildBookingWhatsappMessage() {
  if (
    !selectedBookingService ||
    !selectedBookingDate ||
    !selectedBookingTime
  ) {
    return '';
  }

  const customerName =
    bookingName?.value.trim() ||
    '';

  const price =
    formatCurrencyFromCents(
      selectedBookingService.price_cents
    );

  const date =
    formatBrazilDate(
      selectedBookingDate
    );

  const professional =
    window.LUENCE_CONFIG?.professionalName ||
    'Larissa Luenda';

  return [
    'Olá, Luence Space! ✨',
    '',
    `Sou *${customerName}* e acabei de solicitar pelo site um agendamento.`,
    '',
    `*Serviço:* ${selectedBookingService.name}`,
    `*Valor:* ${price}${selectedBookingService.promotional ? ' (promocional)' : ''}`,
    `*Profissional:* ${professional}`,
    `*Data:* ${date}`,
    `*Horário:* ${selectedBookingTime}`,
    '',
    'Poderia confirmar meu horário, por favor?'
  ].join('\n');
}

function prepareWhatsappWindow() {
  const opened =
    window.open(
      'about:blank',
      '_blank'
    );

  if (opened) {
    try {
      opened.document.title =
        'Abrindo WhatsApp...';

      opened.document.body.innerHTML =
        '<div style="font-family:Arial,sans-serif;padding:40px;text-align:center;color:#171416"><strong>Aguarde...</strong><p>Estamos reservando seu horário e abrindo o WhatsApp.</p></div>';
    } catch (error) {
      console.error(error);
    }
  }

  return opened;
}

bookingForm?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    clearBookingMessage();

    const customerName =
      bookingName?.value.trim() ||
      '';

    const customerPhone =
      bookingPhone?.value ||
      '';

    if (
      bookingRequestInProgress ||
      !selectedBookingService ||
      !selectedBookingDate ||
      !selectedBookingTime ||
      !isValidBookingName(
        customerName
      ) ||
      !isValidBookingPhone(
        customerPhone
      )
    ) {
      showBookingMessage(
        'Preencha todos os dados e escolha um horário disponível.',
        'error'
      );

      updateBookingSubmitState();

      return;
    }

    const whatsappMessage =
      buildBookingWhatsappMessage();

    const whatsappWindow =
      prepareWhatsappWindow();

    bookingRequestInProgress =
      true;

    updateBookingSubmitState();

    const originalText =
      bookingSubmit
        ?.querySelector('span')
        ?.textContent ||
      'SOLICITAR PELO WHATSAPP';

    const submitLabel =
      bookingSubmit?.querySelector(
        'span'
      );

    if (submitLabel) {
      submitLabel.textContent =
        'RESERVANDO HORÁRIO...';
    }

    try {
      await luenceRpc(
        'luence_create_booking_request',
        {
          p_customer_name:
            customerName,

          p_customer_phone:
            digitsOnly(
              customerPhone
            ),

          p_service_id:
            selectedBookingService.id,

          p_booking_date:
            selectedBookingDate,

          p_booking_time:
            selectedBookingTime
        }
      );

      const number =
        window.LUENCE_CONFIG?.whatsappNumber ||
        '';

      const whatsappUrl =
        `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href =
          whatsappUrl;
      } else {
        window.open(
          whatsappUrl,
          '_blank',
          'noopener,noreferrer'
        );
      }

      showBookingMessage(
        'Horário reservado por até 5 minutos. Envie a mensagem no WhatsApp para solicitar a confirmação.',
        'success'
      );

      selectedBookingTime = '';

      await loadBookingAvailability();
    } catch (error) {
      if (
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.close();
      }

      selectedBookingTime = '';

      await loadBookingAvailability();

      showBookingMessage(
        error.message ||
          'Não foi possível reservar esse horário. Escolha outro e tente novamente.',
        'error'
      );
    } finally {
      bookingRequestInProgress =
        false;

      if (submitLabel) {
        submitLabel.textContent =
          originalText;
      }

      updateBookingSubmitState();
    }
  }
);

async function setupLuenceBooking() {
  if (
    !bookingForm ||
    !bookingService ||
    !bookingDays ||
    !bookingTimes
  ) {
    return;
  }

  updateBookingSummary();
  updateBookingSubmitState();

  await loadBookingServices();
}

setupLuenceBooking();
updatePortfolioCount();
