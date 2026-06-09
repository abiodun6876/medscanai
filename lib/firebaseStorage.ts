import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

export interface UploadProgress {
  percent: number;
  downloadURL?: string;
}

/**
 * Upload a medical image to Firebase Storage under the authenticated user's
 * folder and report progress via callback.
 */
export function uploadScanImage(
  file: File,
  onProgress: (p: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uid  = auth.currentUser?.uid ?? 'anonymous';
    const ext  = file.name.split('.').pop();
    const name = `${Date.now()}.${ext}`;
    const path = `scans/${uid}/${name}`;

    const storageRef  = ref(storage, path);
    const uploadTask  = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snap) => {
        const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress({ percent });
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress({ percent: 100, downloadURL });
        resolve(downloadURL);
      }
    );
  });
}
