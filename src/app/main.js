import '../styles/base.css';
import './app.css';


import { loadPdf } from '../core/pdf-loader.js';
import { renderPageToCanvas } from '../core/page-renderer.js';

import {
  addDocument,
  addPages,
  clearWorkspace,
  getPageCounts,
  getState,
} from '../state/workspace-store.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-page">

    <header class="app-header">
      <a class="brand" href="/">
        <img
          class="brand-icon"
          src="/favicon.png"
          alt="PDF 2 PRINTABLE"
        />

        <span class="brand-name">PDF 2 PRINTABLE</span>
      </a>

      <a class="home-link" href="/">
        ← Home
      </a>
    </header>

    <main class="workspace">

      <section class="workspace-heading">
        <h1>Turn Digital Notes into Printable PDFs.</h1>

        <p>
          Convert dark and colourful digital notes into clean,
          print-friendly pages while keeping your content readable.
        </p>
      </section>

      <section class="main-tool">

        <span class="tool-label">
          ⭐ Main Tool
        </span>

        <h2 class="tool-title">
          PDF → Printable
        </h2>

        <p class="tool-description">
          Make your digital lecture notes clean, readable and
          ready for printing.
        </p>

        <div class="upload-zone" id="uploadZone">

          <div class="upload-icon">
            📄
          </div>

          <h3>Drop your PDF here</h3>

          <p>
            or choose  PDF from your device
          </p>

          <input
           id="pdfInput"
           type="file"
           accept="application/pdf,.pdf"
           multiple
          hidden
          />

          <button
         class="choose-button"
          id="choosePdfButton"
          type="button"
              >
            Choose PDF(s)
          </button>
          

          <div class="upload-hint">
            PDF files only
          </div>

        </div>

        <div class="privacy-note">
          <span>🔒</span>
          <span>Your files stay on your device.</span>
        </div>

        <div id="pdfStatus"></div>

        <div id="pageManager" class="page-manager" hidden>

  <div class="page-manager-header">
    <div>
      <h2>Pages</h2>
      <p>Choose, remove or restore pages before conversion.</p>
    </div>

    <button
      class="secondary-button"
      id="addPdfButton"
      type="button"
    >
      + Add PDF
    </button>
  </div>

  <div class="page-stats" id="pageStats"></div>

  <div
    class="page-grid"
    id="pageGrid"
  ></div>

  <div class="blank-page-action">
    <button
      class="secondary-button"
      id="addBlankPageButton"
      type="button"
    >
      + Add Blank Page
    </button>
  </div>

</div>

      </section>

      <section class="extra-section">

        <div class="section-heading">
          <h2>Extra PDF Tools</h2>
          <p>More useful PDF utilities, all in one place.</p>
        </div>

        <div class="extra-tools">

          <button class="extra-tool" type="button">
            <div class="extra-tool-icon">📑</div>
            <h3>Merge PDF</h3>
            <p>Combine multiple PDF files into one.</p>
          </button>

          <button class="extra-tool" type="button">
            <div class="extra-tool-icon">🖼️</div>
            <h3>Image → PDF</h3>
            <p>Turn your images into a PDF document.</p>
          </button>

          <button class="extra-tool" type="button">
            <div class="extra-tool-icon">🗜️</div>
            <h3>Compress PDF</h3>
            <p>Reduce PDF file size for easier sharing.</p>
          </button>

          <button class="extra-tool" type="button">
            <div class="extra-tool-icon">✂️</div>
            <h3>Extract Pages</h3>
            <p>Select and extract pages into a new PDF.</p>
          </button>

        </div>

      </section>

    </main>

  </div>
`;

const pdfInput = document.querySelector('#pdfInput');
const choosePdfButton = document.querySelector('#choosePdfButton');
const uploadZone = document.querySelector('#uploadZone');
const pdfStatus = document.querySelector('#pdfStatus');

const previewCanvas = document.querySelector('#previewCanvas');
const pageManager = document.querySelector('#pageManager');
const pageGrid = document.querySelector('#pageGrid');
const pageStats = document.querySelector('#pageStats');
const addPdfButton = document.querySelector('#addPdfButton');
const addBlankPageButton = document.querySelector('#addBlankPageButton');

choosePdfButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();

  pdfInput.click();
});

pdfInput.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) {
    return;
  }

  console.log('Selected files:', files);

  await handlePdfs(files);

  // Same PDF ko dobara select karne ki permission
  pdfInput.value = '';
});

uploadZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadZone.classList.add('is-dragging');
});

uploadZone.addEventListener('dragleave', (event) => {
  event.preventDefault();
  uploadZone.classList.remove('is-dragging');
});

uploadZone.addEventListener('drop', async (event) => {
  event.preventDefault();

  uploadZone.classList.remove('is-dragging');

  const files = Array.from(event.dataTransfer.files || []);

  if (files.length === 0) {
    return;
  }

  console.log('Dropped files:', files);

  await handlePdfs(files);
});

async function handlePdf(file) {
  pdfStatus.innerHTML = '';
  

  try {
    choosePdfButton.disabled = true;
    choosePdfButton.textContent = 'Loading…';

    const pdf = await loadPdf(file);

    const firstPage = await pdf.getPage(1);

    await renderPageToCanvas(
      firstPage,
      previewCanvas,
      1.5
    );

    pdfStatus.innerHTML = `
      <div class="pdf-success">
        <strong>${escapeHtml(file.name)}</strong>
        <span>${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'} loaded</span>
      </div>
    `;

   
  } catch (error) {
    console.error(error);

    pdfStatus.innerHTML = `
      <div class="pdf-error">
        ${escapeHtml(error.message || 'Unable to load this PDF.')}
      </div>
    `;
  } finally {
    choosePdfButton.disabled = false;
    choosePdfButton.textContent = 'Choose PDF';
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


async function handlePdfs(files) {
  pdfStatus.innerHTML = '';


  try {
    choosePdfButton.disabled = true;
    choosePdfButton.textContent = 'Loading…';

    

    for (let documentIndex = 0; documentIndex < files.length; documentIndex += 1) {
      const file = files[documentIndex];

      const pdf = await loadPdf(file);

      const documentId = `document-${Date.now()}-${documentIndex}`;

      addDocument({
        id: documentId,
        name: file.name,
        file,
        pageCount: pdf.numPages,
        pdf,
      });

      const documentPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        documentPages.push({
          id: `${documentId}-page-${pageNumber}`,
          documentId,
          pageNumber,
          removed: false,
          blank: false,
        });
      }

      addPages(documentPages);
    }

    const state = getState();
    const counts = getPageCounts();

    pdfStatus.innerHTML = `
      <div class="pdf-success">
        <strong>
          ${state.documents.length}
          PDF${state.documents.length === 1 ? '' : 's'} loaded
        </strong>

        <span>
          ${counts.total} total pages
        </span>
      </div>
    `;

renderPageManager();
    renderPageManager();

  } catch (error) {
    console.error(error);

    clearWorkspace();

    pdfStatus.innerHTML = `
      <div class="pdf-error">
        ${escapeHtml(error.message || 'Unable to load the PDF files.')}
      </div>
    `;
  } finally {
    choosePdfButton.disabled = false;
    choosePdfButton.textContent = 'Choose PDF(s)';
  }
}

async function renderFirstPage(pdf) {
  const firstPage = await pdf.getPage(1);

  await renderPageToCanvas(
    firstPage,
    previewCanvas,
    1.5
  );


}


function renderPageManager() {
  const state = getState();
  const counts = getPageCounts();

  pageManager.hidden = state.pages.length === 0;

  pageStats.innerHTML = `
    <div class="stat">
      <span>Total</span>
      <strong>${counts.total}</strong>
    </div>

    <div class="stat">
      <span>Removed</span>
      <strong>${counts.removed}</strong>
    </div>

    <div class="stat">
      <span>Blank</span>
      <strong>${counts.blank}</strong>
    </div>

    <div class="stat">
      <span>Final</span>
      <strong>${counts.final}</strong>
    </div>
  `;

  pageGrid.innerHTML = '';

  state.pages.forEach((page, index) => {
    const card = createPageCard(page, index);

    pageGrid.appendChild(card);

    renderThumbnail(page, card.querySelector('.page-thumbnail'));
  });
}


function createPageCard(page, index) {
  const card = document.createElement('article');

  card.className = 'page-card';

  if (page.removed) {
    card.classList.add('is-removed');
  }

  card.innerHTML = `
   <div class="page-thumbnail-wrapper" data-page-id="${page.id}">

  <button
    class="page-insert-button page-insert-left"
    type="button"
    title="Insert blank page before"
  >
    +
  </button>

  <canvas class="page-thumbnail"></canvas>

  ${
    page.removed
      ? '<div class="removed-overlay">Removed</div>'
      : ''
  }

  <button
    class="page-insert-button page-insert-right"
    type="button"
    title="Insert blank page after"
  >
    +
  </button>

</div>

    <div class="page-card-footer">

      <span class="page-number">
        Page ${index + 1}
      </span>

      <button
        class="page-action-button"
        type="button"
        data-action="${page.removed ? 'restore' : 'remove'}"
      >
        ${page.removed ? 'Restore' : 'Remove'}
      </button>

    </div>
  `;

const leftInsertButton = card.querySelector('.page-insert-left');
const rightInsertButton = card.querySelector('.page-insert-right');

leftInsertButton.addEventListener('click', (event) => {
  event.stopPropagation();

  const state = getState();

  const blankPage = {
    id: `blank-page-${Date.now()}-${Math.random()}`,
    documentId: null,
    pageNumber: null,
    removed: false,
    blank: true,
  };

  state.pages.splice(index, 0, blankPage);

  renderPageManager();
});

rightInsertButton.addEventListener('click', (event) => {
  event.stopPropagation();

  const state = getState();

  const blankPage = {
    id: `blank-page-${Date.now()}-${Math.random()}`,
    documentId: null,
    pageNumber: null,
    removed: false,
    blank: true,
  };

  state.pages.splice(index + 1, 0, blankPage);

  renderPageManager();
});



  const actionButton = card.querySelector('.page-action-button');

actionButton.addEventListener('click', (event) => {
  event.stopPropagation();

  const state = getState();

  if (page.blank) {
    const pageIndex = state.pages.findIndex(
      (item) => item.id === page.id
    );

    if (pageIndex !== -1) {
      state.pages.splice(pageIndex, 1);
    }
  } else {
    page.removed = !page.removed;
  }

  renderPageManager();
});

  card.addEventListener('click', () => {
    if (!page.removed) {
      return;
    }

    page.removed = false;

    renderPageManager();
  });

  return card;
}

async function renderThumbnail(pageData, canvas) {
  if (pageData.blank) {
  const context = canvas.getContext('2d');

  canvas.width = 320;
  canvas.height = 180;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#64748b';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.font = 'bold 20px Arial';

  context.fillText(
    'BLANK PAGE',
    canvas.width / 2,
    canvas.height / 2 - 8
  );

  context.font = '11px Arial';

  context.fillText(
    '(for taking notes)',
    canvas.width / 2,
    canvas.height / 2 + 14
  );

  return;
}

  const documentData = getState().documents.find(
    (document) => document.id === pageData.documentId
  );

  if (!documentData) {
    return;
  }

  const pdfPage = await documentData.pdf.getPage(
    pageData.pageNumber
  );

  await renderPageToCanvas(
    pdfPage,
    canvas,
    0.35
  );
}


addPdfButton.addEventListener('click', () => {
  pdfInput.click();
});

addBlankPageButton.addEventListener('click', () => {
  const state = getState();

  const blankPage = {
    id: `blank-page-${Date.now()}`,
    documentId: null,
    pageNumber: null,
    removed: false,
    blank: true,
  };

  addPages([blankPage]);

  renderPageManager();
});