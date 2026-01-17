// components/forms/DynamicListInput.tsx
import { useState } from 'react';

interface Props {
  label: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
  color?: 'indigo' | 'gray';
}

export const DynamicListInput = ({ label, values, onChange, placeholder, color = 'indigo' }: Props) => {
  const [temp, setTemp] = useState('');
  const bgClass = color === 'indigo' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800';

  const add = () => {
    if (temp.trim() && !values.includes(temp.trim())) {
      onChange([...values, temp.trim()]);
      setTemp('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-gray-800 text-white rounded-md">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((item, i) => (
          <span key={i} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${bgClass}`}>
            {item}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};
