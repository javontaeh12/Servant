import { readBlob, writeBlob } from "@/lib/blob-storage";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

const BLOB_PATH = "data/contact-submissions.json";

export async function readSubmissions(): Promise<ContactSubmission[]> {
  return readBlob<ContactSubmission[]>(BLOB_PATH, [], { noCache: true });
}

export async function saveSubmission(
  submission: Omit<ContactSubmission, "id" | "submittedAt" | "read">
): Promise<ContactSubmission> {
  const existing = await readSubmissions();
  const newEntry: ContactSubmission = {
    ...submission,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: new Date().toISOString(),
    read: false,
  };
  await writeBlob(BLOB_PATH, [newEntry, ...existing]);
  return newEntry;
}

export async function markSubmissionRead(id: string): Promise<void> {
  const existing = await readSubmissions();
  const updated = existing.map((s) => (s.id === id ? { ...s, read: true } : s));
  await writeBlob(BLOB_PATH, updated);
}

export async function deleteSubmission(id: string): Promise<void> {
  const existing = await readSubmissions();
  await writeBlob(BLOB_PATH, existing.filter((s) => s.id !== id));
}
