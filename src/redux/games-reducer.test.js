import gamesReducer, {
  addNewGame,
  addMadeShot,
  addAttemptedShot,
  addRebound,
  addAssist,
  addFoul,
  addDrillCompletion,
  addDrillAttempt,
  undoLastAction,
  updateLastActions,
  endGame,
} from './games-reducer';

const makePickUpGame = (overrides = {}) => ({
  id: 'game1',
  type: 'pick-up',
  teamAId: 'teamA',
  teamBId: 'teamB',
  teamAScore: 0,
  teamBScore: 0,
  actions: [],
  stats: {},
  finished: false,
  ...overrides,
});

const makeDrill = (overrides = {}) => ({
  id: 'drill1',
  type: 'drill',
  playerIds: ['p1', 'p2'],
  actions: [],
  stats: {},
  finished: false,
  ...overrides,
});

const makeState = (game) => ({
  byId: { [game.id]: game },
  allIds: [game.id],
  editing: { teamA: null, teamB: null },
});

describe('addNewGame', () => {
  it('adds a game to state', () => {
    const game = makePickUpGame();
    const state = gamesReducer(undefined, addNewGame(game));
    expect(state.byId['game1']).toEqual(game);
    expect(state.allIds).toContain('game1');
  });
});

describe('pickup game scoring', () => {
  const teamId = 'teamA';
  const playerId = 'p1';
  const gameId = 'game1';

  const gameWith = (points, made = true) => {
    const game = makePickUpGame();
    const state = makeState(game);
    const action = made
      ? addMadeShot({ gameId, teamId, playerId, points })
      : addAttemptedShot({ gameId, teamId, playerId, points });
    return gamesReducer(state, action);
  };

  it('records a made free throw (1 point)', () => {
    const state = gameWith(1);
    expect(state.byId.game1.stats.teamA.p1.freeThrows).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(1);
  });

  it('records a made 2-pointer', () => {
    const state = gameWith(2);
    expect(state.byId.game1.stats.teamA.p1.twos).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(2);
  });

  it('records a made 3-pointer', () => {
    const state = gameWith(3);
    expect(state.byId.game1.stats.teamA.p1.threes).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(3);
  });

  it('records a missed free throw (attempted only)', () => {
    const state = gameWith(1, false);
    expect(state.byId.game1.stats.teamA.p1.attemptedFreeThrows).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(0);
  });

  it('records a missed 2-pointer (attempted only)', () => {
    const state = gameWith(2, false);
    expect(state.byId.game1.stats.teamA.p1.attemptedTwos).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(0);
  });

  it('records a missed 3-pointer (attempted only)', () => {
    const state = gameWith(3, false);
    expect(state.byId.game1.stats.teamA.p1.attemptedThrees).toBe(1);
    expect(state.byId.game1.teamAScore).toBe(0);
  });

  it('records an offensive rebound', () => {
    const game = makePickUpGame();
    const state = gamesReducer(makeState(game), addRebound({ gameId, teamId, playerId, reboundType: 'offensive' }));
    expect(state.byId.game1.stats.teamA.p1.offensiveRebounds).toBe(1);
  });

  it('records a defensive rebound', () => {
    const game = makePickUpGame();
    const state = gamesReducer(makeState(game), addRebound({ gameId, teamId, playerId, reboundType: 'defensive' }));
    expect(state.byId.game1.stats.teamA.p1.defensiveRebounds).toBe(1);
  });

  it('records an assist', () => {
    const game = makePickUpGame();
    const state = gamesReducer(makeState(game), addAssist({ gameId, teamId, playerId }));
    expect(state.byId.game1.stats.teamA.p1.assists).toBe(1);
  });

  it('records a foul', () => {
    const game = makePickUpGame();
    const state = gamesReducer(makeState(game), addFoul({ gameId, teamId, playerId }));
    expect(state.byId.game1.stats.teamA.p1.fouls).toBe(1);
  });

  it('accumulates score from multiple made shots', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 2 }));
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 3 }));
    expect(state.byId.game1.teamAScore).toBe(5);
    expect(state.byId.game1.stats.teamA.p1.twos).toBe(1);
    expect(state.byId.game1.stats.teamA.p1.threes).toBe(1);
  });

  it('does not affect teamBScore when teamA scores', () => {
    const state = gameWith(3);
    expect(state.byId.game1.teamBScore).toBe(0);
  });
});

describe('undo', () => {
  const teamId = 'teamA';
  const playerId = 'p1';
  const gameId = 'game1';

  // Convention: undoLastAction receives the CURRENT actions list (with the action
  // to undo still at the end). The reducer reads the last item and reverses it.
  // The caller is responsible for trimming the list after dispatch.
  const doUndo = (state, actionRecord) =>
    gamesReducer(state, undoLastAction({ gameId, actions: [actionRecord] }));

  it('undoes a made 2-pointer', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 2 }));
    expect(state.byId.game1.teamAScore).toBe(2);
    state = doUndo(state, { action: 'addMadeShot', gameId, teamId, playerId, points: 2 });
    expect(state.byId.game1.teamAScore).toBe(0);
    expect(state.byId.game1.stats.teamA.p1.twos).toBe(0);
  });

  it('undoes a made 3-pointer', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 3 }));
    state = doUndo(state, { action: 'addMadeShot', gameId, teamId, playerId, points: 3 });
    expect(state.byId.game1.teamAScore).toBe(0);
    expect(state.byId.game1.stats.teamA.p1.threes).toBe(0);
  });

  it('undoes a made free throw', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 1 }));
    state = doUndo(state, { action: 'addMadeShot', gameId, teamId, playerId, points: 1 });
    expect(state.byId.game1.teamAScore).toBe(0);
    expect(state.byId.game1.stats.teamA.p1.freeThrows).toBe(0);
  });

  it('undoes a missed 3-pointer', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addAttemptedShot({ gameId, teamId, playerId, points: 3 }));
    state = doUndo(state, { action: 'addAttemptedShot', gameId, teamId, playerId, points: 3 });
    expect(state.byId.game1.stats.teamA.p1.attemptedThrees).toBe(0);
  });

  it('undoes a missed 2-pointer', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addAttemptedShot({ gameId, teamId, playerId, points: 2 }));
    state = doUndo(state, { action: 'addAttemptedShot', gameId, teamId, playerId, points: 2 });
    expect(state.byId.game1.stats.teamA.p1.attemptedTwos).toBe(0);
  });

  it('undoes a missed free throw', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addAttemptedShot({ gameId, teamId, playerId, points: 1 }));
    state = doUndo(state, { action: 'addAttemptedShot', gameId, teamId, playerId, points: 1 });
    expect(state.byId.game1.stats.teamA.p1.attemptedFreeThrows).toBe(0);
  });

  it('undoes an offensive rebound', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addRebound({ gameId, teamId, playerId, reboundType: 'offensive' }));
    state = doUndo(state, { action: 'addRebound', gameId, teamId, playerId, reboundType: 'offensive' });
    expect(state.byId.game1.stats.teamA.p1.offensiveRebounds).toBe(0);
  });

  it('undoes an assist', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addAssist({ gameId, teamId, playerId }));
    state = doUndo(state, { action: 'addAssist', gameId, teamId, playerId });
    expect(state.byId.game1.stats.teamA.p1.assists).toBe(0);
  });

  it('undoes a foul', () => {
    let state = makeState(makePickUpGame());
    state = gamesReducer(state, addFoul({ gameId, teamId, playerId }));
    state = doUndo(state, { action: 'addFoul', gameId, teamId, playerId });
    expect(state.byId.game1.stats.teamA.p1.fouls).toBe(0);
  });

  it('does nothing when action list is empty', () => {
    const game = makePickUpGame();
    let state = makeState(game);
    const before = JSON.stringify(state.byId.game1);
    state = gamesReducer(state, undoLastAction({ gameId, actions: [] }));
    expect(JSON.stringify(state.byId.game1.stats)).toBe('{}');
    expect(state.byId.game1.teamAScore).toBe(0);
  });

  it('score does not go negative if undo is called without a prior made shot', () => {
    const game = makePickUpGame();
    let state = makeState(game);
    state = gamesReducer(state, addMadeShot({ gameId, teamId, playerId, points: 2 }));
    // Undo once (valid)
    state = doUndo(state, { action: 'addMadeShot', gameId, teamId, playerId, points: 2 });
    expect(state.byId.game1.teamAScore).toBe(0);
    // State is now back to 0 — no crash on empty undo
    state = gamesReducer(state, undoLastAction({ gameId, actions: [] }));
    expect(state.byId.game1.teamAScore).toBe(0);
  });
});

describe('drill tracking', () => {
  const gameId = 'drill1';
  const playerId = 'p1';

  it('increments both attempts and completions on completion', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillCompletion({ gameId, playerId }));
    expect(state.byId.drill1.stats.p1.attempts).toBe(1);
    expect(state.byId.drill1.stats.p1.completions).toBe(1);
  });

  it('increments only attempts on a miss', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillAttempt({ gameId, playerId }));
    expect(state.byId.drill1.stats.p1.attempts).toBe(1);
    // completions must remain at initialDrillStats value (0), not increment
    expect(state.byId.drill1.stats.p1.completions).toBe(0);
  });

  it('initializes stats on the first action', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillCompletion({ gameId, playerId }));
    expect(state.byId.drill1.stats.p1).toMatchObject({ attempts: 1, completions: 1 });
  });

  it('undoes a drill completion', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillCompletion({ gameId, playerId }));
    state = gamesReducer(state, undoLastAction({ gameId, actions: [{ action: 'addDrillCompletion', gameId, playerId }] }));
    expect(state.byId.drill1.stats.p1.attempts).toBe(0);
    expect(state.byId.drill1.stats.p1.completions).toBe(0);
  });

  it('undoes a drill attempt', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillAttempt({ gameId, playerId }));
    state = gamesReducer(state, undoLastAction({ gameId, actions: [{ action: 'addDrillAttempt', gameId, playerId }] }));
    expect(state.byId.drill1.stats.p1.attempts).toBe(0);
  });

  it('calculates success rate correctly', () => {
    const drill = makeDrill();
    let state = makeState(drill);
    state = gamesReducer(state, addDrillCompletion({ gameId, playerId }));
    state = gamesReducer(state, addDrillAttempt({ gameId, playerId }));
    const { attempts, completions } = state.byId.drill1.stats.p1;
    const rate = ((completions / attempts) * 100).toFixed(1);
    expect(rate).toBe('50.0');
  });
});

describe('endGame', () => {
  it('marks the game as finished', () => {
    const game = makePickUpGame();
    let state = makeState(game);
    state = gamesReducer(state, endGame('game1'));
    expect(state.byId.game1.finished).toBe(true);
    expect(state.byId.game1.endedAt).toBeDefined();
  });
});
