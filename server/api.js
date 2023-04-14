const express = require('express');
const router = express.Router();
const {
  getTeams,
  addPlayer,
  updatePlayer,
  deletePlayer,
} = require('./firebaseMethods');

router.get('/teams/:team/players', async (req, res) => {
  const team = req.params.team;

  try {
    const teams = await getTeams();
    const teamData = teams.find((t) => t.name === team);
    if (teamData) {
      res.json(teamData.players);
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teams/:team/players', async (req, res) => {
  const team = req.params.team;
  const newPlayer = req.body;

  try {
    const teams = await getTeams();
    const teamData = teams.find((t) => t.name === team);
    if (teamData) {
      const player = { ...newPlayer, teamId: teamData.id };
      const playerId = await addPlayer(player);
      res.json({ ...player, id: playerId });
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/teams/:team/players/:id', async (req, res) => {
  const team = req.params.team;
  const playerId = req.params.id;
  const updatedPlayer = req.body;

  try {
    const teams = await getTeams();
    const teamData = teams.find((t) => t.name === team);
    if (teamData) {
      const player = teamData.players.find((p) => p.id === playerId);
      if (player) {
        await updatePlayer(playerId, updatedPlayer);
        res.json({ ...updatedPlayer, id: playerId });
      } else {
        res.status(404).json({ error: 'Player not found' });
      }
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/teams/:team/players/:id', async (req, res) => {
  const team = req.params.team;
  const playerId = req.params.id;

  try {
    const teams = await getTeams();
    const teamData = teams.find((t) => t.name === team);
    if (teamData) {
      const player = teamData.players.find((p) => p.id === playerId);
      if (player) {
        await deletePlayer(playerId);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Player not found' });
      }
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
