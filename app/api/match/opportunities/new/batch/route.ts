import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
    const userID = '6939a5f01042d2f41784c67c'
    try {
        const body = await request.json();
        const listOfOpportunities = body.opportunities;

        for (const opp of listOfOpportunities) {
            const createData = {
                type: opp.type,
                title: opp.title,
                organization: opp.organization,
                url: opp.url || null,
                description: opp.description || null,
                eligibleLevels: opp.eligibleLevels || [],
                eligibleCountries: opp.eligibleCountries || [],
                tags: opp.tags || [],
                requiredSkills: opp.requiredSkills || [],
                optionalSkills: opp.optionalSkills || [],
                userId: userID,
                fieldOfStudy: opp.fieldOfStudy || null,
                modality: opp.modality || null,
                language: opp.language || null,
                fundingAmount: opp.fundingAmount ? parseFloat(opp.fundingAmount) : null,
                currency: opp.currency || null,
                popularityScore: opp.popularityScore ? parseInt(opp.popularityScore) : 0,
                deadline: opp.deadline ? new Date(opp.deadline) : null,
                salaryRange: (opp.salaryRange?.min || opp.salaryRange?.max) ? {
                    min: opp.salaryRange.min ? parseFloat(opp.salaryRange.min) : null,
                    max: opp.salaryRange.max ? parseFloat(opp.salaryRange.max) : null,
                } : null
            };

            const opportunity = await prisma.opportunity.create({
                data: createData
            });
            console.log('Oportunidad creada exitosamente:', opportunity.id);
        }

        return NextResponse.json({ok: true}, { status: 201 });
    } catch (error) {
        console.error('Error creando oportunidad:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json(
            { error: 'Error al crear oportunidad', details: errorMessage },
            { status: 500 }
        );
    }
}