import { Link, useLocation } from "wouter";
import { Hospital, BarChart3, Users, FileText, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Billing", href: "/billing", icon: FileText },
  { name: "Services", href: "/services", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: TrendingUp },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col no-print">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
            <Hospital className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Lifeline Emergency Care</h1>
            <p className="text-sm text-gray-500">Billing System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-medical-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="mr-3 w-5 h-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-medical-green rounded-full"></div>
          <span className="text-gray-600">Offline Mode Active</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Data stored locally</p>
      </div>
    </div>
  );
}
