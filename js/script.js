import { Brain } from "./class/brain.js";
import { Layer } from "./class/layer.js";

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
 * Indicate if the grid is completly full.
 * 
 * @returns {boolean} Is the grid full ?
 */
function isGridFull() {
    return grid.flat().every(v => v !== 0);
}


/**
 * Indicate if a player win the game.
 * 
 * @returns {boolean} Is the game over ?
 */
function isGameOver() {
    const diagonals = [[], []];

    // Analyze rows and columns
    for (const i in grid) {
        if (isArrayFullAndRegular(grid[i])) return true;
        
        if (isArrayFullAndRegular(grid.map(row => row[i]))) return true;

        // Aggregate values from diagonals
        diagonals[0].push(grid[i][i]);
        diagonals[1].push(grid[i][grid.length - i]);
    }

    return (
        isArrayFullAndRegular(diagonals[0])
        ||
        isArrayFullAndRegular(diagonals[1])
        ||
        isGridFull()
    );
}


/**
 * Indicates if the array given has been filled with the same value.
 * 
 * @param {array} array - The array to analyze
 * @returns {boolean} Result of the analysis ?
 */
function isArrayFullAndRegular(array) {
    return array.every(v => v !== 0 && v === array[0]);
}


/**
 * Indicate if a cell is free.
 * 
 * @param {array} coord - The row number and column number of the cell [row, column]
 * @returns {boolean} Is the game over ?
 */
function isCellFree(coord) {
    return grid[coord[0]][coord[1]] === 0;
}


/**
 * Add a player number to a cell.
 * 
 * @param {array} coord - The row number and column number of the cell [row, column]
 * @param {number} playerNb - The player number [0 | 1]
 */
function executeAction(coord, playerNb) {
    grid[coord[0]][coord[1]] = playerNb+1;

    console.table(grid);

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
 * Execute a player action when a player click on the grid.
 * 
 * @param {event} event - A click event on the grid.
 * @returns void
 */
function playHuman(event) {
    const el = event.target;

    // Is the click fires on cell ?
    if (el.tagName !== 'LI') return;

    const playerNb = getPlayerNumber();
    const coord = [el.dataset.row, el.dataset.col];

    // Is this cell empty ?
    if (!isCellFree(coord)) return;

    // Add the symbol associated to the current player
    el.innerText = playerSymbols[playerNb];
    executeAction(coord, playerNb);
}


function playAI() {
    brain
        .askAnswer(grid.flat().map(v => 2 * v - 3))
        .then(output => {
            console.log(output);

            // executeAction(coord, playerNb);
        });
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
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    roundCounter = 0;

    document.getElementById('info').innerText = '';

    const gridElement = document.getElementById('grid'); 

    // Remove all existing elements in the grid
    emptyElement(gridElement);

    // Create all the need LI in the grid
    fulfillGrid(gridElement);
    
    // Add the event listener on the grid to give players the ability to play
    gridElement.addEventListener('click', playHuman);
}


/**
 * Create every LI elements needed in the grid
 */
function fulfillGrid(gridElement) {
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            gridElement.appendChild(getNewCell(rowIndex, colIndex));
        });
    });
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

const brain = new Brain();
console.log(brain);
