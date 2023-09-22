import { addDoc, getDocs, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '.';

export const initializeDataApi = async (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const teamsData = {};
      const teamsQuery = query(collection(db, 'teams'), where('user', '==', userEmail));
      const teamsQuerySnapshot = await getDocs(teamsQuery);
      teamsQuerySnapshot.forEach(async doc => {
        const playersQuery = query(collection(db, 'players'), where('team', '==', doc.id));
        const playersQuerySnapshot = await getDocs(playersQuery);
        const teamId = doc.id;
        const team = { id: teamId, ...doc.data() };
        const players = [];
        playersQuerySnapshot.forEach((playerDoc) => {
          const playerId = playerDoc.id;
          const playerRawData = playerDoc.data();
          const playerData = {
            id: playerId,
            name: playerRawData.name,
            number: playerRawData.number,
            teamId,
            stats: JSON.parse(playerRawData.stats)
          };
          players.push(playerData);
        });

        if (!teamsData.teamA) {
          teamsData.teamA = { ...team, players };
        } else {
          teamsData.teamB = { ...team, players };
        }

        if (teamsData.teamA && teamsData.teamB) {
          resolve(teamsData);
        }
      });

    } catch (err) {
      console.log('INITIALIZE DATA API ERR: ', err);
      reject(err);
    }
  });
};

export const addMadeShotApi = async ({ team, playerId, points }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = team.players.find((p) => p.id === playerId);
      const newStats = {
        ...player.stats,
        points: {
          ...player.stats.points,
          made: player.stats.points.made.map((val, index) => {
            if (index === points) {
              return val + 1;
            }

            return val;
          })
        }
      };

      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        stats: JSON.stringify(newStats)
      });

      const newScore = team.score + parseInt(points);
      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        score: newScore
      });

      resolve();
    } catch (err) {
      console.log('ADD MADE SHOT API ERR: ', err);
      reject(err);
    }
  });
};

export const addAttemptedShotApi = async ({ team, playerId, points }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = team.players.find((p) => p.id === playerId);
      const newStats = {
        ...player.stats,
        points: {
          ...player.stats.points,
          attempted: player.stats.points.attempted.map((val, index) => {
            if (index === points) {
              return val + 1;
            }

            return val;
          })
        }
      };

      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        stats: JSON.stringify(newStats)
      });

      resolve();
    } catch (err) {
      console.log('ADD ATTEMPTED SHOT API ERR: ', err);
      reject(err);
    }
  });
};

export const addReboundApi = async ({ team, playerId, type }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = team.players.find((p) => p.id === playerId);
      const newStats = {
        ...player.stats,
        rebounds: {
          ...player.stats.rebounds,
          [type]: player.stats.rebounds[type] + 1
        }
      };

      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        stats: JSON.stringify(newStats)
      });

      resolve();
    } catch (err) {
      console.log('ADD REBOUND API ERR: ', err);
      reject(err);
    }
  });
};

export const addAssistApi = async ({ team, playerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = team.players.find((p) => p.id === playerId);
      const newStats = {
        ...player.stats,
        assists: player.stats.assists + 1
      };

      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        stats: JSON.stringify(newStats)
      });

      resolve();
    } catch (err) {
      console.log('ADD ASSIST API ERR: ', err);
      reject(err);
    }
  });
};

export const addFoulApi = async ({ team, playerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = team.players.find((p) => p.id === playerId);
      const newStats = {
        ...player.stats,
        fouls: player.stats.fouls + 1
      };

      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        stats: JSON.stringify(newStats)
      });

      resolve();
    } catch (err) {
      console.log('ADD FOUL API ERR: ', err);
      reject(err);
    }
  });
};

export const addPlayerApi = async ({ team, player }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const playerQuery = query(collection(db, 'players'), where('number', '==', player.number), where('team', '==', team.id));
      const playerSnapshot = await getDocs(playerQuery);
      if (playerSnapshot.docs.length <= 0) {
        const docRef = await addDoc(collection(db, 'players'), player);
        const newPlayer = { ...player, id: docRef.id };
        resolve({ player: newPlayer });

      } else {
        reject('number exists already');
      }
    } catch (err) {
      console.log('ADD FOUL API ERR: ', err);
      reject(err);
    }
  });
};
