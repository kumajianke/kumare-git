const DB_NAME = 'KumaCodeManagerDB';
const DB_VERSION = 1;
const STORE_DOCUMENTS = 'documents';
const STORE_IMAGES = 'images';

export interface DocumentData {
    id: string;
    title: string;
    content: string; // Markdown with kuma-image:// IDs
    updatedAt: number;
}

export interface ImageData {
    id: string;
    blob: Blob;
    createdAt: number;
}

export class DB {
    private db: IDBDatabase | null = null;

    constructor() {}

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event);
                reject('Error opening database');
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
                    db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(STORE_IMAGES)) {
                    db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
                }
            };
        });
    }

    async saveImage(blob: Blob): Promise<string> {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const transaction = this.db!.transaction([STORE_IMAGES], 'readwrite');
            const store = transaction.objectStore(STORE_IMAGES);
            
            const imageData: ImageData = {
                id,
                blob,
                createdAt: Date.now()
            };

            const request = store.add(imageData);

            request.onsuccess = () => resolve(id);
            request.onerror = () => reject('Error saving image');
        });
    }

    async getImage(id: string): Promise<Blob | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_IMAGES], 'readonly');
            const store = transaction.objectStore(STORE_IMAGES);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result as ImageData;
                resolve(result ? result.blob : null);
            };
            request.onerror = () => reject('Error getting image');
        });
    }

    async saveDocument(doc: DocumentData): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readwrite');
            const store = transaction.objectStore(STORE_DOCUMENTS);
            const request = store.put(doc);

            request.onsuccess = () => resolve();
            request.onerror = () => reject('Error saving document');
        });
    }

    async getDocument(id: string): Promise<DocumentData | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readonly');
            const store = transaction.objectStore(STORE_DOCUMENTS);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result as DocumentData || null);
            };
            request.onerror = () => reject('Error getting document');
        });
    }
}

export const db = new DB();
