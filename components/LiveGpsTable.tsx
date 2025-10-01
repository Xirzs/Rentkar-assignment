import React from "react";

export type GpsData = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt: string;
};

interface LiveGpsTableProps {
  data: GpsData[];
}

const LiveGpsTable: React.FC<LiveGpsTableProps> = ({ data }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => (
          <tr key={row.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.lat}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.lng}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.updatedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LiveGpsTable;
