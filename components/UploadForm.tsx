'use client';

import { useState } from 'react';

export function UploadForm() {
  const [fileName, setFileName] = useState<string>('');
  const [message, setMessage] = useState<string>('No file selected yet.');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('');
      setMessage('No file selected yet.');
      return;
    }

    setFileName(file.name);
    setMessage(`Ready to analyze ${file.name}.`);
  };

  return (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <label className="block text-sm font-medium text-slate-300">Upload medical image</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-500"
      />
      <p className="mt-4 text-sm text-slate-400">{message}</p>
      {fileName ? (
        <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-slate-200">
          <p className="font-semibold">Selected file:</p>
          <p>{fileName}</p>
        </div>
      ) : null}
    </div>
  );
}
