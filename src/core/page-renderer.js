export async function renderPageToCanvas(page, canvas, scale = 1.5) {
  const viewport = page.getViewport({ scale });

  const context = canvas.getContext('2d', {
    alpha: false,
  });

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return {
    width: canvas.width,
    height: canvas.height,
  };
}