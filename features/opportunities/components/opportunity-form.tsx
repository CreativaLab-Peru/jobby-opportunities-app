'use client';

import {useForm, FormProvider, Controller} from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
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
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";

// Custom Shared Components
import {FormField} from "@/components/forms/form-field";
import {SearchableMultiSelect} from "@/components/forms/searchable-multi-select";
import SearchableSelect from "@/components/forms/searchable-select";
import {ComboboxCreative} from "@/components/forms/combobox-creative";
import {DatePicker} from "@/components/forms/date-picker";
import {Opportunity} from "@prisma/client";
import {useEffect} from "react";

interface Props {
  opportunity?: Opportunity;
  onSubmit: (data: OpportunityFormValues) => Promise<void>;
  onCancel: () => void;

  // Skills
  skillsOptions: { value: string, label: string }[];
  searchSkills: (value: string) => Promise<{ value: string, label: string }[]>;
  createSkill: (name: string) => Promise<{ value: string, label: string } | null>;

  // Areas
  areaOptions: { value: string, label: string }[]; // Recibimos las áreas del padre
  searchAreas: (value: string) => Promise<{ value: string, label: string }[]>;
  createArea: (name: string) => Promise<{ value: string, label: string } | null>;

  // Organizations
  organizationOptions: { value: string, label: string, logoUrl?: string }[];
  searchOrganizations: (value: string) => Promise<{ value: string, label: string }[]>;
  createOrganization: (name: string) => Promise<{ value: string, label: string } | null>;
}

export default function OpportunityForm({
                                          opportunity,
                                          onSubmit,
                                          onCancel,
                                          skillsOptions,
                                          areaOptions,
                                          createSkill,
                                          searchSkills,
                                          createArea,
                                          searchAreas,
                                          organizationOptions,
                                          searchOrganizations,
                                          createOrganization
                                        }: Props) {
  const methods = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema as any),
    defaultValues: {
      type: '', title: '', organization: '', url: '', description: '',
      eligibleLevels: [], eligibleCountries: [], tags: [],
      requiredSkills: [], optionalSkills: [], fieldOfStudy: '',
      modality: '', language: '', currency: 'USD', deadline: undefined,
      fundingAmount: undefined,
      salaryRange: {min: undefined, max: undefined},
      area: '',
    }
  });

  const {reset, register, control, handleSubmit, formState: {errors, isSubmitting}} = methods;

  useEffect(() => {
    if (opportunity) {
      // Transformamos el modelo de Prisma al esquema de Zod
      reset({
        type: opportunity.type,
        title: opportunity.title,
        organization: opportunity.organization || '',
        organizationLogoUrl: opportunity.organizationLogoUrl || '',
        url: opportunity.url || '',
        description: opportunity.description || '',
        location: opportunity.ubication || '', // Mapeo de ubication -> location
        eligibleLevels: opportunity.eligibleLevels,
        eligibleCountries: opportunity.eligibleCountries,
        area: opportunity.fieldOfStudy || '', // Mapeo de fieldOfStudy -> area
        requiredSkills: opportunity.requiredSkills,
        optionalSkills: opportunity.optionalSkills,
        modality: opportunity.modality,
        language: opportunity.language || 'EN',
        currency: opportunity.currency || 'USD',
        deadline: opportunity.deadline ? new Date(opportunity.deadline) : undefined,
        salaryRange: {
          min: opportunity.minSalary ?? undefined,
          max: opportunity.maxSalary ?? undefined,
        },
        yearSalary: opportunity.yearSalary ?? undefined,
      });
    }
  }, [opportunity, reset]);

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
            {/* Fila 1: Tipo y Título */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Tipo de Oportunidad *" error={errors.type?.message}>
                <Controller
                  control={control}
                  name="type"
                  render={({field}) => (
                    <SearchableSelect
                      options={OPPORTUNITY_TYPES}
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar tipo..."
                      searchPlaceholder="Buscar tipo..."
                    />
                  )}
                />
              </FormField>
              <FormField label="URL de oportunidad *" error={errors.url?.message}>
                <Input {...register('url')} type="url" placeholder="https://ejemplo.com"/>
              </FormField>
            </div>

            {/* Fila 2: Área y Organización */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Título *" error={errors.title?.message}>
                <Input {...register('title')} placeholder="Ej: Beca de Postgrado"/>
              </FormField>
              <FormField label="Área de Conocimiento *" error={errors.area?.message}>
                <Controller
                  control={control}
                  name="area"
                  render={({field}) => (
                    <ComboboxCreative
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar área..."
                      onCreate={createArea}
                      onSearch={searchAreas}
                      options={areaOptions}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Fila 3: URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Organización" error={errors.organization?.message}>
                <Controller
                  control={control}
                  name="organization"
                  render={({field}) => (
                    <ComboboxCreative
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar organizacion..."
                      onCreate={createOrganization}
                      onSearch={searchOrganizations}
                      options={organizationOptions}
                      image={true}
                    />
                  )}
                />
              </FormField>
              <FormField label="Ubicacion" error={errors.organization?.message}>
                <Input {...register('location')} placeholder="Ubicacion de la oportunidad"/>
              </FormField>
            </div>

            <FormField label="Descripción" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Breve resumen de la oportunidad..."
                        className="min-h-[120px]"/>
            </FormField>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: REQUISITOS Y ELEGIBILIDAD */}
        <Card>
          <CardHeader>
            <CardTitle>
              Requisitos y Alcance
              <span className="text-muted-foreground text-xs">{" "}(Filtros excluyentes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Niveles Educativos</Label>
                <Controller
                  control={control}
                  name="eligibleLevels"
                  render={({field}) => (
                    <SearchableMultiSelect
                      options={LEVELS}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: Practicante, Profesional..."
                    />
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label>Países Elegibles </Label>
                <Controller
                  control={control}
                  name="eligibleCountries"
                  render={({field}) => (
                    <SearchableMultiSelect
                      options={ELEGIBLE_COUNTRIES}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: Perú, México..."
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Habilidades Requeridas</Label>
                <Controller
                  control={control}
                  name="requiredSkills"
                  render={({field}) => (
                    <SearchableMultiSelect
                      options={skillsOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: Creativo, Trabajo en Equipo..."
                      onCreate={createSkill}
                      onSearch={searchSkills}
                    />
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label>Habilidades Opcionales</Label>
                <Controller
                  control={control}
                  name="optionalSkills"
                  render={({field}) => (
                    <SearchableMultiSelect
                      options={skillsOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: Creativo, Trabajo en Equipo..."
                      onCreate={createSkill}
                      onSearch={searchSkills}
                    />
                  )}
                />
              </div>
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
                  render={({field}) => (
                    <SearchableSelect
                      options={MODALITIES}
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar"
                      searchPlaceholder="Buscar"
                    />
                  )}
                />
              </FormField>

              <FormField label="Idioma Principal" error={errors.language?.message}>
                <Controller
                  control={control}
                  name="language"
                  render={({field}) => (
                    <SearchableSelect
                      options={LANGUAGES}
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar"
                      searchPlaceholder="Buscar"
                    />
                  )}
                />
              </FormField>

              <FormField label="Fecha Límite" error={errors.deadline?.message}>
                <Controller
                  control={control}
                  name="deadline"
                  render={({field}) => (
                    <DatePicker
                      value={field.value} // El valor debe ser un objeto Date
                      onChange={field.onChange}
                      placeholder="Seleccione la fecha límite"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <FormField label="Moneda">
                <Controller
                  control={control}
                  name="currency"
                  render={({field}) => (
                    <SearchableSelect
                      options={CURRENCIES}
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Seleccionar"
                      searchPlaceholder="Buscar"
                    />
                  )}
                />
              </FormField>
              <FormField label="Monto Total">
                <Input type="number" {...register('yearSalary')} placeholder="0.00"/>
              </FormField>
              <FormField label="Salario Min">
                <Input type="number" {...register('salaryRange.min')} placeholder="Mínimo"/>
              </FormField>
              <FormField label="Salario Max">
                <Input type="number" {...register('salaryRange.max')} placeholder="Máximo"/>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* ACCIONES */}
        <div className="flex justify-end gap-4">
          <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Guardando..." : opportunity ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
