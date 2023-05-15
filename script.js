
// -------------
// FUNCTIONS
// -------------

/**
 * Create a cell element to add to the grid.
 * 
 * @param {number} rowIndex - The row number of the cell
 * @param {number} colIndex - The column number of the cell
 * @returns {element} The new LI element to display a cell grid
 */
function getNewCell(rowIndex, colIndex) {
    const li = document.createElement('li');
    li.setAttribute('data-row', rowIndex);
    li.setAttribute('data-col', colIndex);
    return li;
}


/**
 * Indicate if a player win the game.
 * 
 * @returns {boolean} Is the game over ?
 */
function isGameOver() {
    return (
        isRowWin(0) || isRowWin(1) || isRowWin(2)
        ||
        isColWin(0) || isColWin(1) || isColWin(2)
        ||
        (grid[1][1] !== '' && grid[1][1] === grid[0][0] && grid[1][1] === grid[2][2])
        ||
        (grid[1][1] !== '' && grid[1][1] === grid[0][2] && grid[1][1] === grid[2][0])
    );
}


/**
 * Indicate if a row win the game.
 * 
 * @param {number} rowNumber - Is this row win the game ?
 * @returns {boolean} Is this row finish the game ?
 */
function isRowWin(rowNumber) {
    return grid[rowNumber][0] !== '' && grid[rowNumber][0] === grid[rowNumber][1] && grid[rowNumber][0] === grid[rowNumber][2];
}


/**
 * Indicate if a column win the game.
 * 
 * @param {number} colNumber - Is this column win the game ?
 * @returns {boolean} Is this column finish the game ?
 */
function isColWin(colNumber) {
    return grid[0][colNumber] !== '' && grid[0][colNumber] === grid[1][colNumber] && grid[0][colNumber] === grid[2][colNumber];
}


/**
 * Indicate if a cell is free.
 * 
 * @param {number} row - The row number of the cell
 * @param {number} col - The column number of the cell
 * @returns {boolean} Is the game over ?
 */
function isCellFree(row, col) {
    return grid[row][col] === '';
}


/**
 * Add a player number to a cell.
 * 
 * @param {number} row - The row number of the cell
 * @param {number} col - The column number of the cell
 * @param {number} playerNb - The player number [0 | 1]
 */
function addPlayerToCell(row, col, playerNb) {
    return grid[row][col] = playerNb;
}


/**
 * Execute a player action on the grid.
 * 
 * @param {event} event - A click event on the grid.
 * @returns void
 */
function play(event) {
    const el = event.target;

    // Is the click fires on cell ?
    if (el.tagName !== 'LI') return;

    const playerNb = getPlayerNumber();
    const coord = [el.dataset.row, el.dataset.col];

    // Is this cell empty ?
    if (!isCellFree(coord[0], coord[1])) return;

    // Add the symbol associated to the current player
    el.innerText = playerSymbols[playerNb];
    addPlayerToCell(coord[0], coord[1], playerNb);

    if (isGameOver()) {
        el.parentElement.removeEventListener('click', play);
        document.getElementById('info').innerText = 'GAME OVER ';
        document.getElementById('info').appendChild(createStartButton());
        return;
    }

    roundCounter++;

    displayCurrentPlayer();
}


/**
 * Create a button to click on in order to start a new game.
 * 
 * @returns {element} The button element to start a new game..
 */
function createStartButton() {
    const btn = document.createElement('button');
    btn.innerText = 'Start new game';
    btn.addEventListener('click', initializeGame);
    return btn;
}


/**
 * Display which player's turn it is.
 */
function displayCurrentPlayer() {
    document.getElementById('info').innerText = `Joueur N°${getPlayerNumber() + 1} ${playerSymbols[getPlayerNumber()]}`;
}


/**
 * who's turn ?
 * 
 * @return {number} The player number who play.
 */
function getPlayerNumber() {
    return roundCounter%2;
}

/**
 * Start a game
 */
function initializeGame() {
    grid = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    roundCounter = 0;

    document.getElementById('info').innerText = '';

    const gridElement = document.getElementById('grid'); 

    emptyElement(gridElement);
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            gridElement.appendChild(getNewCell(rowIndex, colIndex));
        });
    });
    
    gridElement.addEventListener('click', play);
}


/**
 * Removes all the child of the given element.
 * 
 * @param {element} element - The element to empty. 
 */
function emptyElement(element) {
    while(element.firstChild) element.firstChild.remove();
}

// -------------
// SCRIPT
// -------------

let grid,
    roundCounter;

const playerSymbols = ['⭕', '❌'];

initializeGame();