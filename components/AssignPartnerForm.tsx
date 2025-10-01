import React, { useState } from "react";

interface Partner {
  id: string;
  name: string;
}

interface AssignPartnerFormProps {
  partners: Partner[];
  onAssign: (partnerId: string) => void;
}

const AssignPartnerForm: React.FC<AssignPartnerFormProps> = ({ partners, onAssign }) => {
  const [selected, setSelected] = useState("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={e => {
        e.preventDefault();
        if (selected) onAssign(selected);
      }}
    >
      <label className="block text-sm font-medium text-gray-700">Select Partner</label>
      <select
        className="border rounded px-3 py-2"
        value={selected}
        onChange={e => setSelected(e.target.value)}
      >
        <option value="">-- Choose a partner --</option>
        {partners.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!selected}
      >
        Assign
      </button>
    </form>
  );
};

export default AssignPartnerForm;
