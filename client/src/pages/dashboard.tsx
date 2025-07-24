import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";

interface DashboardStats {
  totalPatients: number;
  todayBills: number;
  todayRevenue: number;
  pendingBills: number;
  recentPatients: Array<{
    id: number;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>;
  recentBills: Array<{
    id: number;
    billNumber: string;
    total: string;
    status: string;
    patient: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Hospital management overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-6 w-16 mb-4" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Hospital management overview" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-medical-blue text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-medical-green mr-1 w-4 h-4" />
              <span className="text-medical-green">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Bills</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.todayBills || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-medical-green text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-medical-green mr-1 w-4 h-4" />
              <span className="text-gray-500">Bills created</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-medical-orange text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-medical-green mr-1 w-4 h-4" />
              <span className="text-gray-500">Total collected</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Bills</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingBills || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="text-medical-red text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="text-medical-red mr-1 w-4 h-4" />
              <span className="text-gray-500">Awaiting payment</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
            <div className="space-y-4">
              {stats?.recentPatients.length ? (
                stats.recentPatients.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index % 3 === 0 ? 'bg-medical-blue' : 
                        index % 3 === 1 ? 'bg-medical-green' : 'bg-medical-orange'
                      }`}>
                        <span className="text-white font-medium text-sm">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-500">ID: P{patient.id.toString().padStart(6, '0')}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent patients</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h3>
            <div className="space-y-4">
              {stats?.recentBills.length ? (
                stats.recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bill.billNumber}</p>
                      <p className="text-sm text-gray-500">
                        {bill.patient.firstName} {bill.patient.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(parseFloat(bill.total))}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : bill.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent bills</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
