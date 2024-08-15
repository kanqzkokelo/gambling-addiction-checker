document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const gameOverMessage = document.getElementById('game-over');
    const resultMessage = document.getElementById('result');
    const mineCountInput = document.getElementById('mine-count');
    const betAmountInput = document.getElementById('bet-amount');
    const startGameButton = document.getElementById('start-game');
    const cashoutButton = document.getElementById('cashout');
    const creditsDisplay = document.getElementById('credits');
    let totalSquares = 25;
    let squares = [];
    let mines = new Set();
    let isGameOver = false;
    let betAmount = 0;
    let credits = 100000; // Starting credits
    let initialBetAmount = 0;
    let safeSquaresClicked = 0;

    creditsDisplay.textContent = `Credits: $${credits}`;

    // Bind events
    startGameButton.addEventListener('click', startGame);
    cashoutButton.addEventListener('click', cashout);

    function startGame() {
        if (isGameOver) {
            console.log('Game is already over. Resetting game state.');
            resetGame(); // Ensure game state is reset
        }

        const mineCount = parseInt(mineCountInput.value, 10);
        betAmount = parseFloat(betAmountInput.value);

        if (mineCount < 1 || mineCount >= totalSquares) {
            alert('Number of mines must be between 1 and 24.');
            return;
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            alert('Please enter a valid bet amount.');
            return;
        }

        if (betAmount > credits) {
            alert('Insufficient credits.');
            return;
        }

        // Deduct the bet amount from credits
        credits -= betAmount;
        initialBetAmount = betAmount;
        creditsDisplay.textContent = `Credits: $${credits}`;

        // Create squares and add them to the board
        createBoard();

        // Randomly place mines
        placeMines(mineCount);

        // Show the cashout button
        cashoutButton.classList.remove('hidden');
        console.log('New game started.');
    }

    function createBoard() {
        // Clear existing squares
        board.innerHTML = '';
        squares = [];

        // Create new squares
        for (let i = 0; i < totalSquares; i++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.index = i;
            square.addEventListener('click', () => handleClick(square));
            board.appendChild(square);
            squares.push(square);
        }
        console.log('Board created.');
    }

    function placeMines(mineCount) {
        mines.clear();
        while (mines.size < mineCount) {
            mines.add(Math.floor(Math.random() * totalSquares));
        }
        console.log(`Mines placed: ${Array.from(mines)}`);
    }

    function resetGame() {
        // Clear board and reset game state
        board.innerHTML = '';
        squares = [];
        mines.clear();
        isGameOver = false;
        safeSquaresClicked = 0;
        gameOverMessage.classList.add('hidden');
        resultMessage.classList.add('hidden');
        cashoutButton.classList.add('hidden'); // Hide cashout button
        console.log('Game reset.');
    }

    function handleClick(square) {
        if (isGameOver) {
            console.log('Cannot click, game is over.');
            return;
        }

        const index = parseInt(square.dataset.index);
        if (mines.has(index)) {
            // If clicked on a mine, reveal all squares
            revealSquares(true);
            isGameOver = true;
            square.classList.add('mine');
            gameOverMessage.classList.remove('hidden');
            resultMessage.classList.remove('hidden');
            resultMessage.textContent = `You lost! You bet $${initialBetAmount}.`;
            cashoutButton.classList.add('hidden'); // Hide cashout button
            console.log('Game over, you hit a mine.');
        } else {
            // If clicked on a safe square, reveal only that square
            square.classList.add('safe');
            square.classList.add('clicked');
            safeSquaresClicked += 1; // Increment safe squares clicked
            console.log(`Safe square clicked: ${index}`);
        }
    }

    function revealSquares(revealAll) {
        squares.forEach(square => {
            const index = parseInt(square.dataset.index);
            if (mines.has(index)) {
                square.classList.add('mine');
            } else if (revealAll) {
                square.classList.add('safe');
            }
        });
        console.log('Squares revealed.');
    }

    function cashout() {
        // Calculate the exponential multiplier
        const base = 1.2; // Base for exponential growth
        const multiplier = Math.pow(base, safeSquaresClicked);
        const finalAmount = initialBetAmount * multiplier;

        // Update credits and display final message
        credits += finalAmount;
        creditsDisplay.textContent = `Credits: $${credits}`;
        resultMessage.classList.remove('hidden');
        resultMessage.textContent = `You cashed out with $${credits} (Multiplier: ${multiplier.toFixed(2)}).`;
        cashoutButton.classList.add('hidden'); // Hide cashout button
        isGameOver = true; // End the game
        revealSquares(true); // Reveal all squares
        console.log('Cashout successful.');
    }
});
