'use client';
import {useRouter} from 'next/navigation';
import {useSession} from '@/lib/auth-client';
import OpportunityForm from '@/components/opportunity-form';
import {OpportunityFormData} from '@/app/types/opportunity';
import {useCreateOpportunity} from "@/features/opportunities/hooks/use-create-opportunity";
import {useSkills} from "@/features/skills/hooks/use-skills";
import {useMemo} from "react";

export default function NewOpportunityPage() {

  // Data & Hooks
  const {data: session, isPending} = useSession();
  const {createOpportunity, isSubmitting} = useCreateOpportunity(session?.user?.id);
  const {skills, fetchSkills, createSkill} = useSkills()

  // router
  const router = useRouter();

  // Handlers Create
  const handleCreate = async (formData: OpportunityFormData) => {
    try {
      await createOpportunity(formData);
      router.push('/dashboard');
    } catch (error: any) {
      // El error ya lo maneja el hook o puedes mostrar un toast aquí
      alert(error.message);
    }
  };

  // Skills options
  const skillOptions = useMemo(() => {
    return skills.map(skill => ({
      label: skill.name,
      value: skill.id,
    }));
  }, [skills]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nueva Oportunidad
      </h1>

      <OpportunityForm
        skillsOptions={skillOptions}
        onSubmit={handleCreate}
        onCancel={() => router.push('/dashboard')}
        searchSkills={fetchSkills}
        createSkill={createSkill}
      />
    </main>
  );
}
