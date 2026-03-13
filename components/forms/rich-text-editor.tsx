'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importamos el CSS antes de la carga dinámica
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    // En react-quill-new no solemos necesitar el wrapper de forwardedRef
    // a menos que necesites manipular el DOM de Quill directamente.
    return RQ;
  },
  {
    ssr: false,
    loading: () => <div className="h-40 w-full animate-pulse bg-muted rounded-md border border-input" />
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Movido fuera para evitar re-renderizados innecesarios
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Estos son los que daban error
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ],
};

// IMPORTANTE: Si Quill se queja de "bullet", a veces es mejor dejar que
// use sus formatos por defecto eliminando la propiedad 'formats' o
// asegurándonos de que los nombres coincidan exactamente.
const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block', 'link'
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-40 w-full bg-muted rounded-md border border-input" />;
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-md border border-input overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={QUILL_MODULES}
        // formats={QUILL_FORMATS}
        placeholder={placeholder || "Escribe aquí..."}
      />

      {/* Estilos para que se vea bien con tu diseño KISS */}
      <style jsx global>{`
        .ql-container.ql-snow {
          border: none !important;
          font-size: 0.875rem; /* text-sm de Tailwind */
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid hsl(var(--input)) !important;
          background-color: hsl(var(--muted)/0.2);
        }
        .ql-editor {
          min-height: 150px;
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
