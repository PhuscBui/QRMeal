"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { getTableStatus, handleErrorApi } from "@/lib/utils";
import {
  CreateTableBody,
  CreateTableBodyType,
} from "@/schemaValidations/table.schema";
import { TableStatus, TableStatusValues } from "@/constants/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddTableMutation, useTableListQuery } from "@/queries/useTable";
import { toast } from "sonner";
import { useTranslations } from 'next-intl'
import FloorMapPicker from '@/components/floor-map-picker'

export default function AddTable() {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  
  const locationOptions = [
    { label: t("window"), value: "Window" },
    { label: t("center"), value: "Center" },
    { label: t("patio"), value: "Patio" },
    { label: t("bar"), value: "Bar" },
    { label: t("privateRoom"), value: "Private Room" },
  ];
  
  const [open, setOpen] = useState(false);
  const addTableMutation = useAddTableMutation();
  const tablesQuery = useTableListQuery();
  const existingTables = tablesQuery.data?.payload.result ?? [];
  
  const form = useForm<CreateTableBodyType>({
    resolver: zodResolver(CreateTableBody),
    defaultValues: {
      number: 0,
      capacity: 2,
      status: TableStatus.Hidden,
      location: "",
      x: undefined,
      y: undefined,
      shape: undefined,
    },
  });
  const reset = () => {
    form.reset();
  };
  const onSubmit = async (values: CreateTableBodyType) => {
    if (addTableMutation.isPending) return;
    try {
      const result = await addTableMutation.mutateAsync(values);
      toast(tCommon("success"), {
        description: result.payload.message,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };
  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {t('addTable')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('addTable')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e);
            })}
            onReset={reset}
            className="space-y-6"
            id="add-table-form"
          >
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/80 pb-2 border-b">
                {t('basicInfo') || 'Thông tin cơ bản'}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="number" className="text-sm font-medium">
                        {t('tableNumber')}
                      </Label>
                      <FormControl>
                        <Input
                          id="number"
                          type="number"
                          className="w-full"
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="capacity" className="text-sm font-medium">
                        {t('capacity')}
                      </Label>
                      <FormControl>
                        <Input
                          id="capacity"
                          className="w-full"
                          type="number"
                          placeholder="2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">
                        {tCommon('status')}
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TableStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getTableStatus(status)}
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">
                        {t('location')}
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectLocation')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vị trí trên sơ đồ */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="x"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input 
                          type="hidden" 
                          value={field.value ?? ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="y"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input 
                          type="hidden" 
                          value={field.value ?? ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FloorMapPicker
                  onPositionSelect={(position) => {
                    if (position) {
                      form.setValue('x', position.x)
                      form.setValue('y', position.y)
                    } else {
                      form.setValue('x', undefined)
                      form.setValue('y', undefined)
                    }
                  }}
                  initialPosition={
                    form.watch('x') !== undefined && form.watch('y') !== undefined
                      ? { x: form.watch('x')!, y: form.watch('y')! }
                      : undefined
                  }
                  existingTables={existingTables}
                />
                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">
                        {t('shape') || 'Hình dạng'}
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectShape') || 'Chọn hình dạng'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="circle">{t('circle') || 'Tròn'}</SelectItem>
                          <SelectItem value="rect">{t('rect') || 'Vuông'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            {tCommon('cancel') || 'Hủy'}
          </Button>
          <Button 
            type="submit" 
            form="add-table-form"
            disabled={addTableMutation.isPending}
          >
            {addTableMutation.isPending ? tCommon('adding') || 'Đang thêm...' : t('addTable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
