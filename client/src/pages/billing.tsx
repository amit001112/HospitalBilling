import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Printer, Trash2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import BillForm from "@/components/billing/bill-form";
import BillView from "@/components/billing/bill-view";
import Header from "@/components/layout/header";
import type { BillWithItems } from "@shared/schema";

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillWithItems | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  const { data: bills, isLoading } = useQuery<BillWithItems[]>({
    queryKey: ["/api/bills"],
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Bill deleted",
        description: "Bill has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/bills/${id}/status`, { status: "paid" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Bill marked as paid",
        description: "Bill status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bill status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleView = (bill: BillWithItems) => {
    setSelectedBill(bill);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteBillMutation.mutate(id);
    }
  };

  const handleMarkPaid = async (id: number) => {
    if (confirm("Mark this bill as paid?")) {
      markPaidMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };

  const filteredBills = bills?.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${bill.patient.firstName} ${bill.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Header title="Billing Management" subtitle="Manage bills and invoices" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-blue-700">
              <Plus className="mr-2 w-4 h-4" />
              New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
            </DialogHeader>
            <BillForm
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading bills...
                  </TableCell>
                </TableRow>
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? "No bills found matching your search." : "No bills created yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow key={bill.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{bill.billNumber}</div>
                      <div className="text-sm text-gray-500">Invoice</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-xs">
                            {bill.patient.firstName.charAt(0)}{bill.patient.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {bill.patient.firstName} {bill.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            P{bill.patient.id.toString().padStart(6, '0')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(bill.billDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(bill.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(bill.status)}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(bill)}
                          className="text-medical-blue hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(bill)}
                          className="text-medical-green hover:text-green-700"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {bill.status !== 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkPaid(bill.id)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={markPaidMutation.isPending}
                            title="Mark as Paid"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteBillMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <BillView 
              bill={selectedBill} 
              onClose={() => setIsViewOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
