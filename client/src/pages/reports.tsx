import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Percent, Download } from "lucide-react";
import Header from "@/components/layout/header";

export default function Reports() {
  const handleDownloadReport = (reportType: string) => {
    // In a real implementation, this would generate and download the report
    console.log(`Downloading ${reportType} report...`);
  };

  return (
    <>
      <Header title="Reports & Analytics" subtitle="View financial and operational reports" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Monthly Revenue</h4>
              <TrendingUp className="text-medical-blue text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">₹1,25,450</p>
            <p className="text-sm text-gray-500">March 2024</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-medical-blue rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Patient Growth</h4>
              <Users className="text-medical-green text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">+18%</p>
            <p className="text-sm text-gray-500">vs last month</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-medical-green rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Collection Rate</h4>
              <Percent className="text-medical-orange text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">94.5%</p>
            <p className="text-sm text-gray-500">Bills collected</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-medical-orange rounded-full" style={{ width: '94.5%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h4>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => handleDownloadReport('daily-revenue')}
              >
                <span className="font-medium text-gray-900">Daily Revenue Report</span>
                <Download className="text-medical-blue w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => handleDownloadReport('patient-list')}
              >
                <span className="font-medium text-gray-900">Patient List Report</span>
                <Download className="text-medical-blue w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => handleDownloadReport('outstanding-bills')}
              >
                <span className="font-medium text-gray-900">Outstanding Bills</span>
                <Download className="text-medical-blue w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Patients</span>
                <span className="font-medium text-gray-900">248</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bills This Month</span>
                <span className="font-medium text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Bill Value</span>
                <span className="font-medium text-gray-900">₹804</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Amount</span>
                <span className="font-medium text-medical-red">₹12,450</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
