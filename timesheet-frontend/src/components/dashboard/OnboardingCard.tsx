import React, { useState } from 'react';
import { CheckCircleIcon, CircleStackIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
  category: 'profile' | 'documents' | 'training';
}

const OnboardingCard: React.FC = () => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    { id: '1', title: 'Complete profile information', completed: true, category: 'profile' },
    { id: '2', title: 'Upload profile photo', completed: true, category: 'profile' },
    { id: '3', title: 'Submit KYC documents', completed: true, category: 'documents' },
    { id: '4', title: 'Bank account verification', completed: false, category: 'documents' },
    { id: '5', title: 'Complete compliance training', completed: false, category: 'training' },
    { id: '6', title: 'Review company policies', completed: false, category: 'training' },
    { id: '7', title: 'Set up email preferences', completed: false, category: 'profile' },
    { id: '8', title: 'Join team communication channels', completed: false, category: 'training' }
  ]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  const toggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'documents':
        return <CircleStackIcon className="w-4 h-4" />;
      case 'training':
        return <AcademicCapIcon className="w-4 h-4" />;
      default:
        return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'profile':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'documents':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'training':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-purple-600" />
          Onboarding Progress
        </h3>
        <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
          <span className="text-xs font-bold text-purple-700">
            {completedTasks}/{totalTasks}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Completion</span>
          <span className="font-bold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
              task.completed 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => toggleTask(task.id)}
          >
            {/* Checkbox */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              task.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-slate-300 hover:border-purple-400'
            }`}>
              {task.completed && (
                <CheckCircleIcon className="w-3 h-3 text-white" />
              )}
            </div>

            {/* Category Icon */}
            <div className={`p-1.5 rounded-lg border ${getCategoryColor(task.category)}`}>
              {getCategoryIcon(task.category)}
            </div>

            {/* Task Title */}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                task.completed ? 'text-slate-500 line-through' : 'text-slate-800'
              }`}>
                {task.title}
              </p>
            </div>

            {/* Status */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.completed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {task.completed ? 'Done' : 'Pending'}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          {progressPercentage === 100 ? 'Onboarding Complete! 🎉' : 'Continue Onboarding'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingCard;
