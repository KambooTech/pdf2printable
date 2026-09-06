import '../styles/base.css';
import './app.css';


import { loadPdf } from '../core/pdf-loader.js';
import { renderPageToCanvas } from '../core/page-renderer.js';

import {
  addDocument,
  addPages,
  clearWorkspace,
  getLayoutConfig,
  getPageCounts,
  getState,
  updateLayoutConfig,
} from '../state/workspace-store.js';
import {
  clearPersistedWorkflow,
  loadWorkflow,
  saveWorkflow,
} from '../state/workflow-persistence.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-page">

    <div
      id="workflowRestoreLoader"
      class="workflow-restore-loader"
      role="status"
      aria-live="polite"
    >
      <div class="workflow-restore-spinner" aria-hidden="true"></div>
      <p>Restoring your workspace…</p>
    </div>

    <div id="workflowRestoreToast" class="workflow-restore-toast" role="status" aria-live="polite" hidden>
      Refresh successful
    </div>

    <header class="app-header">
      <a class="brand" href="/">
        <img
          class="brand-icon"
          src="/favicon.png"
          alt="PDF 2 PRINTABLE"
        />

        <span class="brand-name">PDF 2 PRINTABLE</span>
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

        <button
          class="start-conversion-button"
          id="startConversionButton"
          type="button"
        >
          Start Conversion
        </button>

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






<div id="pdfWorkflow" class="pdf-workflow" hidden>

  <header class="workflow-header">
    <div class="workflow-brand">
      <img src="/favicon.png" alt="" />
      <div class="workflow-heading">
        <strong id="workflowStepTitle">Select PDF Files</strong>
        <span id="workflowStepSubtitle" hidden></span>
      </div>
    </div>

    <nav class="workflow-navigation" aria-label="PDF workflow navigation">
      <button
        id="workflowBackButton"
        class="workflow-nav-button"
        type="button"
        aria-label="Go to previous step"
        title="Back"
      >
        ←
      </button>

      <button
        id="workflowForwardButton"
        class="workflow-nav-button"
        type="button"
        aria-label="Go to next step"
        title="Next"
      >
        →
      </button>
    </nav>

    <button
      id="workflowCancelButton"
      class="workflow-cancel-button"
      type="button"
    >
      Cancel
    </button>
  </header>

  <div class="workflow-body">

<section
  id="pdfSelectionScreen"
  class="pdf-selection-screen workflow-step"
  data-workflow-step="pdf-selection"
  hidden
>

  <div class="pdf-selection-header">
    <h2>Select PDF Files</h2>
    <p>Select one or more PDFs to continue.</p>
  </div>

  <div id="selectedPdfList" class="selected-pdf-list"></div>

  <button
    id="selectPdfChooseButton"
    class="secondary-button selection-choose-button"
    type="button"
  >
    + Add More PDF
  </button>

  <div class="pdf-selection-footer">
    <strong id="selectedPdfCount">0 PDFs selected</strong>

    <button
      id="selectPdfNextButton"
      class="continue-pages-button"
      type="button"
      disabled
    >
      Next →
    </button>
  </div>

</section>



<section
  id="pdfLoadingScreen"
  class="pdf-loading-screen workflow-step"
  data-workflow-step="pdf-preparing"
  hidden
>

  <div class="pdf-loading-content">

    <div class="pdf-loading-icon" aria-hidden="true">📄</div>

    <h2>Preparing your PDF…</h2>

    <p>
      Loading pages and preparing your workspace.
    </p>

    <div class="pdf-loading-progress-row">
      <div
        class="pdf-loading-progress-track"
        role="progressbar"
        aria-label="PDF preparation progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="0"
      >
        <div id="pdfLoadingProgress" class="pdf-loading-progress"></div>
      </div>

      <strong id="pdfLoadingPercentage">0%</strong>
    </div>

    <span id="pdfLoadingStatus">Preparing pages…</span>
    <div id="pdfWorkflowError" class="pdf-error workflow-error" hidden></div>

  </div>

</section>





        <section
          id="pageManager"
          class="page-manager workflow-step"
          data-workflow-step="page-manager"
          hidden
        >

  <div class="page-stats" id="pageStats"></div>

  <div
    class="page-grid"
    id="pageGrid"
  ></div>

  <div class="page-manager-continue">
  <button
    id="continuePagesButton"
    class="continue-pages-button"
    type="button"
  >
    Continue with <span id="continuePagesCount">0</span> Pages →
  </button>
</div>

</section>

<section
  id="layoutScreen"
  class="layout-screen workflow-step"
  data-workflow-step="layout"
  hidden
>
  <div class="layout-header">
    <h2>Choose Layout</h2>
    <p>Select how your pages should be arranged on A4.</p>
  </div>

  <div class="layout-options">
    <fieldset class="layout-option-group">
      <legend>A4 orientation</legend>
      <div class="layout-choice-grid layout-orientation-choices">
        <label class="layout-choice-card">
          <input type="radio" name="orientation" value="portrait" />
          <span class="layout-choice-content">
            <strong>A4 Portrait</strong>
          </span>
        </label>
        <label class="layout-choice-card">
          <input type="radio" name="orientation" value="landscape" />
          <span class="layout-choice-content">
            <strong>A4 Landscape</strong>
          </span>
        </label>
      </div>
    </fieldset>

    <fieldset class="layout-option-group">
      <legend>Slides per A4</legend>
      <div class="layout-choice-grid layout-slides-choices">
        ${[1, 2, 3, 4, 6, 8, 10].map((slides) => `
          <label class="layout-choice-card">
            <input type="radio" name="slidesPerA4" value="${slides}" />
            <span class="layout-choice-content">
              <strong>${slides} slide${slides === 1 ? '' : 's'} / A4</strong>
            </span>
          </label>
        `).join('')}
      </div>
    </fieldset>

    <fieldset class="layout-option-group">
      <legend>Border</legend>
      <div class="layout-choice-grid layout-border-choices">
        <label class="layout-choice-card">
          <input type="radio" name="border" value="on" />
          <span class="layout-choice-content">
            <strong>Border ON</strong>
          </span>
        </label>
        <label class="layout-choice-card">
          <input type="radio" name="border" value="off" />
          <span class="layout-choice-content">
            <strong>Border OFF</strong>
          </span>
        </label>
      </div>
    </fieldset>
  </div>

  <div class="layout-continue">
    <button id="continueLayoutButton" class="continue-pages-button" type="button">
      Continue →
    </button>
  </div>
</section>

<section
  class="workflow-placeholder workflow-step"
  data-workflow-step="preview"
  hidden
>
  <span class="workflow-placeholder-icon">◫</span>
  <h2>Preview</h2>
  <p>Review your printable pages before conversion.</p>
</section>

<section
  class="workflow-placeholder workflow-step"
  data-workflow-step="conversion"
  hidden
>
  <span class="workflow-placeholder-icon">↻</span>
  <h2>Conversion</h2>
  <p>Your printable PDF will be prepared here.</p>
</section>

<section
  class="workflow-placeholder workflow-step"
  data-workflow-step="complete"
  hidden
>
  <span class="workflow-placeholder-icon">✓</span>
  <h2>Complete</h2>
  <p>Your printable PDF is ready.</p>
</section>

</div>

<div
  id="removePdfModal"
  class="remove-pdf-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="removePdfModalTitle"
  hidden
>
  <div class="remove-pdf-modal-card">
    <h2 id="removePdfModalTitle">Delete PDF?</h2>
    <p>Do you want to delete this PDF?</p>
    <strong id="removePdfFilename"></strong>
    <div class="remove-pdf-modal-actions">
      <button id="cancelRemovePdfButton" class="secondary-button" type="button">
        Cancel
      </button>
      <button id="confirmRemovePdfButton" class="remove-confirm-button" type="button">
        Delete
      </button>
    </div>
  </div>
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
const startConversionButton = document.querySelector('#startConversionButton');
const uploadZone = document.querySelector('#uploadZone');
const pdfStatus = document.querySelector('#pdfStatus');
const workflowRestoreLoader = document.querySelector('#workflowRestoreLoader');
const workflowRestoreToast = document.querySelector('#workflowRestoreToast');

const pdfWorkflow = document.querySelector('#pdfWorkflow');
const pageManager = document.querySelector('#pageManager');
const pageGrid = document.querySelector('#pageGrid');
const pageStats = document.querySelector('#pageStats');

const pdfSelectionScreen = document.querySelector('#pdfSelectionScreen');
const selectedPdfList = document.querySelector('#selectedPdfList');
const selectedPdfCount = document.querySelector('#selectedPdfCount');
const selectPdfNextButton = document.querySelector('#selectPdfNextButton');
const selectPdfChooseButton = document.querySelector('#selectPdfChooseButton');
const removePdfModal = document.querySelector('#removePdfModal');
const removePdfFilename = document.querySelector('#removePdfFilename');
const cancelRemovePdfButton = document.querySelector('#cancelRemovePdfButton');
const confirmRemovePdfButton = document.querySelector('#confirmRemovePdfButton');
const pdfLoadingScreen = document.querySelector('#pdfLoadingScreen');
const pdfLoadingProgress = document.querySelector('#pdfLoadingProgress');
const pdfLoadingPercentage = document.querySelector('#pdfLoadingPercentage');
const pdfLoadingStatus = document.querySelector('#pdfLoadingStatus');
const pdfWorkflowError = document.querySelector('#pdfWorkflowError');
const pdfLoadingProgressTrack = document.querySelector(
  '.pdf-loading-progress-track'
);
const workflowStepTitle = document.querySelector('#workflowStepTitle');
const workflowStepSubtitle = document.querySelector('#workflowStepSubtitle');
const workflowBackButton = document.querySelector('#workflowBackButton');
const workflowForwardButton = document.querySelector('#workflowForwardButton');
const workflowCancelButton = document.querySelector('#workflowCancelButton');
const continuePagesButton = document.querySelector('#continuePagesButton');
const continueLayoutButton = document.querySelector('#continueLayoutButton');
const layoutScreen = document.querySelector('#layoutScreen');
const workflowStepElements = document.querySelectorAll('[data-workflow-step]');
const layoutInputs = layoutScreen.querySelectorAll('input');

let selectedPdfFiles = [];
let selectedPdfDocuments = [];
let pendingPdfDocuments = [];
let selectionMode = 'initial';
let currentWorkflowStep = 'upload';
let preparationFailed = false;
let preparationInProgress = false;
let documentSequence = 0;
let pdfPendingRemovalKey = null;
let persistenceWrite = Promise.resolve();
let restoringWorkflow = false;

const workflowStepTitles = {
  'pdf-selection': 'Select PDF Files',
  'pdf-preparing': 'Preparing PDF',
  'page-manager': 'Pages',
  layout: 'Layout',
  preview: 'Preview',
  conversion: 'Conversion',
  complete: 'Complete',
};

const workflowStepSubtitles = {
  'page-manager': 'Choose, remove or restore pages before conversion.',
};

choosePdfButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();

  pdfInput.click();
});

startConversionButton.addEventListener('click', () => {
  openPdfSelection('initial');
  persistWorkflow();
});

pdfInput.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) {
    return;
  }


  console.log('Selected files:', files);

  const shouldAppend = selectionMode === 'append' ||
    (currentWorkflowStep === 'pdf-selection' &&
      getState().documents.length > 0);

  if (shouldAppend) {
    selectionMode = 'append';
    showPdfLoadingScreen();
    await yieldToBrowser();
    await renderPdfSelection(files, { append: true });
  } else {
    selectedPdfFiles = files;
    showPdfLoadingScreen();
    await yieldToBrowser();
    await renderPdfSelection(files);
  }

  showWorkflowStep('pdf-selection');
  persistWorkflow();

  // Same PDF ko dobara select karne ki permission
  pdfInput.value = '';
});


selectPdfNextButton.addEventListener('click', async () => {
  await handleSelectionForward();
});

selectPdfChooseButton.addEventListener('click', () => {
  selectionMode = 'append';
  pdfInput.click();
});

selectedPdfList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-pdf-key]');

  if (!removeButton) {
    return;
  }

  const selectedDocument = selectedPdfDocuments.find(
    ({ selectionKey }) => selectionKey === removeButton.dataset.removePdfKey
  );

  if (selectedDocument) {
    openRemovePdfModal(selectedDocument);
  }
});

cancelRemovePdfButton.addEventListener('click', closeRemovePdfModal);

confirmRemovePdfButton.addEventListener('click', () => {
  if (pdfPendingRemovalKey) {
    removeSelectedPdf(pdfPendingRemovalKey);
  }

  closeRemovePdfModal();
});

removePdfModal.addEventListener('click', (event) => {
  if (event.target === removePdfModal) {
    closeRemovePdfModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !removePdfModal.hidden) {
    closeRemovePdfModal();
  }
});

workflowBackButton.addEventListener('click', async () => {
  if (currentWorkflowStep === 'page-manager') {
    showWorkflowStep('pdf-selection');
    selectionMode = 'initial';
    return;
  }

  if (currentWorkflowStep === 'pdf-selection' && selectionMode === 'append') {
    showWorkflowStep('page-manager');
    return;
  }

  if (currentWorkflowStep === 'pdf-preparing' && preparationFailed) {
    showWorkflowStep('pdf-selection');
    return;
  }

  const previousSteps = {
    layout: 'page-manager',
    preview: 'layout',
    conversion: 'preview',
    complete: 'conversion',
  };

  const previousStep = previousSteps[currentWorkflowStep];

  if (previousStep) {
    if (previousStep === 'page-manager') {
      await renderPageManager();
    }

    showWorkflowStep(previousStep);
  }
});

workflowForwardButton.addEventListener('click', async () => {
  await handleWorkflowForward();
});

workflowCancelButton.addEventListener('click', () => {
  cancelWorkflow();
});

continuePagesButton.addEventListener('click', () => {
  showWorkflowStep('layout');
});

continueLayoutButton.addEventListener('click', () => {
  showWorkflowStep('conversion');
});

layoutInputs.forEach((input) => {
  input.addEventListener('change', () => {
    const updates = {};

    if (input.name === 'orientation') {
      updates.orientation = input.value;
    }

    if (input.name === 'slidesPerA4') {
      updates.slidesPerA4 = Number(input.value);
    }

    if (input.name === 'border') {
      updates.border = input.value === 'on';
    }

    updateLayoutConfig(updates);
    persistWorkflow();
  });
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
  selectionMode = 'initial';
  selectedPdfFiles = files;
  showPdfLoadingScreen();
  await yieldToBrowser();
  await renderPdfSelection(files);
  showWorkflowStep('pdf-selection');
  persistWorkflow();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getFileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function persistWorkflow() {
  if (restoringWorkflow || currentWorkflowStep === 'upload') {
    return;
  }

  const state = getState();
  const sourceFiles = [...selectedPdfFiles];

  selectedPdfDocuments.forEach(({ file }) => {
    if (!sourceFiles.some((selectedFile) => getFileKey(selectedFile) === getFileKey(file))) {
      sourceFiles.push(file);
    }
  });

  state.documents.forEach(({ file }) => {
    if (!sourceFiles.some((selectedFile) => getFileKey(selectedFile) === getFileKey(file))) {
      sourceFiles.push(file);
    }
  });

  const workflow = {
    version: 1,
    currentWorkflowStep,
    selectionMode,
    files: [],
    documents: state.documents.map(({ id, name, file, pageCount }) => ({
      id,
      name,
      fileKey: getFileKey(file),
      pageCount,
    })),
    pages: state.pages.map(({ id, documentId, pageNumber, removed, blank }) => ({
      id,
      documentId,
      pageNumber,
      removed,
      blank,
    })),
    layout: { ...getLayoutConfig() },
  };

  persistenceWrite = persistenceWrite
    .then(async () => {
      workflow.files = await Promise.all(sourceFiles.map(serializeFile));
      await saveWorkflow(workflow);
    })
    .catch(() => {});
}

async function serializeFile(file) {
  return {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}

function restoreFile(fileData) {
  if (fileData instanceof File) {
    return fileData;
  }

  if (!fileData || !fileData.bytes || !fileData.name) {
    throw new Error('Saved PDF data is missing.');
  }

  const bytes = fileData.bytes instanceof Uint8Array
    ? fileData.bytes
    : new Uint8Array(fileData.bytes);

  return new File([bytes], fileData.name, {
    type: fileData.type || 'application/pdf',
    lastModified: fileData.lastModified || Date.now(),
  });
}

async function restoreWorkflow() {
  restoringWorkflow = true;
  let restored = false;

  try {
    const workflow = await loadWorkflow();

    if (!workflow || workflow.version !== 1 || !Array.isArray(workflow.files) ||
      !Array.isArray(workflow.documents) || !Array.isArray(workflow.pages)) {
      return;
    }

    const restoredFiles = workflow.files.map(restoreFile);
    const filesByKey = new Map(
      restoredFiles.map((file) => [getFileKey(file), file])
    );
    const restoredDocuments = [];
    const restoredPdfsByKey = new Map();

    for (const documentData of workflow.documents) {
      const file = filesByKey.get(documentData.fileKey);

      if (!file) {
        throw new Error('Saved PDF data is missing.');
      }

      const pdf = await loadPdf(file);
      restoredPdfsByKey.set(getFileKey(file), pdf);
      restoredDocuments.push({
        ...documentData,
        file,
        pageCount: pdf.numPages,
        pdf,
      });
    }

    const restoredSelectedDocuments = [];

    for (const file of restoredFiles) {
      const fileKey = getFileKey(file);
      const pdf = restoredPdfsByKey.get(fileKey) || await loadPdf(file);

      restoredPdfsByKey.set(fileKey, pdf);
      restoredSelectedDocuments.push({
        file,
        pdf,
        previewReady: true,
        selectionKey: fileKey,
      });
    }

    const state = getState();
    state.documents.push(...restoredDocuments);
    state.pages.push(...workflow.pages);
    updateLayoutConfig({
      orientation: workflow.layout?.orientation === 'landscape'
        ? 'landscape'
        : 'portrait',
      slidesPerA4: [1, 2, 3, 4, 6, 8, 10].includes(workflow.layout?.slidesPerA4)
        ? workflow.layout.slidesPerA4
        : 3,
      border: workflow.layout?.border === true,
    });

    selectedPdfDocuments = restoredSelectedDocuments;
    selectedPdfFiles = restoredSelectedDocuments.map(({ file }) => file);
    selectionMode = workflow.selectionMode || 'initial';
    await renderSelectedPdfList();
    await renderPageManager();
    renderLayoutConfig();
    const restoredStep = workflow.currentWorkflowStep === 'pdf-preparing'
      ? 'pdf-selection'
      : workflow.currentWorkflowStep || 'page-manager';

    showWorkflowStep(restoredStep);
    restored = true;
  } catch (error) {
    clearWorkspace();
    await clearPersistedWorkflow().catch(() => {});
  } finally {
    restoringWorkflow = false;
    workflowRestoreLoader.hidden = true;

    if (restored) {
      workflowRestoreToast.hidden = false;
      window.setTimeout(() => {
        workflowRestoreToast.hidden = true;
      }, 1000);
    }
  }
}

async function renderSelectedPdfList() {
  selectedPdfList.innerHTML = '';

  selectedPdfDocuments.forEach(({ file, pdf }) => {
    const card = document.createElement('article');

    card.className = 'selected-pdf-card';
    card.dataset.pdfCardKey = getFileKey(file);
    card.innerHTML = `
      <button
        class="remove-pdf-button"
        type="button"
        data-remove-pdf-key="${escapeHtml(getFileKey(file))}"
        aria-label="Remove PDF"
        title="Remove PDF"
      >
        ×
      </button>
      <div class="selected-pdf-preview"></div>
      <div class="selected-pdf-info">
        <strong>${escapeHtml(file.name)}</strong>
        <span>${pdf?.numPages || 0} pages</span>
      </div>
    `;
    selectedPdfList.appendChild(card);
  });

  await Promise.all(
    Array.from(selectedPdfList.querySelectorAll('.selected-pdf-card'))
      .map((card) => renderPdfSelectionThumbnail(
        selectedPdfDocuments.find(({ file }) => (
          getFileKey(file) === card.dataset.pdfCardKey
        ))?.pdf,
        card.querySelector('.selected-pdf-preview'),
        true
      ))
  );

  updateSelectedPdfCount();
  selectPdfNextButton.disabled = selectedPdfDocuments.length === 0;
}

async function renderPdfSelectionThumbnail(pdf, container, replace = false) {
  if (!pdf || !container) {
    throw new Error('Saved PDF document is unavailable.');
  }

  if (replace) {
    container.innerHTML = '';
  }

  const page = await pdf.getPage(1);
  const canvas = document.createElement('canvas');

  await renderPageToCanvas(page, canvas, 0.5);
  container.appendChild(canvas);
}

function updateSelectedPdfCount() {
  const count = selectedPdfDocuments.length;
  selectedPdfCount.textContent = `${count} PDF${count === 1 ? '' : 's'} selected`;
  updateWorkflowNavigation();
}

function openRemovePdfModal(selectedDocument) {
  pdfPendingRemovalKey = selectedDocument.selectionKey;
  removePdfFilename.textContent = selectedDocument.file.name;
  removePdfModal.hidden = false;
  cancelRemovePdfButton.focus();
}

function closeRemovePdfModal() {
  pdfPendingRemovalKey = null;
  removePdfModal.hidden = true;
}

function removeSelectedPdf(selectionKey) {
  const selectedIndex = selectedPdfDocuments.findIndex(
    ({ selectionKey: documentKey }) => documentKey === selectionKey
  );

  if (selectedIndex === -1) {
    return;
  }

  selectedPdfDocuments.splice(selectedIndex, 1);
  pendingPdfDocuments = pendingPdfDocuments.filter(
    ({ selectionKey: documentKey }) => documentKey !== selectionKey
  );
  selectedPdfFiles = selectedPdfDocuments.map(({ file }) => file);

  const card = selectedPdfList.querySelector(
    `[data-pdf-card-key="${CSS.escape(selectionKey)}"]`
  );

  card?.remove();
  updateSelectedPdfCount();
  selectPdfNextButton.disabled = selectedPdfDocuments.length === 0;
  persistWorkflow();
}

function openPdfSelection(mode) {
  selectionMode = mode;
  pendingPdfDocuments = [];

  if (mode === 'initial') {
    selectedPdfFiles = [];
    selectedPdfDocuments = [];
  }

  if (mode === 'initial') {
    selectedPdfList.innerHTML = '';
    updateSelectedPdfCount();
  } else {
    updateSelectedPdfCount();
  }
  selectPdfNextButton.disabled = true;
  showWorkflowStep('pdf-selection');
}

function showWorkflowStep(step) {
  currentWorkflowStep = step;
  pdfWorkflow.hidden = step === 'upload';
  pdfWorkflow.classList.toggle('is-page-manager', step === 'page-manager');
  document.body.classList.toggle('workflow-active', step !== 'upload');

  workflowStepElements.forEach((element) => {
    element.hidden = element.dataset.workflowStep !== step;
  });

  workflowStepTitle.textContent = workflowStepTitles[step] || 'PDF 2 PRINTABLE';
  workflowStepSubtitle.textContent = workflowStepSubtitles[step] || '';
  workflowStepSubtitle.hidden = !workflowStepSubtitles[step];
  if (step === 'layout') {
    renderLayoutConfig();
  }
  updateWorkflowNavigation();
  if (step !== 'upload') {
    persistWorkflow();
  }
}

function renderLayoutConfig() {
  const layout = getLayoutConfig();

  layoutScreen.querySelector(
    `input[name="orientation"][value="${layout.orientation}"]`
  ).checked = true;
  layoutScreen.querySelector(
    `input[name="slidesPerA4"][value="${layout.slidesPerA4}"]`
  ).checked = true;
  layoutScreen.querySelector(
    `input[name="border"][value="${layout.border ? 'on' : 'off'}"]`
  ).checked = true;
}

function updateWorkflowNavigation() {
  const isSelection = currentWorkflowStep === 'pdf-selection';
  const isPreparing = currentWorkflowStep === 'pdf-preparing';
  const hasValidSelection = isSelection && (
    selectionMode === 'append'
      ? pendingPdfDocuments.length > 0 ||
        (getState().documents.length === 0 && selectedPdfDocuments.length > 0)
      : selectedPdfDocuments.length === selectedPdfFiles.length &&
        selectedPdfDocuments.length > 0
  );

  workflowBackButton.disabled =
    (isSelection && selectionMode === 'initial') ||
    (isPreparing && !preparationFailed);

  workflowForwardButton.hidden =
    currentWorkflowStep === 'pdf-selection' ||
    currentWorkflowStep === 'page-manager' ||
    currentWorkflowStep === 'layout';

  workflowForwardButton.disabled =
    (isPreparing && !preparationFailed) ||
    (isSelection && !hasValidSelection) ||
    (currentWorkflowStep === 'page-manager' && getState().pages.length === 0) ||
    currentWorkflowStep === 'complete';

  selectPdfNextButton.disabled = !hasValidSelection;
}

async function handleSelectionForward() {
  if (selectedPdfDocuments.length === 0) {
    return;
  }

  const selectedDocuments = [...selectedPdfDocuments];

  if (
    getState().documents.length > 0 &&
    workspaceMatchesSelection(selectedDocuments)
  ) {
    showWorkflowStep('page-manager');
    persistWorkflow();
    return;
  }

  if (syncWorkspaceToSelection(selectedDocuments).length === 0) {
    await renderPageManager();
    showWorkflowStep('page-manager');
    persistWorkflow();
    return;
  }

  pendingPdfDocuments = [];
  await startPreparation(selectedDocuments);
}

async function handleWorkflowForward() {
  if (currentWorkflowStep === 'pdf-selection') {
    await handleSelectionForward();
    return;
  }

  const nextSteps = {
    'page-manager': 'layout',
    layout: 'preview',
    preview: 'conversion',
    conversion: 'complete',
  };

  const nextStep = nextSteps[currentWorkflowStep];

  if (nextStep) {
    showWorkflowStep(nextStep);
  }
}

function cancelWorkflow() {
  clearWorkspace();
  selectedPdfFiles = [];
  selectedPdfDocuments = [];
  pendingPdfDocuments = [];
  selectionMode = 'initial';
  preparationFailed = false;
  preparationInProgress = false;
  selectedPdfList.innerHTML = '';
  pageGrid.innerHTML = '';
  pdfStatus.innerHTML = '';
  pdfWorkflowError.hidden = true;
  showWorkflowStep('upload');
  persistenceWrite = persistenceWrite
    .then(() => clearPersistedWorkflow())
    .catch(() => {});
}

function isSameFile(firstFile, secondFile) {
  return firstFile.name === secondFile.name &&
    firstFile.size === secondFile.size &&
    firstFile.lastModified === secondFile.lastModified;
}

function workspaceMatchesSelection(selectedDocuments) {
  const workspaceDocuments = getState().documents;

  return workspaceDocuments.length === selectedDocuments.length &&
    workspaceDocuments.every((documentData, index) => (
      isSameFile(documentData.file, selectedDocuments[index].file)
    ));
}

function getExistingFiles() {
  return selectedPdfDocuments;
}

async function renderPdfSelection(files, { append = false } = {}) {
  if (!append) {
    selectedPdfList.innerHTML = '';
  }
  const existingFiles = append ? getExistingFiles() : [];
  const filesToLoad = append
    ? files.filter((file) => !existingFiles.some(({ file: existingFile }) => (
      isSameFile(file, existingFile)
    )))
    : files;
  const documents = [];

  if (append) {
    pendingPdfDocuments = [];
  } else {
    selectedPdfDocuments = [];
  }

  updateSelectedPdfCount();
  selectPdfNextButton.disabled = true;

  const totalWork = Math.max(filesToLoad.length * 2, 1);
  let completedWork = 0;

  for (let fileIndex = 0; fileIndex < filesToLoad.length; fileIndex += 1) {
    const file = filesToLoad[fileIndex];

    try {
      updatePdfLoadingProgress(
        completedWork / totalWork,
        `Loading document ${fileIndex + 1} of ${filesToLoad.length}`
      );
      const pdf = await loadPdf(file);
      completedWork += 1;
      updatePdfLoadingProgress(
        completedWork / totalWork,
        `Preparing preview for document ${fileIndex + 1} of ${filesToLoad.length}`
      );
      const firstPage = await pdf.getPage(1);

      const canvas = document.createElement('canvas');

      await renderPageToCanvas(
        firstPage,
        canvas,
        0.5
      );

      documents.push({
        file,
        pdf,
        previewReady: true,
        selectionKey: getFileKey(file),
      });
      completedWork += 1;
      updatePdfLoadingProgress(
        completedWork / totalWork,
        `Prepared preview ${fileIndex + 1} of ${filesToLoad.length}`
      );

      const card = document.createElement('article');

      card.className = 'selected-pdf-card';
      card.dataset.pdfCardKey = getFileKey(file);

      card.innerHTML = `
        <button
          class="remove-pdf-button"
          type="button"
          data-remove-pdf-key="${escapeHtml(getFileKey(file))}"
          aria-label="Remove PDF"
          title="Remove PDF"
        >
          ×
        </button>
        <div class="selected-pdf-preview"></div>

        <div class="selected-pdf-info">
          <strong>${escapeHtml(file.name)}</strong>
          <span>${pdf.numPages} pages</span>
        </div>
      `;

      card
        .querySelector('.selected-pdf-preview')
        .appendChild(canvas);

      selectedPdfList.appendChild(card);
    } catch (error) {
      console.error(
        `Unable to preview "${file.name}"`,
        error
      );
    }
  }

  if (append) {
    pendingPdfDocuments = documents;
    selectedPdfFiles = [...selectedPdfFiles, ...filesToLoad];
    selectedPdfDocuments.push(...pendingPdfDocuments);
    updateSelectedPdfCount();
    selectPdfNextButton.disabled =
      pendingPdfDocuments.length !== filesToLoad.length ||
      (pendingPdfDocuments.length === 0 && getState().documents.length > 0);
  } else {
    selectedPdfDocuments = documents;
    updateSelectedPdfCount();
    selectPdfNextButton.disabled =
      selectedPdfDocuments.length !== filesToLoad.length ||
      selectedPdfDocuments.length === 0;
  }

  updatePdfLoadingProgress(1, 'PDF selection ready');
  updateWorkflowNavigation();
  persistWorkflow();
}




async function startPreparation(selectedDocuments, { append = false } = {}) {
  if (preparationInProgress) {
    return;
  }

  preparationFailed = false;
  pdfWorkflowError.hidden = true;
  showPdfLoadingScreen();
  preparationInProgress = true;

  await handlePdfs(selectedDocuments);
  preparationInProgress = false;
}

async function handlePdfs(selectedDocuments) {
  pdfStatus.innerHTML = '';

  try {
    choosePdfButton.disabled = true;
    choosePdfButton.textContent = 'Loading…';

    if (workspaceMatchesSelection(selectedDocuments)) {
      showWorkflowStep('page-manager');
      return;
    }

    const documentsToPrepare = syncWorkspaceToSelection(selectedDocuments);

    if (documentsToPrepare.length === 0) {
      await renderPageManager();
      showWorkflowStep('page-manager');
      return;
    }

    const totalPages = documentsToPrepare.reduce(
      (total, { pdf }) => total + pdf.numPages,
      0
    );
    const totalWork = documentsToPrepare.length + totalPages * 2;
    let completedWork = 0;

    updatePdfLoadingProgress(0, 'Preparing documents…');

    const state = getState();

    for (
      let documentIndex = 0;
      documentIndex < documentsToPrepare.length;
      documentIndex += 1
    ) {
      const selectedDocument = documentsToPrepare[documentIndex];
      const { file, pdf } = selectedDocument;

      const documentId = `document-${Date.now()}-${documentSequence}`;
      documentSequence += 1;

      addDocument({
        id: documentId,
        name: file.name,
        file,
        pageCount: pdf.numPages,
        pdf,
      });

      completedWork += 1;
      updatePdfLoadingProgress(
        completedWork / totalWork,
        `Loading document ${documentIndex + 1} of ${documentsToPrepare.length}`
      );

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = {
          id: `${documentId}-page-${pageNumber}`,
          documentId,
          pageNumber,
          removed: false,
          blank: false,
        };

        addPages([page]);
        completedWork += 1;
        updatePdfLoadingProgress(
          completedWork / totalWork,
          `Preparing pages for document ${documentIndex + 1} of ${documentsToPrepare.length}`
        );
        await yieldToBrowser();

        const card = createPageCard(page, getState().pages.length - 1);
        pageGrid.appendChild(card);
        await renderThumbnail(page, card.querySelector('.page-thumbnail'));

        completedWork += 1;
        updatePdfLoadingProgress(
          completedWork / totalWork,
          `Rendering page ${pageNumber} of ${pdf.numPages}`
        );
        await yieldToBrowser();
      }
    }

    updatePageManagerStats();
    await renderPageManager();
    updatePdfLoadingProgress(1, 'Workspace ready');
    pdfStatus.innerHTML = createPdfSuccessMessage();
    updateSelectedPdfCount();
    pendingPdfDocuments = [];
    selectionMode = 'initial';
    showWorkflowStep('page-manager');
    persistWorkflow();

  } catch (error) {
    console.error(error);

    clearWorkspace();
    pageGrid.innerHTML = '';
    preparationFailed = true;
    pdfWorkflowError.hidden = false;
    pdfWorkflowError.textContent = error.message ||
      'Unable to prepare the PDF files. Go back or cancel to try again.';
    showWorkflowStep('pdf-preparing');

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

function syncWorkspaceToSelection(selectedDocuments) {
  const state = getState();
  const retainedDocuments = selectedDocuments
    .map(({ file }) => state.documents.find((documentData) => (
      getFileKey(documentData.file) === getFileKey(file)
    )))
    .filter(Boolean);
  const retainedDocumentIds = new Set(
    retainedDocuments.map(({ id }) => id)
  );
  const retainedPages = state.pages.filter((page) => (
    page.blank || retainedDocumentIds.has(page.documentId)
  ));
  const pagesByDocumentId = new Map();

  retainedPages.forEach((page) => {
    if (!pagesByDocumentId.has(page.documentId)) {
      pagesByDocumentId.set(page.documentId, []);
    }

    pagesByDocumentId.get(page.documentId).push(page);
  });

  state.documents.length = 0;
  state.documents.push(...retainedDocuments);
  state.pages = retainedDocuments.flatMap(({ id }) => (
    pagesByDocumentId.get(id) || []
  ));
  state.pages.push(...(pagesByDocumentId.get(null) || []));
  pageGrid.innerHTML = '';

  return selectedDocuments.filter(({ file }) => (
    !state.documents.some((documentData) => (
      isSameFile(documentData.file, file)
    ))
  ));
}

function createPdfSuccessMessage() {
  const state = getState();
  const counts = getPageCounts();

  return `
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
}

function showPdfLoadingScreen() {
  showWorkflowStep('pdf-preparing');
  updatePdfLoadingProgress(0, 'Preparing documents…');
}

function updatePdfLoadingProgress(progress, status) {
  const percentage = Math.round(progress * 100);

  pdfLoadingProgress.style.width = `${percentage}%`;
  pdfLoadingPercentage.textContent = `${percentage}%`;
  pdfLoadingStatus.textContent = status;
  pdfLoadingProgressTrack.setAttribute('aria-valuenow', String(percentage));
}

function updatePageManagerStats() {
  const counts = getPageCounts();

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

  document.getElementById('continuePagesCount').textContent = counts.final;
}

function yieldToBrowser() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

async function renderPageManager() {
  const state = getState();

  pageManager.hidden = state.pages.length === 0;
  updatePageManagerStats();

  pageGrid.innerHTML = '';

  const thumbnailPromises = state.pages.map((page, index) => {
    const card = createPageCard(page, index);

    pageGrid.appendChild(card);

    return renderThumbnail(page, card.querySelector('.page-thumbnail'));
  });

  await Promise.all(thumbnailPromises);
  persistWorkflow();
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

restoreWorkflow();
