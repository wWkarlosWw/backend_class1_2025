const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de salud
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor vivo 🔥" });
});

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({ message: "API de tareas funcionando 🚀" });
});

// Listar todas las tareas
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tasks ORDER BY id ASC", []);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al listar tareas", error);
    res.status(500).json({ error: "Error al listar tareas" });
  }
});

// Crear una nueva tarea
app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "El campo title es obligatorio" });
  }

  try {
    const result = await db.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear tarea", error);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// Marcar una tarea como completada
app.patch("/api/tasks/:id/done", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await db.query(
      "UPDATE tasks SET done = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar tarea", error);
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

// Eliminar una tarea
app.delete("/api/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar tarea", error);
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});