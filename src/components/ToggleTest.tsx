import { useState } from 'react';
import { Play, Square } from 'lucide-react';

export function ToggleTest() {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !isEnabled;
    console.log(`🧪 ToggleTest: ${isEnabled} → ${newState}`);
    setIsEnabled(newState);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Toggle Test Component</h3>
      <div className="space-y-4">
        <div>
          <p>Current State: <strong>{isEnabled ? 'ENABLED' : 'DISABLED'}</strong></p>
        </div>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 ${
            isEnabled 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isEnabled ? (
            <>
              <Square className="w-4 h-4" />
              Stop Test
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Test
            </>
          )}
        </button>
      </div>
    </div>
  );
}
