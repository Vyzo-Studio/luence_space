const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

const portfolioFilters = document.querySelectorAll(
  '.portfolio-filter'
);

const portfolioCards = document.querySelectorAll(
  '.portfolio-card'
);

const portfolioLightbox = document.getElementById(
  'portfolio-lightbox'
);

const lightboxImage = document.getElementById(
  'lightbox-image'
);

const lightboxClose = document.getElementById(
  'lightbox-close'
);

const bookingForm = document.getElementById(
  'booking-form'
);

const bookingName = document.getElementById(
  'booking-name'
);

const bookingService = document.getElementById(
  'booking-service'
);

const bookingDate = document.getElementById(
  'booking-date'
);

const bookingTime = document.getElementById(
  'booking-time'
);

const serviceCards = document.querySelectorAll(
  '.service-card'
);

function getBrazilDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  );

  const parts = formatter.formatToParts(date);

  const year = parts.find(
    part => part.type === 'year'
  )?.value;

  const month = parts.find(
    part => part.type === 'month'
  )?.value;

  const day = parts.find(
    part => part.type === 'day'
  )?.value;

  return `${year}-${month}-${day}`;
}

function addDaysToBrazilDate(
  dateValue,
  days
) {
  const [
    year,
    month,
    day
  ] = dateValue
    .split('-')
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day + days,
      12,
      0,
      0
    )
  );

  const formatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  );

  const parts = formatter.formatToParts(date);

  const formattedYear = parts.find(
    part => part.type === 'year'
  )?.value;

  const formattedMonth = parts.find(
    part => part.type === 'month'
  )?.value;

  const formattedDay = parts.find(
    part => part.type === 'day'
  )?.value;

  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}

function getSelectedDateWeekday(
  dateValue
) {
  const [
    year,
    month,
    day
  ] = dateValue
    .split('-')
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0
    )
  );

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long'
    }
  )
    .format(date)
    .toLowerCase();
}

function formatBrazilDate(
  dateValue
) {
  const [
    year,
    month,
    day
  ] = dateValue
    .split('-')
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0
    )
  );

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  ).format(date);
}

function openMenu() {
  menuToggle?.classList.add(
    'is-active'
  );

  mainNav?.classList.add(
    'is-open'
  );

  document.body.classList.add(
    'menu-open'
  );

  menuToggle?.setAttribute(
    'aria-expanded',
    'true'
  );
}

function closeMenu() {
  menuToggle?.classList.remove(
    'is-active'
  );

  mainNav?.classList.remove(
    'is-open'
  );

  document.body.classList.remove(
    'menu-open'
  );

  menuToggle?.setAttribute(
    'aria-expanded',
    'false'
  );
}

function toggleMenu() {
  if (
    mainNav?.classList.contains(
      'is-open'
    )
  ) {
    closeMenu();
    return;
  }

  openMenu();
}

menuToggle?.addEventListener(
  'click',
  toggleMenu
);

mainNav
  ?.querySelectorAll('a')
  .forEach(link => {
    link.addEventListener(
      'click',
      closeMenu
    );
  });

window.addEventListener(
  'resize',
  () => {
    if (
      window.innerWidth > 900
    ) {
      closeMenu();
    }
  }
);

portfolioFilters.forEach(
  button => {
    button.addEventListener(
      'click',
      () => {
        const filter =
          button.dataset.filter;

        portfolioFilters.forEach(
          item => {
            item.classList.remove(
              'is-active'
            );
          }
        );

        button.classList.add(
          'is-active'
        );

        portfolioCards.forEach(
          card => {
            const categories =
              card.dataset.category
                ?.split(' ')
                .filter(Boolean) ?? [];

            const shouldShow =
              filter === 'todos' ||
              categories.includes(
                filter
              );

            card.classList.toggle(
              'is-hidden',
              !shouldShow
            );
          }
        );
      }
    );
  }
);

function openLightbox(
  image
) {
  if (
    !portfolioLightbox ||
    !lightboxImage ||
    !image
  ) {
    return;
  }

  lightboxImage.src =
    image.currentSrc ||
    image.src;

  lightboxImage.alt =
    image.alt || '';

  portfolioLightbox.hidden =
    false;

  document.body.style.overflow =
    'hidden';
}

function closeLightbox() {
  if (
    !portfolioLightbox ||
    !lightboxImage
  ) {
    return;
  }

  portfolioLightbox.hidden =
    true;

  lightboxImage.src = '';

  if (
    !document.body.classList.contains(
      'menu-open'
    )
  ) {
    document.body.style.overflow =
      '';
  }
}

portfolioCards.forEach(
  card => {
    card.addEventListener(
      'click',
      () => {
        const image =
          card.querySelector('img');

        openLightbox(image);
      }
    );
  }
);

lightboxClose?.addEventListener(
  'click',
  closeLightbox
);

portfolioLightbox?.addEventListener(
  'click',
  event => {
    if (
      event.target ===
      portfolioLightbox
    ) {
      closeLightbox();
    }
  }
);

document.addEventListener(
  'keydown',
  event => {
    if (
      event.key === 'Escape'
    ) {
      closeMenu();

      if (
        portfolioLightbox &&
        !portfolioLightbox.hidden
      ) {
        closeLightbox();
      }
    }
  }
);

serviceCards.forEach(
  card => {
    const button =
      card.querySelector('a');

    const serviceName =
      card
        .querySelector('h3')
        ?.textContent
        .trim();

    button?.addEventListener(
      'click',
      () => {
        if (
          !bookingService ||
          !serviceName
        ) {
          return;
        }

        const option = [
          ...bookingService.options
        ].find(
          item =>
            item.value ===
            serviceName
        );

        if (option) {
          bookingService.value =
            serviceName;
        }
      }
    );
  }
);

function createBookingMessage() {
  let message =
    document.getElementById(
      'booking-form-message'
    );

  if (
    message ||
    !bookingForm
  ) {
    return message;
  }

  message =
    document.createElement('div');

  message.id =
    'booking-form-message';

  message.style.display =
    'none';

  message.style.padding =
    '14px 16px';

  message.style.fontSize =
    '0.76rem';

  message.style.lineHeight =
    '1.6';

  message.style.textAlign =
    'center';

  bookingForm.appendChild(
    message
  );

  return message;
}

function showBookingMessage(
  text,
  type = 'success'
) {
  const message =
    createBookingMessage();

  if (!message) {
    return;
  }

  message.textContent =
    text;

  message.style.display =
    'block';

  if (
    type === 'error'
  ) {
    message.style.background =
      '#f5e5e2';

    message.style.color =
      '#7c3028';

    message.style.border =
      '1px solid rgba(124, 48, 40, 0.18)';

    return;
  }

  message.style.background =
    '#eee6da';

  message.style.color =
    '#4d3d25';

  message.style.border =
    '1px solid rgba(199, 163, 90, 0.35)';
}

function clearBookingMessage() {
  const message =
    document.getElementById(
      'booking-form-message'
    );

  if (!message) {
    return;
  }

  message.style.display =
    'none';

  message.textContent =
    '';
}

function configureBookingDates() {
  if (!bookingDate) {
    return;
  }

  const today =
    getBrazilDateValue();

  bookingDate.min =
    today;

  bookingDate.max =
    addDaysToBrazilDate(
      today,
      60
    );
}

bookingDate?.addEventListener(
  'change',
  () => {
    clearBookingMessage();

    if (
      !bookingDate.value
    ) {
      return;
    }

    const weekday =
      getSelectedDateWeekday(
        bookingDate.value
      );

    if (
      weekday.includes(
        'domingo'
      )
    ) {
      bookingDate.value =
        '';

      showBookingMessage(
        'A Luence não possui horários disponíveis aos domingos. Escolha outro dia.',
        'error'
      );
    }
  }
);

[
  bookingName,
  bookingService,
  bookingTime
].forEach(
  field => {
    field?.addEventListener(
      'input',
      clearBookingMessage
    );

    field?.addEventListener(
      'change',
      clearBookingMessage
    );
  }
);

bookingForm?.addEventListener(
  'submit',
  event => {
    event.preventDefault();

    clearBookingMessage();

    const name =
      bookingName?.value.trim();

    const service =
      bookingService?.value;

    const date =
      bookingDate?.value;

    const time =
      bookingTime?.value;

    if (
      !name ||
      !service ||
      !date ||
      !time
    ) {
      showBookingMessage(
        'Preencha todos os campos para solicitar o agendamento.',
        'error'
      );

      return;
    }

    const weekday =
      getSelectedDateWeekday(
        date
      );

    if (
      weekday.includes(
        'domingo'
      )
    ) {
      showBookingMessage(
        'Não há atendimento aos domingos.',
        'error'
      );

      return;
    }

    const formattedDate =
      formatBrazilDate(
        date
      );

    showBookingMessage(
      `Solicitação preparada para ${name}: ${service}, dia ${formattedDate}, às ${time}. O sistema de confirmação será conectado na próxima etapa.`
    );
  }
);

configureBookingDates();
