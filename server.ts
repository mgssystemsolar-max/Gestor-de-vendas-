import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { db } from "./src/lib/firebaseAdmin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/leads", async (req, res) => {
    const { phone, name, kwh, value, type, payback } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Telefone é obrigatório" });
    }

    try {
      const database = db(); // Lazy initialization
      
      // Referência do Lead no Firebase usando o Telefone como ID único
      const leadRef = database.collection('leads_solar').doc(phone);

      const leadData = {
        nome: name || "Cliente Novo",
        telefone: phone,
        consumo_kwh: parseFloat(kwh) || 0,
        valor_fatura: parseFloat(value) || 0,
        tipo_ligacao: type || "Bifásico",
        payback_estimado: payback || 0,
        status: "Novo", // Todo lead começa na primeira coluna do Kanban
        data_criacao: new Date().toISOString(),
        ultimo_contato: new Date().toISOString()
      };

      // Salva ou Atualiza (merge: true não apaga dados antigos se já existirem)
      await leadRef.set(leadData, { merge: true });

      return res.status(200).json({ success: true, message: "Lead salvo no MGS COMMAND" });
    } catch (error: any) {
      console.error("Erro ao salvar lead:", error);
      return res.status(500).json({ error: error.message || "Falha na gravação" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
