const databaseName = 'pdf-2-printable';
const databaseVersion = 1;
const workflowStoreName = 'workflow';
const workflowKey = 'current';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(workflowStoreName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction(mode, callback) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(workflowStoreName, mode);
    const store = transaction.objectStore(workflowStoreName);
    let result;

    try {
      result = callback(store);
    } catch (error) {
      database.close();
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export function saveWorkflow(workflow) {
  return runTransaction('readwrite', (store) => {
    store.put(workflow, workflowKey);
  });
}

export function loadWorkflow() {
  return runTransaction('readonly', (store) => new Promise((resolve, reject) => {
    const request = store.get(workflowKey);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  }));
}

export function clearPersistedWorkflow() {
  return runTransaction('readwrite', (store) => {
    store.delete(workflowKey);
  });
}