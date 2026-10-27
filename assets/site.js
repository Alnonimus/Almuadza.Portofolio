(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu');
  const nav = document.querySelector('.nav-links');
  const progress = document.querySelector('.scroll-progress');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js-ready');
  document.querySelectorAll('.section-head, .skill-box, .certificate-group, .project-documentation, .journey-photo, .experience-gallery .document-photo, .certificate-photo, .poster-pair .document-photo, .pkm-feature').forEach((item) => item.classList.add('reveal'));
  const revealItems = document.querySelectorAll('.reveal');

  const canvas = document.querySelector('.network-canvas');
  if (canvas && canvas.getContext) {
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let frame = 0;
    let nodes = [];
    const resizeNetwork = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(18, Math.min(46, Math.round(width / 23)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        dx: (Math.random() - 0.5) * 0.28, dy: (Math.random() - 0.5) * 0.28
      }));
      drawNetwork(false);
    };
    const drawNetwork = (animate) => {
      context.clearRect(0, 0, width, height);
      nodes.forEach((node, index) => {
        if (animate) {
          node.x += node.dx; node.y += node.dy;
          if (node.x < 0 || node.x > width) node.dx *= -1;
          if (node.y < 0 || node.y > height) node.dy *= -1;
        }
        for (let other = index + 1; other < nodes.length; other += 1) {
          const next = nodes[other];
          const distance = Math.hypot(node.x - next.x, node.y - next.y);
          if (distance < 118) {
            context.strokeStyle = `rgba(53, 224, 208, ${(1 - distance / 118) * 0.17})`;
            context.lineWidth = 0.7;
            context.beginPath(); context.moveTo(node.x, node.y); context.lineTo(next.x, next.y); context.stroke();
          }
        }
        context.fillStyle = 'rgba(140, 255, 238, 0.56)';
        context.beginPath(); context.arc(node.x, node.y, 1.2, 0, Math.PI * 2); context.fill();
      });
      if (animate && !document.hidden) frame = window.requestAnimationFrame(() => drawNetwork(true));
    };
    resizeNetwork();
    if (!reduceMotion) frame = window.requestAnimationFrame(() => drawNetwork(true));
    window.addEventListener('resize', resizeNetwork, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.cancelAnimationFrame(frame);
      else if (!reduceMotion) frame = window.requestAnimationFrame(() => drawNetwork(true));
    });
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? 'Tutup' : 'Menu';
    });
    navLinks.forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
      }
    });
  }

  let scheduled = false;
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${percent}%`;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      window.requestAnimationFrame(updateScrollUI);
      scheduled = true;
    }
  }, { passive: true });
  updateScrollUI();

  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -28px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const portrait = document.querySelector('.portrait-wrap img');
  if (portrait && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const frame = portrait.closest('.portrait-wrap');
    frame.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform = `translate(${x * 5}px, ${y * 4}px) scale(1.025)`;
    });
    frame.addEventListener('pointerleave', () => { portrait.style.transform = ''; });
  }

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const interactiveCards = document.querySelectorAll('.project, .achievement, .skill-box, .job, .greenhouse-story, .project-documentation, .certificate-photo, .journey-photo, .experience-gallery .document-photo, .poster-pair .document-photo, .pkm-feature');
    interactiveCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
        const tiltX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
        const tiltY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -5;
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--spot-x');
        card.style.removeProperty('--spot-y');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }
  const uploadInputs = document.querySelectorAll('[data-experience-upload], [data-certificate-upload]');
  const galleries = {
    experience: document.querySelector('.experience-gallery'),
    certificate: document.querySelector('.certificate-gallery')
  };
  let toastTimer;

  const showToast = (message) => {
    let toast = document.querySelector('.upload-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'upload-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
  };

  const database = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Penyimpanan browser tidak tersedia.'));
    const request = indexedDB.open('al-muadza-portfolio-images', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('images')) request.result.createObjectStore('images', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const fallbackStoreKey = 'al-muadza-portfolio-image-backup';
  const readFallback = () => JSON.parse(localStorage.getItem(fallbackStoreKey) || '{}');
  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  const dataUrlToBlob = async (url) => (await fetch(url)).blob();
  const saveFallback = async (record) => {
    const entries = readFallback();
    entries[record.key] = { key: record.key, name: record.name, data: await blobToDataUrl(record.blob) };
    localStorage.setItem(fallbackStoreKey, JSON.stringify(entries));
  };
  const saveImage = async (record) => {
    try {
      const db = await database;
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('images', 'readwrite');
        transaction.objectStore('images').put(record);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } catch (error) {
      await saveFallback(record);
    }
  };
  const readImages = async () => {
    try {
      const db = await database;
      return await new Promise((resolve, reject) => {
        const request = db.transaction('images', 'readonly').objectStore('images').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      const entries = Object.values(readFallback());
      return Promise.all(entries.map(async (item) => ({ key: item.key, name: item.name, blob: await dataUrlToBlob(item.data) })));
    }
  };
  const prepareImage = async (file) => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Gambar tidak dapat diproses.')), 'image/webp', 0.86);
    });
  };
  const fileStem = (name) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const renderGallery = (records, section) => {
    const gallery = galleries[section];
    if (!gallery) return;
    gallery.querySelectorAll('.uploaded-document-photo').forEach((item) => item.remove());
    records.filter((item) => item.key.startsWith(`${section}:`)).forEach((item) => {
      const figure = document.createElement('figure');
      figure.className = `document-photo uploaded-document-photo ${section}-uploaded-photo`;
      const link = document.createElement('a');
      const image = document.createElement('img');
      const url = URL.createObjectURL(item.blob);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      image.src = url;
      image.alt = `Dokumentasi ${section === 'experience' ? 'pengalaman' : 'pencapaian'}: ${fileStem(item.name)}`;
      image.loading = 'lazy';
      link.append(image);
      const caption = document.createElement('figcaption');
      caption.textContent = fileStem(item.name) || 'Dokumentasi';
      figure.append(link, caption);
      gallery.append(figure);
    });
    gallery.hidden = !gallery.childElementCount;
  };
  const restoreGalleries = async () => {
    try {
      const records = await readImages();
      renderGallery(records, 'experience');
      renderGallery(records, 'certificate');
    } catch (error) {
      showToast('Penyimpanan gambar tidak dapat dibuka di browser ini.');
    }
  };

  uploadInputs.forEach((input) => input.addEventListener('change', async () => {
    const files = [...(input.files || [])];
    if (!files.length) return;
    const section = input.hasAttribute('data-experience-upload') ? 'experience' : 'certificate';
    try {
      const records = await readImages();
      for (const file of files) {
        const blob = await prepareImage(file);
        const key = `${section}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
        const record = { key, blob, name: file.name };
        await saveImage(record);
        records.push(record);
      }
      renderGallery(records, section);
      showToast(`${files.length} gambar ditambahkan ke ${section === 'experience' ? 'Pengalaman Magang' : 'Sertifikat & Pelatihan'}.`);
    } catch (error) {
      showToast('Gambar gagal disimpan. Silakan coba lagi.');
    }
    input.value = '';
  }));

  restoreGalleries();
})();
