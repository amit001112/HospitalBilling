import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertBillSchema, type Patient, type ServiceItem } from "@shared/schema";
import { z } from "zod";

const billFormSchema = insertBillSchema.extend({
  billDate: z.string().min(1, "Bill date is required"),
});

type BillFormData = z.infer<typeof billFormSchema>;

interface BillFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}



export default function BillForm({ onSuccess, onCancel }: BillFormProps) {
  const { toast } = useToast();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: serviceItems = [] } = useQuery<ServiceItem[]>({
    queryKey: ["/api/service-items"],
  });

  const form = useForm<BillFormData>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      patientId: 0,
      billDate: new Date().toISOString().split('T')[0],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: "pending",
      notes: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const watchDiscount = form.watch("discount");

  // Calculate totals whenever items or discount change
  const subtotal = watchItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = 0; // No GST
  const total = subtotal - watchDiscount;

  // Update form values when calculations change
  form.setValue("subtotal", subtotal);
  form.setValue("tax", tax);
  form.setValue("total", total);

  const mutation = useMutation({
    mutationFn: async (data: BillFormData) => {
      const billData = {
        ...data,
        billDate: new Date(data.billDate),
      };
      const response = await apiRequest("POST", "/api/bills", billData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Bill created",
        description: "New bill has been created successfully.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BillFormData) => {
    mutation.mutate(data);
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = serviceItems.find((s: ServiceItem) => s.id.toString() === serviceId);
    if (service) {
      form.setValue(`items.${index}.description`, service.name);
      form.setValue(`items.${index}.rate`, parseFloat(service.price));
      updateItemAmount(index);
    }
  };


  const updateItemAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 1;
    const rate = form.getValues(`items.${index}.rate`) || 0;
    const discount = form.getValues(`items.${index}.discount`) || 0;
    const amount = (quantity * rate) - discount;
    form.setValue(`items.${index}.amount`, amount);
  };

  const addItem = () => {
    append({ description: "", quantity: 1, rate: 0, discount: 0, amount: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Patient *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.firstName} {patient.lastName} (P{patient.id.toString().padStart(6, '0')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Bill Items</h4>
            <Button type="button" onClick={addItem} className="bg-medical-green hover:bg-green-700">
              <Plus className="mr-2 w-4 h-4" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                    <div>
                      <FormLabel>S/No</FormLabel>
                      <Input
                        value={index + 1}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormLabel>Service/Item *</FormLabel>
                      <Select
                        onValueChange={(value) => handleServiceChange(index, value)}
                        value=""
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceItems.map((service: ServiceItem) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name} - ₹{service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input placeholder="Or enter custom description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseInt(e.target.value));
                                updateItemAmount(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate (₹) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value));
                                updateItemAmount(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.discount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                updateItemAmount(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">
                        Total: <span className="text-medical-blue">₹{(watchItems[index]?.amount || 0).toFixed(2)}</span>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-medical-red hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Bill Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-20 text-sm"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  <span className="text-sm text-gray-500">₹</span>
                </div>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-medical-blue">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes or instructions" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="bg-medical-blue hover:bg-blue-700">
            {mutation.isPending ? "Creating..." : "Create Bill"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
