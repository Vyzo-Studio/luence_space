const client = window.luenceSupabase;
const config = window.LUENCE_CONFIG;

const loginSection = document.getElementById('admin-login');
const dashboardSection = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('admin-login-form');
const loginEmail = document.getElementById('admin-email');
const loginPassword = document.getElementById('admin-password');
const loginButton = document.getElementById('login-button');
const loginMessage = document.getElementById('login-message');
const passwordToggle = document.getElementById('password-toggle');
const logoutButton = document.getElementById('admin-logout-button');
const adminUserEmail = document.getElementById('admin-user-email');
const refreshButton = document.getElementById('admin-refresh-button');

const statPending = document.getElementById('stat-pending');
const statConfirmed = document.getElementById('stat-confirmed');
const statCompleted = document.getElementById('stat-completed');
const statReceived = document.getElementById('stat-received');

const panelButtons = Array.from(
  document.querySelectorAll('[data-panel]')
);

const panelSections = Array.from(
  document.querySelectorAll('[data-panel-section]')
);

const bookingTabButtons = Array.from(
  document.querySelectorAll('[data-booking-view]')
);

const adminDateFilter = document.getElementById('admin-date-filter');
const adminSearch = document.getElementById('admin-search');
const clearSearchButton = document.getElementById('clear-search');
const adminGlobalMessage = document.getElementById('admin-global-message');
const adminLoading = document.getElementById('admin-loading');
const adminEmpty = document.getElementById('admin-empty');
const bookingsList = document.getElementById('bookings-list');
const listKicker = document.getElementById('list-kicker');
const lastUpdate = document.getElementById('last-update');
const countPending = document.getElementById('count-pending');
const countScheduled = document.getElementById('count-scheduled');
const countCompleted = document.getElementById('count-completed');
const countHistory = document.getElementById('count-history');

const manualForm = document.getElementById('manual-booking-form');
const manualName = document.getElementById('manual-name');
const manualPhone = document.getElementById('manual-phone');
const manualService = document.getElementById('manual-service');
const manualDate = document.getElementById('manual-date');
const manualTime = document.getElementById('manual-time');
const manualMessage = document.getElementById('manual-message');

const blockForm = document.getElementById('block-form');
const blockDate = document.getElementById('block-date');
const blockStart = document.getElementById('block-start');
const blockEnd = document.getElementById('block-end');
const blockReason = document.getElementById('block-reason');
const blockMessage = document.getElementById('block-message');
const blockedDateFilter = document.getElementById('blocked-date-filter');
const blockedList = document.getElementById('blocked-list');
const adminToast = document.getElementById('admin-toast');

let services = [];
let bookings = [];
let currentBookingView = 'pending';
let knownPendingIds = new Set();
let notificationInitialized = false;
let pollTimer = null;

function setMessage(
  element,
  text = '',
  type = ''
) {
  if (!element) {
    return;
  }

  element.textContent =
    text;

  element.hidden =
    !text;

  element.classList.toggle(
    'is-error',
    type === 'error'
  );

  element.classList.toggle(
    'is-success',
    type === 'success'
  );
}

function setButtonLoading(
  button,
  loading,
  loadingText = 'AGUARDE...'
) {
  if (!button) {
    return;
  }

  if (!button.dataset.originalText) {
    button.dataset.originalText =
      button.textContent;
  }

  button.disabled =
    loading;

  button.textContent =
    loading
      ? loadingText
      : button.dataset.originalText;
}

function digitsOnly(value) {
  return String(
    value || ''
  ).replace(
    /\D/g,
    ''
  );
}

function formatPhoneInput(value) {
  const digits =
    digitsOnly(
      value
    ).slice(
      0,
      11
    );

  if (
    digits.length <= 2
  ) {
    return digits;
  }

  if (
    digits.length <= 6
  ) {
    return (
      `(${digits.slice(0, 2)}) ` +
      digits.slice(2)
    );
  }

  if (
    digits.length <= 10
  ) {
    return (
      `(${digits.slice(0, 2)}) ` +
      `${digits.slice(2, 6)}-` +
      digits.slice(6)
    );
  }

  return (
    `(${digits.slice(0, 2)}) ` +
    `${digits.slice(2, 7)}-` +
    digits.slice(7)
  );
}

function formatCurrency(cents) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  ).format(
    (Number(cents) || 0) / 100
  );
}

function getBrazilDateValue(
  date = new Date()
) {
  const formatter =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          config?.timezone ||
          'America/Sao_Paulo',

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit'
      }
    );

  const parts =
    formatter.formatToParts(
      date
    );

  const get =
    type =>
      parts.find(
        part =>
          part.type === type
      )?.value || '';

  return (
    `${get('year')}-` +
    `${get('month')}-` +
    get('day')
  );
}

function dateKeyToUtcDate(
  dateKey
) {
  const [
    year,
    month,
    day
  ] =
    String(
      dateKey
    )
      .split('-')
      .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12
    )
  );
}

function formatDate(dateKey) {
  if (!dateKey) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day:
        '2-digit',

      month:
        '2-digit',

      year:
        'numeric',

      timeZone:
        'UTC'
    }
  ).format(
    dateKeyToUtcDate(
      dateKey
    )
  );
}

function normalizeTime(value) {
  return String(
    value || ''
  ).slice(
    0,
    5
  );
}

function formatTimestamp(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone:
        config?.timezone ||
        'America/Sao_Paulo',

      day:
        '2-digit',

      month:
        '2-digit',

      hour:
        '2-digit',

      minute:
        '2-digit'
    }
  ).format(
    new Date(value)
  );
}

function escapeHtml(value) {
  return String(
    value || ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );
}

async function rpc(
  name,
  payload = {}
) {
  if (!client) {
    throw new Error(
      'Não foi possível iniciar a conexão com o Supabase.'
    );
  }

  const {
    data,
    error
  } =
    await client.rpc(
      name,
      payload
    );

  if (error) {
    throw new Error(
      error.message ||
      'Não foi possível concluir a operação.'
    );
  }

  return data;
}

function statusLabel(status) {
  const labels = {
    pending:
      'Pendente',

    confirmed:
      'Confirmado',

    completed:
      'Finalizado',

    rejected:
      'Recusado',

    cancelled:
      'Cancelado',

    expired:
      'Expirado'
  };

  return (
    labels[status] ||
    status
  );
}

function paymentLabel(method) {
  const labels = {
    cash:
      'Dinheiro',

    pix:
      'Pix',

    debit:
      'Débito',

    credit:
      'Crédito'
  };

  return (
    labels[method] ||
    method ||
    '—'
  );
}

function showToast(text) {
  if (!adminToast) {
    return;
  }

  adminToast.textContent =
    text;

  adminToast.hidden =
    false;

  window.clearTimeout(
    showToast.timer
  );

  showToast.timer =
    window.setTimeout(
      () => {
        adminToast.hidden =
          true;
      },
      6500
    );
}

function playNotificationTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const ctx =
      new AudioContextClass();

    const osc =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    osc.frequency.value =
      740;

    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.08,
      ctx.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + 0.28
    );

    osc.connect(
      gain
    );

    gain.connect(
      ctx.destination
    );

    osc.start();

    osc.stop(
      ctx.currentTime + 0.3
    );
  } catch (error) {
    console.error(
      error
    );
  }
}

function switchPanel(name) {
  panelButtons.forEach(
    button => {
      button.classList.toggle(
        'is-active',
        button.dataset.panel ===
          name
      );
    }
  );

  panelSections.forEach(
    section => {
      const active =
        section.dataset.panelSection ===
        name;

      section.hidden =
        !active;

      section.classList.toggle(
        'is-active',
        active
      );
    }
  );
}

function setBookingView(view) {
  currentBookingView =
    view;

  bookingTabButtons.forEach(
    button => {
      button.classList.toggle(
        'is-active',
        button.dataset.bookingView ===
          view
      );
    }
  );

  const labels = {
    pending:
      'PENDENTES',

    scheduled:
      'AGENDADOS',

    completed:
      'FINALIZADOS',

    history:
      'HISTÓRICO'
  };

  if (listKicker) {
    listKicker.textContent =
      labels[view] ||
      'AGENDA';
  }

  renderBookings();
}

function bookingMatchesView(
  booking
) {
  if (
    currentBookingView ===
    'pending'
  ) {
    return (
      booking.status ===
      'pending'
    );
  }

  if (
    currentBookingView ===
    'scheduled'
  ) {
    return (
      booking.status ===
      'confirmed'
    );
  }

  if (
    currentBookingView ===
    'completed'
  ) {
    return (
      booking.status ===
      'completed'
    );
  }

  return [
    'rejected',
    'cancelled',
    'expired'
  ].includes(
    booking.status
  );
}

function bookingMatchesSearch(
  booking
) {
  const query =
    adminSearch?.value
      .trim()
      .toLowerCase() ||
    '';

  if (!query) {
    return true;
  }

  const haystack = [
    booking.customer_name,
    booking.customer_phone,
    booking.service_name,
    normalizeTime(
      booking.booking_time
    ),
    statusLabel(
      booking.status
    )
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(
    query
  );
}

function updateTabCounts() {
  const pending =
    bookings.filter(
      item =>
        item.status ===
        'pending'
    ).length;

  const scheduled =
    bookings.filter(
      item =>
        item.status ===
        'confirmed'
    ).length;

  const completed =
    bookings.filter(
      item =>
        item.status ===
        'completed'
    ).length;

  const history =
    bookings.filter(
      item =>
        [
          'rejected',
          'cancelled',
          'expired'
        ].includes(
          item.status
        )
    ).length;

  if (countPending) {
    countPending.textContent =
      pending;
  }

  if (countScheduled) {
    countScheduled.textContent =
      scheduled;
  }

  if (countCompleted) {
    countCompleted.textContent =
      completed;
  }

  if (countHistory) {
    countHistory.textContent =
      history;
  }
}

function getBookingActions(
  booking
) {
  const phone =
    digitsOnly(
      booking.customer_phone
    );

  const whatsapp =
    phone
      ? `
        <button
          class="booking-action is-whatsapp"
          type="button"
          data-action="whatsapp"
          data-id="${booking.id}"
        >
          ABRIR WHATSAPP
        </button>
      `
      : '';

  if (
    booking.status ===
    'pending'
  ) {
    return `
      <button
        class="booking-action"
        type="button"
        data-action="confirm"
        data-id="${booking.id}"
      >
        CONFIRMAR
      </button>

      <button
        class="booking-action is-danger"
        type="button"
        data-action="reject"
        data-id="${booking.id}"
      >
        RECUSAR
      </button>

      ${whatsapp}
    `;
  }

  if (
    booking.status ===
    'confirmed'
  ) {
    return `
      <select
        data-payment-method="${booking.id}"
        aria-label="Forma de pagamento"
      >
        <option value="pix">
          Pix
        </option>

        <option value="cash">
          Dinheiro
        </option>

        <option value="debit">
          Débito
        </option>

        <option value="credit">
          Crédito
        </option>
      </select>

      <button
        class="booking-action"
        type="button"
        data-action="complete"
        data-id="${booking.id}"
      >
        FINALIZAR
      </button>

      <button
        class="booking-action is-danger"
        type="button"
        data-action="cancel"
        data-id="${booking.id}"
      >
        CANCELAR
      </button>

      ${whatsapp}
    `;
  }

  return whatsapp;
}

function renderBookings() {
  if (!bookingsList) {
    return;
  }

  updateTabCounts();

  const visible =
    bookings.filter(
      booking =>
        bookingMatchesView(
          booking
        ) &&
        bookingMatchesSearch(
          booking
        )
    );

  adminEmpty.hidden =
    visible.length > 0;

  bookingsList.innerHTML =
    visible
      .map(
        booking => {
          const expires =
            booking.status ===
              'pending' &&
            booking.expires_at
              ? `<span>Reserva expira: ${escapeHtml(formatTimestamp(booking.expires_at))}</span>`
              : '';

          const payment =
            booking.status ===
            'completed'
              ? `<span>Pagamento: ${escapeHtml(paymentLabel(booking.payment_method))}</span>`
              : '';

          return `
            <article class="booking-card-admin">

              <div class="booking-client">

                <strong>
                  ${escapeHtml(booking.customer_name)}
                </strong>

                <span>
                  ${escapeHtml(booking.customer_phone || 'Sem telefone')}
                </span>

                <span class="booking-service-name">
                  ${escapeHtml(booking.service_name)} • ${formatCurrency(booking.service_amount_cents)}
                </span>

              </div>

              <div class="booking-details">

                <strong>
                  ${formatDate(booking.booking_date)} • ${normalizeTime(booking.booking_time)}
                </strong>

                <span>
                  Duração reservada: ${Number(booking.duration_minutes)} min
                </span>

                ${expires}

                ${payment}

                <span class="booking-status">
                  ${escapeHtml(statusLabel(booking.status))}
                </span>

              </div>

              <div class="booking-actions">
                ${getBookingActions(booking)}
              </div>

            </article>
          `;
        }
      )
      .join('');

  bookingsList
    .querySelectorAll(
      '[data-action]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          handleBookingAction
        );
      }
    );
}

async function handleBookingAction(event) {
  const button =
    event.currentTarget;

  const id =
    button.dataset.id;

  const action =
    button.dataset.action;

  const booking =
    bookings.find(
      item =>
        item.id === id
    );

  if (!booking) {
    return;
  }

  if (
    action ===
    'whatsapp'
  ) {
    const number =
      digitsOnly(
        booking.customer_phone
      );

    const message =
      `Olá, ${booking.customer_name}! Aqui é da Luence Space. Estou entrando em contato sobre seu agendamento de ${booking.service_name} no dia ${formatDate(booking.booking_date)} às ${normalizeTime(booking.booking_time)}.`;

    window.open(
      `https://wa.me/55${number.replace(/^55/, '')}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );

    return;
  }

  const confirmations = {
    confirm:
      'Confirmar este agendamento?',

    reject:
      'Recusar este agendamento e liberar o horário?',

    cancel:
      'Cancelar este agendamento e liberar o horário?',

    complete:
      'Finalizar este atendimento e registrar o pagamento?'
  };

  if (
    !window.confirm(
      confirmations[action] ||
      'Confirmar ação?'
    )
  ) {
    return;
  }

  setButtonLoading(
    button,
    true
  );

  setMessage(
    adminGlobalMessage,
    ''
  );

  try {
    if (
      action ===
      'confirm'
    ) {
      await rpc(
        'luence_admin_confirm_booking',
        {
          p_booking_id:
            id
        }
      );
    } else if (
      action ===
      'reject'
    ) {
      await rpc(
        'luence_admin_reject_booking',
        {
          p_booking_id:
            id
        }
      );
    } else if (
      action ===
      'cancel'
    ) {
      await rpc(
        'luence_admin_cancel_booking',
        {
          p_booking_id:
            id
        }
      );
    } else if (
      action ===
      'complete'
    ) {
      const select =
        document.querySelector(
          `[data-payment-method="${id}"]`
        );

      await rpc(
        'luence_admin_complete_booking',
        {
          p_booking_id:
            id,

          p_payment_method:
            select?.value ||
            'pix'
        }
      );
    }

    setMessage(
      adminGlobalMessage,
      'Agenda atualizada com sucesso.',
      'success'
    );

    await refreshDashboard();
  } catch (error) {
    setMessage(
      adminGlobalMessage,
      error.message,
      'error'
    );
  } finally {
    setButtonLoading(
      button,
      false
    );
  }
}

async function loadServices() {
  services =
    await rpc(
      'luence_get_services'
    );

  const options = [
    '<option value="">Selecione um serviço</option>'
  ].concat(
    (services || []).map(
      service =>
        `<option value="${service.id}">${escapeHtml(service.name)} — ${formatCurrency(service.price_cents)}</option>`
    )
  );

  if (manualService) {
    manualService.innerHTML =
      options.join('');
  }
}

async function loadBookings() {
  const date =
    adminDateFilter?.value ||
    getBrazilDateValue();

  if (adminLoading) {
    adminLoading.hidden =
      false;
  }

  if (adminEmpty) {
    adminEmpty.hidden =
      true;
  }

  try {
    const data =
      await rpc(
        'luence_admin_list_bookings',
        {
          p_booking_date:
            date
        }
      );

    bookings =
      Array.isArray(data)
        ? data
        : [];

    renderBookings();

    if (lastUpdate) {
      lastUpdate.textContent =
        `Atualizado às ${new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date())}`;
    }
  } finally {
    if (adminLoading) {
      adminLoading.hidden =
        true;
    }
  }
}

async function loadStats() {
  const date =
    adminDateFilter?.value ||
    getBrazilDateValue();

  const rows =
    await rpc(
      'luence_admin_dashboard_summary',
      {
        p_booking_date:
          date
      }
    );

  const data =
    Array.isArray(rows)
      ? rows[0]
      : rows;

  if (statPending) {
    statPending.textContent =
      data?.pending_count ||
      0;
  }

  if (statConfirmed) {
    statConfirmed.textContent =
      data?.confirmed_count ||
      0;
  }

  if (statCompleted) {
    statCompleted.textContent =
      data?.completed_count ||
      0;
  }

  if (statReceived) {
    statReceived.textContent =
      formatCurrency(
        data?.received_cents ||
        0
      );
  }
}

function generateTimeOptions(
  includeClosing = false
) {
  const start =
    8 * 60;

  const end =
    includeClosing
      ? 18 * 60
      : 17 * 60 + 30;

  const values = [];

  for (
    let minutes = start;
    minutes <= end;
    minutes += 30
  ) {
    const hour =
      Math.floor(
        minutes / 60
      );

    const minute =
      minutes % 60;

    values.push(
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    );
  }

  return values;
}

function populateBlockTimes() {
  const starts =
    generateTimeOptions(
      false
    );

  const ends =
    generateTimeOptions(
      true
    ).filter(
      time =>
        time !==
        '08:00'
    );

  blockStart.innerHTML =
    starts
      .map(
        time =>
          `<option value="${time}">${time}</option>`
      )
      .join('');

  blockEnd.innerHTML =
    ends
      .map(
        time =>
          `<option value="${time}">${time}</option>`
      )
      .join('');

  blockStart.value =
    '12:00';

  blockEnd.value =
    '13:00';
}

function isOpenScheduleDay(
  dateKey
) {
  const anchor =
    dateKeyToUtcDate(
      config?.scheduleAnchor ||
      '2026-10-03'
    );

  const date =
    dateKeyToUtcDate(
      dateKey
    );

  const diff =
    Math.round(
      (
        date.getTime() -
        anchor.getTime()
      ) /
      86400000
    );

  return (
    Math.abs(
      diff % 2
    ) === 0
  );
}

async function refreshManualTimes() {
  if (!manualTime) {
    return;
  }

  const service =
    services.find(
      item =>
        item.id ===
        manualService?.value
    );

  const date =
    manualDate?.value;

  if (
    !service ||
    !date
  ) {
    manualTime.innerHTML =
      '<option value="">Selecione serviço e data</option>';

    return;
  }

  if (
    !isOpenScheduleDay(
      date
    )
  ) {
    manualTime.innerHTML =
      '<option value="">Dia sem atendimento</option>';

    return;
  }

  manualTime.innerHTML =
    '<option value="">Carregando...</option>';

  try {
    const unavailable =
      await rpc(
        'luence_get_unavailable_slots',
        {
          p_service_id:
            service.id,

          p_start_date:
            date,

          p_end_date:
            date
        }
      );

    const blocked =
      new Set(
        (unavailable || []).map(
          row =>
            normalizeTime(
              row.booking_time
            )
        )
      );

    const lastStart =
      18 * 60 -
      Number(
        service.duration_minutes ||
        0
      );

    const options = [];

    for (
      let minutes = 8 * 60;
      minutes <= lastStart;
      minutes += 30
    ) {
      const hour =
        Math.floor(
          minutes / 60
        );

      const minute =
        minutes % 60;

      const value =
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      if (
        !blocked.has(
          value
        )
      ) {
        options.push(
          `<option value="${value}">${value}</option>`
        );
      }
    }

    manualTime.innerHTML =
      options.length
        ? `<option value="">Selecione</option>${options.join('')}`
        : '<option value="">Sem horários disponíveis</option>';
  } catch (error) {
    manualTime.innerHTML =
      '<option value="">Erro ao carregar horários</option>';
  }
}

async function loadBlockedSlots() {
  const date =
    blockedDateFilter?.value ||
    getBrazilDateValue();

  const rows =
    await rpc(
      'luence_admin_list_blocked_slots',
      {
        p_booking_date:
          date
      }
    );

  const data =
    Array.isArray(rows)
      ? rows
      : [];

  blockedList.innerHTML =
    data.length
      ? data
          .map(
            item => `
              <div class="blocked-row">

                <strong>
                  ${normalizeTime(item.booking_time)}
                </strong>

                <span>
                  ${escapeHtml(item.reason || 'Horário bloqueado')}
                </span>

                <button
                  class="block-remove"
                  type="button"
                  data-block-id="${item.id}"
                >
                  REMOVER
                </button>

              </div>
            `
          )
          .join('')
      : `
        <div class="admin-empty">

          <strong>
            NENHUM BLOQUEIO
          </strong>

          <p>
            Não há horários bloqueados neste dia.
          </p>

        </div>
      `;

  blockedList
    .querySelectorAll(
      '[data-block-id]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          async () => {
            if (
              !window.confirm(
                'Remover este bloqueio?'
              )
            ) {
              return;
            }

            try {
              await rpc(
                'luence_admin_unblock_slot',
                {
                  p_block_id:
                    button.dataset.blockId
                }
              );

              await loadBlockedSlots();
              await refreshManualTimes();
            } catch (error) {
              showToast(
                error.message
              );
            }
          }
        );
      }
    );
}

async function refreshDashboard() {
  setMessage(
    adminGlobalMessage,
    ''
  );

  await Promise.all([
    loadBookings(),
    loadStats()
  ]);

  await loadBlockedSlots();
  await refreshManualTimes();
}

async function pollPendingBookings() {
  if (
    !dashboardSection ||
    dashboardSection.hidden
  ) {
    return;
  }

  try {
    const data =
      await rpc(
        'luence_admin_list_active_pending_bookings'
      );

    const pending =
      Array.isArray(data)
        ? data
        : [];

    const currentIds =
      new Set(
        pending.map(
          item =>
            item.id
        )
      );

    if (
      !notificationInitialized
    ) {
      knownPendingIds =
        currentIds;

      notificationInitialized =
        true;

      return;
    }

    const fresh =
      pending.filter(
        item =>
          !knownPendingIds.has(
            item.id
          )
      );

    knownPendingIds =
      currentIds;

    if (
      fresh.length
    ) {
      playNotificationTone();

      const first =
        fresh[0];

      showToast(
        fresh.length > 1
          ? `${fresh.length} novos agendamentos recebidos.`
          : `Novo agendamento: ${first.customer_name} • ${first.service_name} • ${formatDate(first.booking_date)} às ${normalizeTime(first.booking_time)}.`
      );

      await refreshDashboard();
    }
  } catch (error) {
    console.error(
      'Erro ao verificar novos agendamentos:',
      error
    );
  }
}

function startPolling() {
  window.clearInterval(
    pollTimer
  );

  pollPendingBookings();

  pollTimer =
    window.setInterval(
      pollPendingBookings,
      10000
    );
}

function stopPolling() {
  window.clearInterval(
    pollTimer
  );

  pollTimer =
    null;

  notificationInitialized =
    false;

  knownPendingIds =
    new Set();
}

async function showDashboard(
  session
) {
  loginSection.hidden =
    true;

  dashboardSection.hidden =
    false;

  if (adminUserEmail) {
    adminUserEmail.textContent =
      session?.user?.email ||
      '';
  }

  const today =
    getBrazilDateValue();

  if (!adminDateFilter.value) {
    adminDateFilter.value =
      today;
  }

  if (!manualDate.value) {
    manualDate.value =
      today;
  }

  if (!blockDate.value) {
    blockDate.value =
      today;
  }

  if (!blockedDateFilter.value) {
    blockedDateFilter.value =
      today;
  }

  await loadServices();
  await refreshDashboard();

  startPolling();
}

function showLogin() {
  stopPolling();

  dashboardSection.hidden =
    true;

  loginSection.hidden =
    false;
}

async function validateAdmin(
  session
) {
  if (!session?.user) {
    return false;
  }

  if (
    String(
      session.user.email ||
      ''
    ).toLowerCase() !==
    String(
      config?.adminEmail ||
      ''
    ).toLowerCase()
  ) {
    return false;
  }

  try {
    await rpc(
      'luence_admin_dashboard_summary',
      {
        p_booking_date:
          getBrazilDateValue()
      }
    );

    return true;
  } catch (error) {
    return false;
  }
}

loginForm?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    setMessage(
      loginMessage,
      ''
    );

    setButtonLoading(
      loginButton,
      true,
      'ENTRANDO...'
    );

    try {
      if (!client) {
        throw new Error(
          'Conexão administrativa indisponível.'
        );
      }

      const email =
        loginEmail.value
          .trim()
          .toLowerCase();

      const password =
        loginPassword.value;

      const {
        data,
        error
      } =
        await client.auth.signInWithPassword(
          {
            email,
            password
          }
        );

      if (error) {
        throw error;
      }

      const allowed =
        await validateAdmin(
          data.session
        );

      if (!allowed) {
        await client.auth.signOut();

        throw new Error(
          'Esta conta não possui acesso ao painel da Luence Space.'
        );
      }

      loginPassword.value =
        '';

      await showDashboard(
        data.session
      );
    } catch (error) {
      setMessage(
        loginMessage,
        error.message ||
        'Não foi possível entrar.',
        'error'
      );
    } finally {
      setButtonLoading(
        loginButton,
        false
      );
    }
  }
);

passwordToggle?.addEventListener(
  'click',
  () => {
    const visible =
      loginPassword.type ===
      'text';

    loginPassword.type =
      visible
        ? 'password'
        : 'text';

    passwordToggle.textContent =
      visible
        ? 'MOSTRAR'
        : 'OCULTAR';
  }
);

logoutButton?.addEventListener(
  'click',
  async () => {
    await client?.auth.signOut();

    showLogin();
  }
);

refreshButton?.addEventListener(
  'click',
  async () => {
    setButtonLoading(
      refreshButton,
      true,
      'ATUALIZANDO...'
    );

    try {
      await refreshDashboard();
    } catch (error) {
      setMessage(
        adminGlobalMessage,
        error.message,
        'error'
      );
    } finally {
      setButtonLoading(
        refreshButton,
        false
      );
    }
  }
);

panelButtons.forEach(
  button => {
    button.addEventListener(
      'click',
      () =>
        switchPanel(
          button.dataset.panel
        )
    );
  }
);

bookingTabButtons.forEach(
  button => {
    button.addEventListener(
      'click',
      () =>
        setBookingView(
          button.dataset.bookingView
        )
    );
  }
);

adminDateFilter?.addEventListener(
  'change',
  refreshDashboard
);

adminSearch?.addEventListener(
  'input',
  renderBookings
);

clearSearchButton?.addEventListener(
  'click',
  () => {
    adminSearch.value =
      '';

    renderBookings();
  }
);

manualPhone?.addEventListener(
  'input',
  event => {
    event.target.value =
      formatPhoneInput(
        event.target.value
      );
  }
);

manualService?.addEventListener(
  'change',
  refreshManualTimes
);

manualDate?.addEventListener(
  'change',
  refreshManualTimes
);

blockedDateFilter?.addEventListener(
  'change',
  loadBlockedSlots
);

manualForm?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    setMessage(
      manualMessage,
      ''
    );

    const submit =
      manualForm.querySelector(
        'button[type="submit"]'
      );

    setButtonLoading(
      submit,
      true,
      'CRIANDO...'
    );

    try {
      if (
        !manualName.value.trim() ||
        !digitsOnly(
          manualPhone.value
        ) ||
        !manualService.value ||
        !manualDate.value ||
        !manualTime.value
      ) {
        throw new Error(
          'Preencha todos os campos obrigatórios.'
        );
      }

      await rpc(
        'luence_admin_create_booking',
        {
          p_customer_name:
            manualName.value.trim(),

          p_customer_phone:
            digitsOnly(
              manualPhone.value
            ),

          p_service_id:
            manualService.value,

          p_booking_date:
            manualDate.value,

          p_booking_time:
            manualTime.value
        }
      );

      setMessage(
        manualMessage,
        'Agendamento criado e confirmado.',
        'success'
      );

      manualName.value =
        '';

      manualPhone.value =
        '';

      manualTime.value =
        '';

      adminDateFilter.value =
        manualDate.value;

      await refreshDashboard();

      switchPanel(
        'agenda'
      );

      setBookingView(
        'scheduled'
      );
    } catch (error) {
      setMessage(
        manualMessage,
        error.message,
        'error'
      );
    } finally {
      setButtonLoading(
        submit,
        false
      );
    }
  }
);

blockForm?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    setMessage(
      blockMessage,
      ''
    );

    const submit =
      blockForm.querySelector(
        'button[type="submit"]'
      );

    setButtonLoading(
      submit,
      true,
      'BLOQUEANDO...'
    );

    try {
      if (
        !blockDate.value ||
        !blockStart.value ||
        !blockEnd.value
      ) {
        throw new Error(
          'Preencha a data e o período.'
        );
      }

      await rpc(
        'luence_admin_block_interval',
        {
          p_booking_date:
            blockDate.value,

          p_start_time:
            blockStart.value,

          p_end_time:
            blockEnd.value,

          p_reason:
            blockReason.value.trim() ||
            null
        }
      );

      setMessage(
        blockMessage,
        'Período bloqueado com sucesso.',
        'success'
      );

      blockedDateFilter.value =
        blockDate.value;

      blockReason.value =
        '';

      await loadBlockedSlots();
      await refreshManualTimes();
    } catch (error) {
      setMessage(
        blockMessage,
        error.message,
        'error'
      );
    } finally {
      setButtonLoading(
        submit,
        false
      );
    }
  }
);

async function initializeAdmin() {
  if (!client) {
    setMessage(
      loginMessage,
      'Não foi possível iniciar o sistema administrativo.',
      'error'
    );

    return;
  }

  populateBlockTimes();

  const {
    data
  } =
    await client.auth.getSession();

  const session =
    data?.session ||
    null;

  if (
    session &&
    await validateAdmin(
      session
    )
  ) {
    await showDashboard(
      session
    );
  } else {
    if (session) {
      await client.auth.signOut();
    }

    showLogin();
  }
}

initializeAdmin();
