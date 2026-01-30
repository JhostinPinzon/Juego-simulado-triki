const board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let gameMode = null; // 'pvp', 'pvai', or 'tournament'
let playerSymbol = null; // 'X' or 'O'
let aiSymbol = null;
let tournamentLevel = 0; // 0: easy, 1: medium, 2: hard
let tournamentWins = 0;

const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const backBtn = document.getElementById('back-btn');
const modeSelection = document.getElementById('mode-selection');
const symbolSelection = document.getElementById('symbol-selection');
const pvpBtn = document.getElementById('pvp-btn');
const pvaiBtn = document.getElementById('pvai-btn');
const tournamentBtn = document.getElementById('tournament-btn');
const xBtn = document.getElementById('x-btn');
const oBtn = document.getElementById('o-btn');
const boardDiv = document.getElementById('board');

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const index = event.target.dataset.index;
    if (board[index] || !gameActive || ((gameMode === 'pvai' || gameMode === 'tournament') && currentPlayer !== playerSymbol)) return;

    board[index] = currentPlayer;
    event.target.textContent = currentPlayer;

    if (checkWin()) {
        if (gameMode === 'tournament') {
            tournamentWins++;
            if (tournamentLevel < 2) {
                tournamentLevel++;
                setTimeout(() => {
                    resetGame();
                    startTournament();
                }, 2000);
                message.textContent = `¡Ganaste el nivel! Pasando al siguiente...`;
            } else {
                message.textContent = `¡Felicidades! Completaste el torneo con ${tournamentWins} victorias!`;
            }
        } else {
            message.textContent = `¡Jugador ${currentPlayer} gana!`;
        }
        gameActive = false;
        return;
    }

    if (board.every(cell => cell)) {
        message.textContent = '¡Empate!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    message.textContent = `Turno del jugador ${currentPlayer}`;

    if ((gameMode === 'pvai' || gameMode === 'tournament') && currentPlayer === aiSymbol) {
        setTimeout(makeAIMove, 500);
    }
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === currentPlayer);
    });
}

function resetGame() {
    board.fill(null);
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = playerSymbol || 'X';
    gameActive = true;
    message.textContent = `Turno del jugador ${currentPlayer}`;
    if (gameMode === 'pvai' && aiSymbol === currentPlayer) {
        setTimeout(makeAIMove, 500); // Delay for AI move
    }
}

function selectMode(mode) {
    gameMode = mode;
    modeSelection.style.display = 'none';
    if (mode === 'pvai') {
        symbolSelection.style.display = 'block';
    } else if (mode === 'tournament') {
        playerSymbol = 'X';
        aiSymbol = 'O';
        tournamentLevel = 0;
        tournamentWins = 0;
        startTournament();
    } else {
        playerSymbol = 'X';
        aiSymbol = null;
        startGame();
    }
}

function selectSymbol(symbol) {
    playerSymbol = symbol;
    aiSymbol = symbol === 'X' ? 'O' : 'X';
    symbolSelection.style.display = 'none';
    startGame();
}

function startGame() {
    boardDiv.style.display = 'grid';
    currentPlayer = 'X';
    message.textContent = `Turno del jugador ${currentPlayer}`;
    if (gameMode === 'pvai' && aiSymbol === currentPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

function makeAIMove() {
    let bestMove;
    if (gameMode === 'tournament') {
        bestMove = getAIMoveByLevel(board, aiSymbol, tournamentLevel);
    } else {
        bestMove = getBestMove(board, aiSymbol); // Hard level for PvAI
    }
    if (bestMove !== -1) {
        board[bestMove] = aiSymbol;
        cells[bestMove].textContent = aiSymbol;

        if (checkWin()) {
            if (gameMode === 'tournament') {
                message.textContent = `¡La máquina gana! Fin del torneo. Victorias: ${tournamentWins}`;
            } else {
                message.textContent = `¡La máquina gana!`;
            }
            gameActive = false;
            return;
        }

        if (board.every(cell => cell)) {
            message.textContent = '¡Empate!';
            gameActive = false;
            return;
        }

        currentPlayer = playerSymbol;
        message.textContent = `Turno del jugador ${currentPlayer}`;
    }
}

function getBestMove(board, player) {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = player;
            let score = minimax(board, 0, false, player);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const result = checkWinner(board);
    if (result !== null) {
        if (result === player) return 10 - depth;
        if (result === opponent) return depth - 10;
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = player;
                let score = minimax(board, depth + 1, false, player);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = opponent;
                let score = minimax(board, depth + 1, true, player);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(cell => cell)) return 'tie';
    return null;
}

function getAIMoveByLevel(board, player, level) {
    if (level === 0) {
        // Easy: Random move
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) availableMoves.push(i);
        }
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (level === 1) {
        // Medium: Basic logic - win if possible, block if necessary
        const opponent = player === 'X' ? 'O' : 'X';
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = player;
                if (checkWinner(board) === player) {
                    board[i] = null;
                    return i;
                }
                board[i] = null;
            }
        }
        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = opponent;
                if (checkWinner(board) === opponent) {
                    board[i] = null;
                    return i;
                }
                board[i] = null;
            }
        }
        // Random move
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) availableMoves.push(i);
        }
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
        // Hard: Minimax
        return getBestMove(board, player);
    }
}

function startTournament() {
    boardDiv.style.display = 'grid';
    currentPlayer = 'X';
    const levelNames = ['Fácil', 'Medio', 'Difícil'];
    message.textContent = `Nivel ${tournamentLevel + 1}: ${levelNames[tournamentLevel]} - Turno del jugador ${currentPlayer}`;
    if (aiSymbol === currentPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

function goBack() {
    boardDiv.style.display = 'none';
    modeSelection.style.display = 'block';
    symbolSelection.style.display = 'none';
    gameMode = null;
    playerSymbol = null;
    aiSymbol = null;
    tournamentLevel = 0;
    tournamentWins = 0;
    message.textContent = '';
}

pvpBtn.addEventListener('click', () => selectMode('pvp'));
pvaiBtn.addEventListener('click', () => selectMode('pvai'));
tournamentBtn.addEventListener('click', () => selectMode('tournament'));
xBtn.addEventListener('click', () => selectSymbol('X'));
oBtn.addEventListener('click', () => selectSymbol('O'));
backBtn.addEventListener('click', goBack);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
