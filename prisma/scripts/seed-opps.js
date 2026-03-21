import fs from "fs";

const sendBatch = async () => {
    const url = "http://localhost:3000/api/match/opportunities/new/batch";

    // Leer opps.json
    let opportunities = [];

    try {
        const raw = fs.readFileSync("./prisma/scripts/opps.json", "utf8");
        opportunities = JSON.parse(raw)?.opportunities;
    } catch (err) {
        console.error("❌ Error leyendo opps.json:", err);
        return;
    }

    if (!Array.isArray(opportunities) || opportunities.length === 0) {
        console.error("❌ opps.json no contiene un array válido.");
        return;
    }

    console.log(`📤 Enviando ${opportunities.length} oportunidades...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ opportunities })
        });

        const data = await response.json();
        console.log("📥 Respuesta del servidor:", data);
    } catch (err) {
        console.error("❌ Error enviando oportunidades:", err);
    }
};

sendBatch();
