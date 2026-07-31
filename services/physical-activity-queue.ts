import type { GpsPointInput, QueuedGpsPoint } from "@/types";

const DATABASE_NAME = "eduquest-physical-activity";
const DATABASE_VERSION = 1;
const STORE_NAME = "gps-points";
const ACTIVITY_QUEUE_INDEX = "activity-queued-at";
const QUEUED_AT_INDEX = "queued-at";

let databasePromise: Promise<IDBDatabase> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function openQueueDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB tidak tersedia."));
  }

  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      store.createIndex(ACTIVITY_QUEUE_INDEX, ["activityId", "queuedAt"]);
      store.createIndex(QUEUED_AT_INDEX, "queuedAt");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error);
    };
  });

  return databasePromise;
}

export async function enqueueGpsPoint(
  activityId: number,
  point: GpsPointInput
): Promise<QueuedGpsPoint> {
  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const done = transactionDone(transaction);
  const entry: QueuedGpsPoint = {
    ...point,
    key: `${activityId}:${point.clientPointId}`,
    activityId,
    queuedAt: Date.now(),
  };

  transaction.objectStore(STORE_NAME).put(entry);
  await done;

  return entry;
}

export async function listQueuedGpsPoints(
  activityId: number,
  limit = 100
): Promise<QueuedGpsPoint[]> {
  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const done = transactionDone(transaction);
  const index = transaction.objectStore(STORE_NAME).index(ACTIVITY_QUEUE_INDEX);
  const range = IDBKeyRange.bound(
    [activityId, 0],
    [activityId, Number.MAX_SAFE_INTEGER]
  );
  const entries: QueuedGpsPoint[] = [];

  await new Promise<void>((resolve, reject) => {
    const request = index.openCursor(range);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor || entries.length >= limit) {
        resolve();
        return;
      }

      entries.push(cursor.value as QueuedGpsPoint);
      cursor.continue();
    };
  });

  await done;

  return entries;
}

export async function acknowledgeGpsPoints(
  activityId: number,
  clientPointIds: string[]
): Promise<void> {
  if (clientPointIds.length === 0) {
    return;
  }

  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const done = transactionDone(transaction);
  const store = transaction.objectStore(STORE_NAME);

  for (const clientPointId of clientPointIds) {
    store.delete(`${activityId}:${clientPointId}`);
  }

  await done;
}

export async function countQueuedGpsPoints(activityId: number): Promise<number> {
  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const done = transactionDone(transaction);
  const index = transaction.objectStore(STORE_NAME).index(ACTIVITY_QUEUE_INDEX);
  const count = await requestResult(
    index.count(IDBKeyRange.bound(
      [activityId, 0],
      [activityId, Number.MAX_SAFE_INTEGER]
    ))
  );

  await done;

  return count;
}

export async function purgeExpiredGpsPoints(expiredBefore: number): Promise<void> {
  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const done = transactionDone(transaction);
  const index = transaction.objectStore(STORE_NAME).index(QUEUED_AT_INDEX);

  await new Promise<void>((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.upperBound(expiredBefore));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor) {
        resolve();
        return;
      }

      cursor.delete();
      cursor.continue();
    };
  });

  await done;
}

export async function clearPhysicalActivityQueue(): Promise<void> {
  const database = await openQueueDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const done = transactionDone(transaction);
  transaction.objectStore(STORE_NAME).clear();
  await done;
}
