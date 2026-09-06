const state = {
  documents: [],
  pages: [],
  layout: {
    orientation: 'portrait',
    slidesPerA4: 3,
    border: false,
  },
};

export function getState() {
  return state;
}

export function addDocument(document) {
  state.documents.push(document);
}

export function addPages(pages) {
  state.pages.push(...pages);
}

export function clearWorkspace() {
  state.documents.length = 0;
  state.pages.length = 0;
  Object.assign(state.layout, {
    orientation: 'portrait',
    slidesPerA4: 3,
    border: false,
  });
}

export function getLayoutConfig() {
  return state.layout;
}

export function updateLayoutConfig(updates) {
  Object.assign(state.layout, updates);
}

export function updatePage(pageId, updates) {
  const page = state.pages.find((item) => item.id === pageId);

  if (page) {
    Object.assign(page, updates);
  }
}

export function getActivePages() {
  return state.pages.filter((page) => !page.removed);
}

export function getPageCounts() {
  const total = state.pages.length;
  const removed = state.pages.filter((page) => page.removed).length;
  const blank = state.pages.filter((page) => page.blank).length;
  const final = total - removed;

  return {
    total,
    removed,
    blank,
    final,
  };
}