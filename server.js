const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
// Helper functions
const getNotes = () => {
  try {
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
  } catch (error) {
    return [];
  }
};

const createNotes = (notes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
};

app.get('/api/notes', (req, res) => {
  const notes = getNotes();
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const notes = getNotes();
  const { titulo, texto } = req.body;
  
  if (!titulo || !texto) {
    return res.status(400).json({ error: 'Título e texto são obrigatórios' });
  }

  const newNote = {
    id: Date.now().toString(), // Adicionando ID único
    titulo,
    texto,
    criadoEm: new Date().toISOString()
  };
  
  notes.push(newNote);
  createNotes(notes);
  res.status(201).json(newNote);
});

app.get('/api/notes/:id', (req, res) => {
  const notes = getNotes();
  const note = notes.find(n => n.id === req.params.id);
  
  if (!note) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  
  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  
  const { titulo, texto } = req.body;
  
  if (!titulo || !texto) {
    return res.status(400).json({ error: 'Título e texto são obrigatórios' });
  }

  notes[index] = { 
    ...notes[index], 
    titulo, 
    texto 
  };
  
  createNotes(notes);
  res.json(notes[index]);
});

app.delete('/api/notes/:id', (req, res) => {
  let notes = getNotes();
  const initialLength = notes.length;
  
  notes = notes.filter(note => note.id !== req.params.id);
  
  if (notes.length === initialLength) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  
  createNotes(notes);
  res.status(204).send();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Criar arquivo notes.json se não existir
  if (!fs.existsSync(DATA_FILE)) {
    createNotes([]);
  }
});