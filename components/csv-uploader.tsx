"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type CsvRow = Record<string, string>;

export default function CsvUploader() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: unknown) => {
        setParsing(false);
        const res = results as { data?: unknown[]; errors?: Array<{ row?: number; message?: string }> };
        if (res.errors && res.errors.length > 0) {
          setErrors(res.errors.map(e => `Fila ${e.row ?? '?'}: ${e.message ?? 'Error de parse'}`));
        } else {
          setErrors([]);
        }
        if (Array.isArray(res.data)) setRows(res.data as CsvRow[]);
      },
      error: (err: unknown) => {
        setParsing(false);
        if (err && typeof err === 'object' && 'message' in err) {
          setErrors([(err as any).message || String(err)]);
        } else {
          setErrors([String(err)]);
        }
      }
    });
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    try {
      const res = await fetch('/api/opportunities/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, options: { createMissingSkills: true, createMissingOrgs: true } })
      });
      if (!res.ok) {
        const text = await res.text();
        setErrors([`Error del servidor: ${text}`]);
      } else {
        alert('Importación iniciada. Revisa el resumen en la consola.');
        const json = await res.json();
        console.log('Bulk import result', json);
      }
    } catch (error) {
      setErrors([String(error)]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Importar CSV</Button>
      </DialogTrigger>
      <DialogContent className={'min-w-6xl'}>
        <DialogHeader>
          <DialogTitle>Importar Oportunidades desde CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {parsing && <p>Parseando archivo...</p>}

          {fileName && <p>Archivo: {fileName} — {rows.length} filas</p>}

          {errors.length > 0 && (
            <div className="text-sm text-destructive">
              <strong>Errores:</strong>
              <ul>
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-auto max-h-60 border rounded p-2">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(rows[0]).slice(0, 8).map((h) => (
                      <th key={h} className="text-left pr-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, idx) => (
                    <tr key={idx}>
                      {Object.values(r).slice(0, 8).map((v, j) => (
                        <td key={j} className="pr-2">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => { setRows([]); setErrors([]); setFileName(null); }}>Limpiar</Button>
          <Button onClick={handleImport} disabled={rows.length === 0}>Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

