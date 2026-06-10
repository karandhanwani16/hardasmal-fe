let lockCount = 0;

const saved = {
  body: '',
  html: '',
  main: '',
};

function queryMain(): HTMLElement | null {
  const main = document.querySelector('main');
  return main instanceof HTMLElement ? main : null;
}

export function lockPageScroll(): void {
  if (lockCount === 0) {
    saved.body = document.body.style.overflow;
    saved.html = document.documentElement.style.overflow;
    const main = queryMain();
    saved.main = main?.style.overflow ?? '';

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (main) {
      main.style.overflow = 'hidden';
    }
  }

  lockCount += 1;
}

export function unlockPageScroll(): void {
  if (lockCount <= 0) {
    return;
  }

  lockCount -= 1;

  if (lockCount > 0) {
    return;
  }

  document.body.style.overflow = saved.body;
  document.documentElement.style.overflow = saved.html;

  const main = queryMain();
  if (main) {
    main.style.overflow = saved.main;
  }
}
