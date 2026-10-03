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
const bookingService = document.getElementById('booking-service');
const bookingDate = document.getElementById('booking-date');
const bookingTime = document.getElementById('booking-time');
const bookingMessage = document.getElementById('booking-form-message');
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

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

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

function getSelectedDateWeekday(dateValue) {
  const [year, month, day] = dateValue
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

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long'
  })
    .format(date)
    .toLowerCase();
}

function formatBrazilDate(dateValue) {
  const [year, month, day] = dateValue
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

  menuToggle?.setAttribute(
    'aria-expanded',
    'true'
  );

  menuToggle?.setAttribute(
    'aria-label',
    'Fechar menu'
  );
}

function closeMenu() {
  menuToggle?.classList.remove('is-active');
  mainNav?.classList.remove('is-open');

  document.body.classList.remove('menu-open');

  menuToggle?.setAttribute(
    'aria-expanded',
    'false'
  );

  menuToggle?.setAttribute(
    'aria-label',
    'Abrir menu'
  );
}

function toggleMenu() {
  if (
    mainNav?.classList.contains('is-open')
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

document.addEventListener(
  'click',
  event => {
    if (
      !document.body.classList.contains('menu-open') ||
      mainNav?.contains(event.target) ||
      menuToggle?.contains(event.target)
    ) {
      return;
    }

    closeMenu();
  }
);

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

function updateHeaderState() {
  siteHeader?.classList.toggle(
    'is-scrolled',
    window.scrollY > 18
  );
}

window.addEventListener(
  'scroll',
  updateHeaderState,
  {
    passive: true
  }
);

updateHeaderState();

if (
  'IntersectionObserver' in window
) {
  const sectionObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(
          entry => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            navLinks.forEach(
              link => {
                const isCurrent =
                  link.dataset.navSection ===
                  entry.target.id;

                link.classList.toggle(
                  'is-active',
                  isCurrent
                );

                if (
                  isCurrent
                ) {
                  link.setAttribute(
                    'aria-current',
                    'page'
                  );
                } else {
                  link.removeAttribute(
                    'aria-current'
                  );
                }
              }
            );
          }
        );
      },
      {
        rootMargin:
          '-30% 0px -58% 0px',
        threshold: 0
      }
    );

  sections.forEach(
    section =>
      sectionObserver.observe(
        section
      )
  );
}

revealElements.forEach(
  element => {
    const delay =
      Number(
        element.dataset.revealDelay ||
        0
      );

    element.style.setProperty(
      '--reveal-delay',
      `${delay}ms`
    );
  }
);

if (
  'IntersectionObserver' in window &&
  !window
    .matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    .matches
) {
  const revealObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(
          entry => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              'is-visible'
            );

            revealObserver.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold: 0.12,
        rootMargin:
          '0px 0px -45px 0px'
      }
    );

  revealElements.forEach(
    element =>
      revealObserver.observe(
        element
      )
  );
} else {
  revealElements.forEach(
    element =>
      element.classList.add(
        'is-visible'
      )
  );
}

function getVisiblePortfolioItems() {
  return [...portfolioItems].filter(
    item =>
      !item.classList.contains(
        'is-hidden'
      )
  );
}

function updatePortfolioCount() {
  if (
    !portfolioCount
  ) {
    return;
  }

  const total =
    getVisiblePortfolioItems().length;

  portfolioCount.textContent =
    String(total).padStart(
      2,
      '0'
    );
}

portfolioFilters.forEach(
  button => {
    button.addEventListener(
      'click',
      () => {
        const filter =
          button.dataset.filter;

        portfolioFilters.forEach(
          item => {
            const isActive =
              item === button;

            item.classList.toggle(
              'is-active',
              isActive
            );

            item.setAttribute(
              'aria-pressed',
              String(isActive)
            );
          }
        );

        portfolioItems.forEach(
          item => {
            const categories =
              item.dataset.category
                ?.split(' ')
                .filter(Boolean) ??
              [];

            const shouldShow =
              filter === 'todos' ||
              categories.includes(
                filter
              );

            item.classList.toggle(
              'is-hidden',
              !shouldShow
            );
          }
        );

        updatePortfolioCount();
      }
    );
  }
);

function renderLightbox(index) {
  const visibleItems =
    getVisiblePortfolioItems();

  if (
    !visibleItems.length ||
    !lightboxImage ||
    !lightboxTitle ||
    !lightboxCounter
  ) {
    return;
  }

  activeLightboxIndex =
    (
      index +
      visibleItems.length
    ) %
    visibleItems.length;

  const item =
    visibleItems[
      activeLightboxIndex
    ];

  const image =
    item.querySelector('img');

  const title =
    item
      .querySelector(
        '.portfolio-meta strong'
      )
      ?.textContent
      ?.trim() ||
    '';

  if (
    !image
  ) {
    return;
  }

  lightboxImage.src =
    image.currentSrc ||
    image.src;

  lightboxImage.alt =
    image.alt ||
    '';

  lightboxTitle.textContent =
    title;

  lightboxCounter.textContent =
    `${String(
      activeLightboxIndex + 1
    ).padStart(
      2,
      '0'
    )} / ${String(
      visibleItems.length
    ).padStart(
      2,
      '0'
    )}`;
}

function openLightbox(item) {
  if (
    !portfolioLightbox
  ) {
    return;
  }

  const visibleItems =
    getVisiblePortfolioItems();

  const index =
    visibleItems.indexOf(
      item
    );

  if (
    index < 0
  ) {
    return;
  }

  renderLightbox(index);

  portfolioLightbox.hidden =
    false;

  portfolioLightbox.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.classList.add(
    'lightbox-open'
  );

  lightboxClose?.focus();
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

  portfolioLightbox.setAttribute(
    'aria-hidden',
    'true'
  );

  lightboxImage.src =
    '';

  document.body.classList.remove(
    'lightbox-open'
  );
}

portfolioItems.forEach(
  item => {
    item
      .querySelector(
        '.portfolio-card'
      )
      ?.addEventListener(
        'click',
        () =>
          openLightbox(
            item
          )
      );
  }
);

lightboxClose?.addEventListener(
  'click',
  closeLightbox
);

lightboxPrev?.addEventListener(
  'click',
  () =>
    renderLightbox(
      activeLightboxIndex - 1
    )
);

lightboxNext?.addEventListener(
  'click',
  () =>
    renderLightbox(
      activeLightboxIndex + 1
    )
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

    if (
      !portfolioLightbox ||
      portfolioLightbox.hidden
    ) {
      return;
    }

    if (
      event.key ===
      'ArrowLeft'
    ) {
      renderLightbox(
        activeLightboxIndex - 1
      );
    }

    if (
      event.key ===
      'ArrowRight'
    ) {
      renderLightbox(
        activeLightboxIndex + 1
      );
    }
  }
);

serviceCards.forEach(
  card => {
    const button =
      card.querySelector('a');

    const serviceName =
      card.dataset.service;

    button?.addEventListener(
      'click',
      () => {
        if (
          !bookingService ||
          !serviceName
        ) {
          return;
        }

        const option =
          [
            ...bookingService.options
          ].find(
            item =>
              item.value ===
              serviceName
          );

        if (
          option
        ) {
          bookingService.value =
            serviceName;

          clearBookingMessage();
        }
      }
    );
  }
);

function showBookingMessage(
  text,
  type = 'success'
) {
  if (
    !bookingMessage
  ) {
    return;
  }

  bookingMessage.textContent =
    text;

  bookingMessage.hidden =
    false;

  bookingMessage.classList.toggle(
    'is-error',
    type === 'error'
  );
}

function clearBookingMessage() {
  if (
    !bookingMessage
  ) {
    return;
  }

  bookingMessage.hidden =
    true;

  bookingMessage.textContent =
    '';

  bookingMessage.classList.remove(
    'is-error'
  );
}

function configureBookingDates() {
  if (
    !bookingDate
  ) {
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
      bookingName
        ?.value
        .trim();

    const service =
      bookingService
        ?.value;

    const date =
      bookingDate
        ?.value;

    const time =
      bookingTime
        ?.value;

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
updatePortfolioCount();
