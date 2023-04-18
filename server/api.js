
const teamData = require('../src/team.json');
const express = require('express');
const router = express.Router();


// add custom routes

router.get('/teams', (req,res) => (
    res.json(teamData,'hello')
) )

router.get('/teams/players', (req, res) => {
    res.json(teamData.teamA.players);
  });
  

router.post('teams/players', (req, res) => {
    const newPlayer = req.body;
    teamData.players.push(newPlayer);
    res.json(newPlayer);
});

router.put('teams/players/:id', (req, res) => {
    const playerId = parseInt(req.params.id, 10);
    const updatedPlayer = req.body;
    const index = teamData.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
        teamData.players[index] = updatedPlayer;
        res.json(updatedPlayer);
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

router.delete('/players/:id', (req, res) => {
    const playerId = parseInt(req.params.id, 10);
    const index = teamData.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
        teamData.players.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

module.exports = router;
