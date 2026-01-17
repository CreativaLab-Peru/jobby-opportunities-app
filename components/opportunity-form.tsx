'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { OpportunityFormData } from '@/app/types/opportunity';
import {
  ELEGIBLE_COUNTRIES,
  LEVELS,
  OPPORTUNITY_TYPES,
  CURRENCIES,
  MODALITIES,
  LANGUAGES
} from "@/consts";
import {
  OpportunityFormValues,
  opportunitySchema
} from "@/features/opportunities/schemas/opportunity.schema";

// Shadcn UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Custom Shared Components
import { FormField } from "@/components/forms/form-field";
import { DynamicListInput } from "@/features/opportunities/components/forms/dynamic-list-input";
import { MultiSelectField } from "@/components/forms/multi-select-field";

interface Props {
  opportunity?: OpportunityFormData;
  onSubmit: (data: OpportunityFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function OpportunityForm({ opportunity, onSubmit, onCancel }: Props) {
  const methods = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema as any),
    defaultValues: {
      type: '', title: '', organization: '', url: '', description: '',
      eligibleLevels: [], eligibleCountries: [], tags: [],
      requiredSkills: [], optionalSkills: [], fieldOfStudy: '',
      modality: '', language: '', currency: 'USD', deadline: '',
      fundingAmount: undefined,
      salaryRange: { min: undefined, max: undefined },
      ...opportunity
    }
  });

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl space-y-8 pb-10">

        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Detalles básicos de la convocatoria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Tipo de Oportunidad *" error={errors.type?.message}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Título *" error={errors.title?.message}>
                <Input {...register('title')} placeholder="Ej: Beca de Postgrado" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Organización *" error={errors.organization?.message}>
                <Input {...register('organization')} placeholder="Nombre de la empresa o institución" />
              </FormField>
              <FormField label="URL Oficial" error={errors.url?.message}>
                <Input {...register('url')} type="url" placeholder="https://ejemplo.com" />
              </FormField>
            </div>

            <FormField label="Descripción" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Breve resumen de la oportunidad..." className="min-h-[120px]" />
            </FormField>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: REQUISITOS Y ELEGIBILIDAD */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos y Alcance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Niveles Educativos</Label>
                <div className="grid grid-cols-1 gap-2 border rounded-md p-4 bg-slate-50/50">
                  {LEVELS.map(level => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name="eligibleLevels"
                        render={({ field }) => (
                          <Checkbox
                            id={level.value}
                            checked={field.value?.includes(level.value)}
                            onCheckedChange={(checked) => {
                              const val = field.value || [];
                              field.onChange(checked ? [...val, level.value] : val.filter(v => v !== level.value));
                            }}
                          />
                        )}
                      />
                      <Label htmlFor={level.value} className="text-sm font-normal cursor-pointer">{level.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <FormField label="Países Elegibles" error={errors.eligibleCountries?.message}>
                <Controller
                  control={control}
                  name="eligibleCountries"
                  render={({ field }) => (
                    <MultiSelectField options={ELEGIBLE_COUNTRIES} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={control}
                name="requiredSkills"
                render={({ field }) => <DynamicListInput label="Habilidades Requeridas" values={field.value} onChange={field.onChange} />}
              />
              <Controller
                control={control}
                name="optionalSkills"
                render={({ field }) => <DynamicListInput label="Habilidades Opcionales" values={field.value} onChange={field.onChange} color="gray" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: CONDICIONES Y FINANZAS */}
        <Card>
          <CardHeader>
            <CardTitle>Condiciones y Finanzas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Modalidad" error={errors.modality?.message}>
                <Controller
                  control={control}
                  name="modality"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {MODALITIES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Idioma Principal" error={errors.language?.message}>
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Fecha Límite" error={errors.deadline?.message}>
                <Input type="date" {...register('deadline')} />
              </FormField>
            </div>

            <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <FormField label="Moneda">
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value} ({c.label})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Monto Total">
                <Input type="number" {...register('fundingAmount')} placeholder="0.00" />
              </FormField>
              <FormField label="Salario Min">
                <Input type="number" {...register('salaryRange.min')} placeholder="Mínimo" />
              </FormField>
              <FormField label="Salario Max">
                <Input type="number" {...register('salaryRange.max')} placeholder="Máximo" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* ACCIONES */}
        <div className="flex justify-end gap-4">
          <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Guardando..." : opportunity ? "Actualizar" : "Publicar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
