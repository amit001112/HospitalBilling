import { User } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title = "Dashboard", subtitle = "Hospital management overview" }: Partial<HeaderProps>) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 no-print">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentDate}</p>
            <p className="text-xs text-gray-500">Last sync: Just now</p>
          </div>
          <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
