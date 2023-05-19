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
 * @returns {boolean | number} winner number | false if the game is not over | true if the game is over without winner
 */
function getWinner() {
    const diagonals = [[], []];

    // Analyze rows and columns
    for (const i in grid) {
        if (isArrayFullAndRegular(grid[i])) return grid[i][0];
        
        if (isArrayFullAndRegular(grid.map(row => row[i]))) return grid[0][i];

        // Aggregate values from diagonals
        diagonals[0].push(grid[i][i]);
        diagonals[1].push(grid[i][grid.length - i - 1]);
    }

    if (isArrayFullAndRegular(diagonals[0])) return diagonals[0][0];

    if (isArrayFullAndRegular(diagonals[1])) return diagonals[1][0];

    return isGridFull();
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
 * Execute a player action when a player click on the grid.
 * 
 * @param {event} event - A click event on the grid.
 * @returns void
 */
function playHuman(event) {
    const el = event.target;

    // Is the click fires on cell ?
    if (el.tagName !== 'LI') return;

    executeAction([parseInt(el.dataset.row), parseInt(el.dataset.col)], getPlayerNumber());
}


/**
 * Ask AI to play.
 * 
 * @returns void
 */
function playAI() {
    brain
        .askAnswer(formatGridToLayer())
        .then(output => {
            let coord = getCoordFromIndex(getArrayMaxIndex(output));

            counterAI++;
            // Avoid looping in a trap
            console.log('free cell loop: ',counterAI);
            if (counterAI > 100) coord = getRandomFreeCell();
            
            // The cell picked by AI is not empty
            // Teach him to play on a free cell
            // and play again
            if (!isCellFree(coord)) {
                // Give as expected output, the value 1 only for the free cell
                // with the best value of the inital output.
                const expectedOutput = Array(9).fill(0);
                const maxIndex = getArrayMaxIndex(output.map((v, i) => isCellFree(getCoordFromIndex(i)) ? v : -1));
                expectedOutput[maxIndex] = 1;
                brain
                    .learn(expectedOutput)
                    .then(playAI);
                return;
            }

            counterAI = 0;

            // Execute the action
            executeAction(coord, getPlayerNumber());
        });
}


/**
 * Return the current grid state to the expected input layer for AI
 * @returns {array} Array of values for input layer
 */
function formatGridToLayer() {
    return grid.flat().map(v => v === 0 ? 0 : 2 * v - 3);
}


/**
 * Return the index of the maximum value in the the given array.
 * 
 * @param {array} array - The array 
 * @returns the index for the max value of the array
 */
function getArrayMaxIndex(array) {
    let maxIndex;
    for (const i in array) {
        if (maxIndex === undefined || array[i] > array[maxIndex]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}

/**
 * Returns the row and columns number for a given index between 0 and 8.
 * 
 * @param {number} index  - An index between 0 and 8;
 * @returns {array} the coord [row, col]
 */
function getCoordFromIndex(index) {
    return [Math.floor(index / grid.length), index % grid.length];
}


/**
 * Add a player number to a cell.
 * 
 * @param {array} coord - The row number and column number of the cell [row, column]
 * @param {number} playerNb - The player number [0 | 1]
 */
function executeAction(coord, playerNb) {

    // Is this cell empty ?
    if (!isCellFree(coord)) return;

    // Add action to gaming log
    // Reverse layer data for player (1 playerNb === 0)
    gamingLog.push({
        player: playerNb,
        grid: playerNb === 0 ? formatGridToLayer().map(reverseLayerValue) : formatGridToLayer(),
        action: coord
    });

    // Add the symbol associated to the current player
    getCellElement(coord).innerText = playerSymbols[playerNb];
    grid[coord[0]][coord[1]] = playerNb+1;
    
    // console.table(grid);

    // The game is over
    let winner = getWinner();
    if (winner !== false) {
        document.getElementById('grid').removeEventListener('click', playHuman);
        document.getElementById('info').innerText = 'GAME OVER ';
        document.getElementById('info').appendChild(createStartButton());
        console.table(gamingLog);

        // There is a winner
        if (winner !== true) {
            // Learn winner log
            // player 1 => 0, player 2 => 1
            learnWinnerLog(--winner);
        }
        return;
    }

    roundCounter++;

    displayCurrentPlayer();

    // Ask AI to play on his turn
    if (getPlayerNumber() === 1) playAI();
}


/**
 * Gives the LI element representing the cell with coordinates in parameters.
 * 
 * @param {array} coord - Cell coordinates with [row, column] 
 * @returns {element} The LI element representing the cell.
 */
function getCellElement(coord) {
    return document.querySelector(`[data-row='${coord[0]}'][data-col='${coord[1]}']`);
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
    gamingLog = [];

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


/**
 * Returns the coordinate of a random free cell in the grid.
 * @returns Cell coordinates [row, column]
 */
function getRandomFreeCell() {
    if (isGridFull()) return null;

    const coord = [Math.floor(Math.random()*grid.length), Math.floor(Math.random()*grid.length)];

    if (!isCellFree(coord)) return getRandomFreeCell();

    return coord;
}


/**
 * Returns a value of the input layer in terms of player.
 * -1 => 1
 * 1 => -1
 * 0 => 0
 * @param {number} value - original value
 * @returns {number} reversed value
 */
function reverseLayerValue(value) {
    if (value === 0) return 0;

    return value === 1 ? -1 : 1;
}

/**
 * Teaching AI all the round of the winner in the gaming log.
 * @param {number} winner - The winner number
 */
function learnWinnerLog(winner) {
    console.log(winner);
    const a = gamingLog
        .filter(round => round.player === winner)
        .map(round => {
            return {
                input: round.grid,
                expectedOutput: getLayerWithAction(round.action)
            };
        });

    console.log(a);
}


/**
 * Returns a layer with '1' for the pointed cell.
 * 
 * @param {array} coord - The row and column nnumbers of the action.
 * @returns {array} The layer with only a 1 value for the pointed cell.
 */
function getLayerWithAction(coord) {
    const layer = Array(Math.pow(grid.length, 2)).fill(0);
    const index = coord[0] * grid.length + coord[1];
    layer[index] = 1;
    return layer;
}

// -------------
// SCRIPT
// -------------

let grid,
    roundCounter,
    gamingLog,
    counterAI = 0;

const brain = new Brain();
const playerSymbols = ['⭕', '❌'];

initializeGame();
