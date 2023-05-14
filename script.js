
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
    li.id = `cell${rowIndex}-${colIndex}`;
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
        (grid[0][0] !== '' && grid[0][0] === grid[0][1] && grid[0][0] === grid[0][2])
        ||
        (grid[1][0] !== '' && grid[1][0] === grid[1][1] && grid[1][0] === grid[1][2])
        ||
        (grid[2][0] !== '' && grid[2][0] === grid[2][1] && grid[2][0] === grid[2][2])
        ||
        (grid[0][0] !== '' && grid[0][0] === grid[1][0] && grid[0][0] === grid[2][0])
        ||
        (grid[0][1] !== '' && grid[0][1] === grid[1][1] && grid[0][1] === grid[2][1])
        ||
        (grid[0][2] !== '' && grid[0][2] === grid[1][2] && grid[0][2] === grid[2][2])
        ||
        (grid[1][1] !== '' && grid[1][1] === grid[0][0] && grid[1][1] === grid[2][2])
        ||
        (grid[1][1] !== '' && grid[1][1] === grid[0][2] && grid[1][1] === grid[2][0])
    );
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


// -------------
// SCRIPT
// -------------

const grid = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

const gridElement = document.getElementById('grid'); 

let roundCounter = 0;

const playersSymbol = ['⭕', '❌'];

grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        gridElement.appendChild(getNewCell(rowIndex, colIndex));
    });
});

gridElement.addEventListener('click', function(event) {

    const el = event.target;

    // Is the click fires on cell ?
    if (el.tagName !== 'LI') return;

    const playerNb = roundCounter%2;
    const coord = [el.dataset.row, el.dataset.col];

    // Is te cell empty ?
    if (el.innerText !== '' || !isCellFree(coord[0], coord[1])) return;

    // Add the symbol associated to the current player
    el.innerText = playersSymbol[playerNb];
    addPlayerToCell(coord[0], coord[1], playerNb);

    console.log(isGameOver());

    roundCounter++;
});
