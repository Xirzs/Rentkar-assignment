import React from "react";

interface Document {
  id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ApproveDocumentsFormProps {
  documents: Document[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ApproveDocumentsForm: React.FC<ApproveDocumentsFormProps> = ({ documents, onApprove, onReject }) => (
  <form className="space-y-4">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.status}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <button
                type="button"
                className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                onClick={() => onApprove(doc.id)}
                disabled={doc.status === "APPROVED"}
              >
                Approve
              </button>
              <button
                type="button"
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                onClick={() => onReject(doc.id)}
                disabled={doc.status === "REJECTED"}
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </form>
);

export default ApproveDocumentsForm;
