# Importación masiva de Oportunidades (CSV)

Este documento describe el modelo CSV recomendado para importar oportunidades en masa en la aplicación.

Ubicación del template:
 - `public/templates/opportunities-template.csv`

Formato general
 - Encoding: UTF-8
 - Separador: coma `,`
 - Para listas usar `;` como separador interno (por ejemplo `react;nextjs;prisma`).
 - Fechas: `YYYY-MM-DD` o ISO8601.
 - Booleanos: `true|false|1|0|yes|no` (insensible a mayúsculas).

Cabeceras (orden y descripción)
1. type (string) — Required. Enum: INTERNSHIP, SCHOLARSHIP, EXCHANGE_PROGRAM, EMPLOYMENT, RESEARCH_FELLOWSHIP, GRADUATE_PROGRAM, FREELANCE, FULL_TIME, PART_TIME, COMPETITION, OTHER
2. title (string) — Required. Título de la oportunidad.
3. organization_key (string) — Optional. Key interna de la organización (preferida si existe).
4. organization_name (string) — Optional. Nombre de la organización; si no existe se puede crear según la política.
5. organizationLogoUrl (string) — Optional. URL del logo.
6. url (string) — Optional. URL externa de la publicación.
7. description (string/HTML) — Optional. Puede contener HTML (ej: generado por un editor WYSIWYG). Será sanitizado.
8. location (string) — Optional. Ciudad y/o país.
9. areas (list) — Optional. Lista separada por `;` de keys o nombres de áreas.
10. requiredSkills (list) — Optional. Lista separada por `;` de skills.
11. optionalSkills (list) — Optional.
12. eligibleCountries (list) — Optional. Códigos ISO2 separados por `;`.
13. eligibleLevels (list) — Optional. Niveles elegibles (JUNIOR;MID;SENIOR...)
14. modality (string) — Optional. Enum: REMOTE, HYBRID, ON_SITE
15. language (string) — Optional. ISO 639-1 (ES, EN)
16. minSalary (number) — Optional.
17. maxSalary (number) — Optional.
18. yearSalary (number) — Optional.
19. currency (string) — Optional. Ej: USD
20. deadline (date) — Optional. `YYYY-MM-DD` o ISO8601
21. isRecurring (boolean) — Optional. true/false
22. status (string) — Reservado. Campo actualmente no procesado por el import (el estado se define internamente).
23. external_id (string) — Reservado. Campo actualmente no procesado por el import.
24. notes (string) — Reservado. Campo actualmente no procesado por el import.
    Nota: Los campos `status`, `external_id` y `notes` están reservados para futuras extensiones del import y, en la implementación actual, se ignoran y no afectan al resultado de la importación.


Ejemplo de uso
 - Descarga `public/templates/opportunities-template.csv`
 - Rellena filas adicionales siguiendo el formato.
 - En la UI (próxima implementación), realiza upload para previsualizar y validar.

Políticas recomendadas
 - Parsing en cliente para permitir preview y validación antes de enviar.
 - Separador de listas `;`.
 - Crear automáticamente skills si no existen (opción configurable).
 - Buscar organizaciones por `organization_key` o `organization_name`; crear si no existe dependiendo de la política.

Validación
 - El servidor debe validar exhaustivamente cada fila y devolver un reporte por fila con errores y warnings.
 - En modo `strict` las filas con errores no se procesan; en modo `lenient` las filas con warnings se procesan creando entidades faltantes cuando sea posible.

Si quieres que empiece a implementar la funcionalidad completa (UI + endpoint + procesador), confirma las siguientes decisiones:
 - ¿Parsing en cliente o en servidor? (recomendado: cliente)
 - ¿Crear automáticamente skills/organizaciones ausentes o fallar filas? (recomendado: crear por defecto, con toggle)
 - ¿Criterio de upsert?: usar `external_id`|`url`|`none` (recomendado: `external_id` si disponible, si no crear nueva)

