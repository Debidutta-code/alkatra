import { RatePlan } from '../types';
import { MoreVertical } from 'lucide-react';

interface RatePlanTableProps {
  ratePlans: RatePlan[];
  toggleDropdown: (ratePlanId: string) => void;
  buttonRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}

export default function RatePlanTable({ ratePlans, toggleDropdown, buttonRefs }: RatePlanTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Rate Plan Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Rate Plan Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Meal Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Currency
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Scheduling
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ratePlans.map((ratePlan) => (
              <tr key={ratePlan._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {ratePlan.ratePlanCode}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {ratePlan.ratePlanName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {ratePlan.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {ratePlan.mealPlan}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {ratePlan.currency}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ratePlan.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ratePlan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {ratePlan.scheduling.type}
                </td>
                <td className="px-4 py-3 text-right relative">
                  <button
                    ref={(el) => {
                      if (el) {
                        buttonRefs.current.set(ratePlan._id, el);
                      } else {
                        buttonRefs.current.delete(ratePlan._id);
                      }
                    }}
                    onClick={() => toggleDropdown(ratePlan._id)}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none"
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}