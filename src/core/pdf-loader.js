import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function loadPdf(file) {
  if (!(file instanceof File)) {
    throw new Error('Invalid file.');
  }

  if (file.type !== 'application/pdf') {
    throw new Error(`"${file.name}" is not a PDF file.`);
  }

  const arrayBuffer = await file.arrayBuffer();

 const pdf = await pdfjsLib.getDocument({
  data: new Uint8Array(arrayBuffer),
  isEvalSupported: false,
  wasmUrl: '/node_modules/pdfjs-dist/wasm/',
}).promise;

  return pdf;
}