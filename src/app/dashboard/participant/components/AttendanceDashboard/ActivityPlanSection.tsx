import React, { useState } from 'react';


interface ActivityPlanSectionProps {
  onClick?: () => void;
  activities?: string[] | null;
  loading?: boolean;
  error?: string | null;
}

const ActivityPlanSection: React.FC<ActivityPlanSectionProps> = ({ onClick, activities, loading, error }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <div className="mb-4">
      <button
        className="text-blue-600 font-medium hover:underline focus:outline-none focus:underline text-base"
        onClick={handleClick}
        aria-expanded={expanded}
        aria-controls="activity-plan-detail"
        type="button"
      >
        Today's Activity Plan
      </button>
      <hr className="my-3 border-gray-200" />
      {expanded && (
        <div id="activity-plan-detail" className="bg-gray-50 rounded p-3 text-gray-700 text-sm mt-2">
          {loading ? (
            <span>Loading...</span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : activities && activities.length > 0 ? (
            <ul className="list-disc pl-5">
              {activities.map((act, idx) => (
                <li key={idx}>{act}</li>
              ))}
            </ul>
          ) : (
            <span>No activities planned for today.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityPlanSection;
