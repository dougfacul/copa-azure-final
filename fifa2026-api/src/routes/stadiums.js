const express = require('express');
const { query, sql, getConnection } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/stadiums - Lista todos os estádios
router.get('/', async (req, res) => {
  try {
    const { country } = req.query;
    
    let queryString = 'SELECT * FROM stadiums WHERE 1=1';
    const params = [];
    
    if (country) {
      queryString += ` AND country = @param${params.length}`;
      params.push(country);
    }

    queryString += ' ORDER BY name';

    const result = await query(queryString, params);
    res.json({ stadiums: result.recordset });
  } catch (err) {
    console.error('Erro ao buscar estádios:', err);
    res.status(500).json({ error: 'Erro ao buscar estádios' });
  }
});

// GET /api/stadiums/:id - Busca estádio por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM stadiums WHERE id = @param0',
      [req.params.id]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Estádio não encontrado' });
    }

    res.json({ stadium: result.recordset[0] });
  } catch (err) {
    console.error('Erro ao buscar estádio:', err);
    res.status(500).json({ error: 'Erro ao buscar estádio' });
  }
});

// GET /api/stadiums/:id/matches - Busca jogos do estádio
router.get('/:id/matches', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        m.id, m.date, m.time, m.stage, m.group_name,
        ht.name as home_team_name, ht.flag as home_team_flag,
        at.name as away_team_name, at.flag as away_team_flag
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at ON m.away_team_id = at.id
      WHERE m.stadium_id = @param0
      ORDER BY m.date, m.time
    `, [req.params.id]);

    res.json({ matches: result.recordset });
  } catch (err) {
    console.error('Erro ao buscar jogos do estádio:', err);
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

// POST /api/stadiums - Criar novo estádio (Admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, city, country, capacity, image, description, inauguration_year, latitude, longitude } = req.body;

    if (!name || !city || !country || !capacity) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('city', sql.VarChar, city)
      .input('country', sql.VarChar, country)
      .input('capacity', sql.Int, capacity)
      .input('image', sql.VarChar, image || null)
      .input('description', sql.Text, description || null)
      .input('inauguration_year', sql.Int, inauguration_year || null)
      .input('latitude', sql.Decimal(9, 6), latitude || null)
      .input('longitude', sql.Decimal(9, 6), longitude || null)
      .query(`
        INSERT INTO stadiums (name, city, country, capacity, image, description, inauguration_year, latitude, longitude, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @city, @country, @capacity, @image, @description, @inauguration_year, @latitude, @longitude, GETDATE())
      `);

    res.status(201).json({ stadium: result.recordset[0], message: 'Estádio criado com sucesso' });
  } catch (err) {
    console.error('Erro ao criar estádio:', err);
    res.status(500).json({ error: 'Erro ao criar estádio' });
  }
});

// PUT /api/stadiums/:id - Atualizar estádio (Admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, city, country, capacity, image, description, inauguration_year, latitude, longitude } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.VarChar, name)
      .input('city', sql.VarChar, city)
      .input('country', sql.VarChar, country)
      .input('capacity', sql.Int, capacity)
      .input('image', sql.VarChar, image || null)
      .input('description', sql.Text, description || null)
      .input('inauguration_year', sql.Int, inauguration_year || null)
      .input('latitude', sql.Decimal(9, 6), latitude || null)
      .input('longitude', sql.Decimal(9, 6), longitude || null)
      .query(`
        UPDATE stadiums
        SET name = @name, city = @city, country = @country, capacity = @capacity,
            image = @image, description = @description,
            inauguration_year = @inauguration_year, latitude = @latitude, longitude = @longitude
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Estádio não encontrado' });
    }

    res.json({ stadium: result.recordset[0], message: 'Estádio atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar estádio:', err);
    res.status(500).json({ error: 'Erro ao atualizar estádio' });
  }
});

// DELETE /api/stadiums/:id - Excluir estádio (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM stadiums OUTPUT DELETED.id WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Estádio não encontrado' });
    }

    res.json({ message: 'Estádio excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir estádio:', err);
    res.status(500).json({ error: 'Erro ao excluir estádio' });
  }
});

module.exports = router;
