import { AiPlayer } from "./ai-player.js";
import * as utils from "../utils.js";

export class TicTacToe {
    constructor(params) {
        this.grid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.gamingLog = [];
        this.playerSymbols = ['⭕', '❌'];
        this.playersTypes = ['h', 'h'];
        this.aiPlayers = [null, null];
        this.roundCounter = 0;
        this.gridElement = document.getElementById('grid');

        // Init data management
        this.datasToLearn = this.retrieveDatasToLearnFromStorage();
        document.getElementById('learn-stored').innerText = this.datasToLearn.length;
        document.getElementById('learn-all').addEventListener('click', () => this.teachThemAll());
    }


    hideStartPanel() {
        document.getElementById('start-game').classList.add('hidden');
    }

    showStartPanel() {
        document.getElementById('start-game').classList.remove('hidden');
    }

    /**
     * Create the game with a new configuration.
     */
    create() {
        this.playersTypes = [document.getElementById('p1').value, document.getElementById('p2').value];

        if (this.playersTypes[0] === 'h') this.playerSymbols[0] = '☺️';
        if (this.playersTypes[0] === 'a') this.playerSymbols[0] = '🖥️';
        if (this.playersTypes[1] === 'h') this.playerSymbols[1] = '🙂';
        if (this.playersTypes[1] === 'a') this.playerSymbols[1] = '🤖';

        // Hide start panel
        this.hideStartPanel();

        this.aiPlayers = this.playersTypes.map((type, playerNb) => {
            if (type !== 'a') return null;
            return new AiPlayer({
                playerNb: playerNb,
                game: this
            });
        });

        document.getElementById('info').innerText = '';

        this.initializeGame();
    }

    /**
     * Create a cell element to add to the grid.
     * 
     * @param {number} rowIndex - The row number of the cell
     * @param {number} colIndex - The column number of the cell
     * @returns {element} The new LI element to display a cell grid
     */
    getNewCell(rowIndex, colIndex) {
        const li = document.createElement('li');
        li.setAttribute('data-row', rowIndex);
        li.setAttribute('data-col', colIndex);
        return li;
    }

    initializeGame() {
        this.grid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.roundCounter = Math.floor(Math.random() * 2);
        this.gamingLog = [];

        // Remove all existing elements in the grid
        this.emptyGrid();

        // Create all the need LI in the grid
        this.fulfillGrid();

        // If there is human player(s),
        // Add the event listener on the grid to give players the ability to play
        if (this.playersTypes.filter(t => t === 'h').length > 0) {
            this.gridElement.addEventListener('click', (event) => {
                this.playHuman(event);
            });
        }

        // Display the first player on page
        this.displayCurrentPlayer();

        // Ask AI to play on his turn
        if (this.aiPlayers[this.getPlayerNumber()] !== null) {
            setTimeout(() => this.aiPlayers[this.getPlayerNumber()].play(), 150);
        }
    }

    isFull() {
        return this.grid.flat().every(v => v !== 0);
    }

    getWinner() {
        const diagonals = [[], []];

        // Analyze rows and columns
        for (const i in this.grid) {
            if (utils.isArrayFullAndRegular(this.grid[i])) return this.grid[i][0];

            if (utils.isArrayFullAndRegular(this.grid.map(row => row[i]))) return this.grid[0][i];

            // Aggregate values from diagonals
            diagonals[0].push(this.grid[i][i]);
            diagonals[1].push(this.grid[i][this.grid.length - i - 1]);
        }

        // Analyze diagonals
        for (const i in diagonals) {
            if (utils.isArrayFullAndRegular(diagonals[i])) return diagonals[i][0];
        }

        // Is the game over because the grid is full ?
        return this.isFull();
    }


    /**
     * Indicate if a cell is free.
     * 
     * @param {array} coord - The row number and column number of the cell [row, column]
     * @returns {boolean} Is the cell empty ?
     */
    isCellFree(coord) {
        return this.grid[coord[0]][coord[1]] === 0;
    }


    /**
     * Indicate if a cell indicates by an index is free.
     * 
     * @param {number} index - The index of the cell.
     * @returns {boolean} Is the cell empty ?
     */
    isCellFreeFromIndex(index) {
        return this.isCellFree(this.getCoordFromIndex(index))
    }


    /**
     * Add a player number to a cell.
     * 
     * @param {array} coord - The row number and column number of the cell [row, column]
     * @param {number} playerNb - The player number [0 | 1]
     */
    executeAction(coord, playerNb) {

        // Is this cell empty ?
        if (!this.isCellFree(coord)) return;

        // Add action to gaming log
        // Reverse layer data for player (1 playerNb === 0)
        this.gamingLog.push({
            player: playerNb,
            grid: playerNb === 0 ? this.formatGridToLayer().map(this.reverseLayerValue) : this.formatGridToLayer(),
            action: coord
        });

        // Add the symbol associated to the current player
        this.getCellElement(coord).innerText = this.playerSymbols[playerNb];
        this.grid[coord[0]][coord[1]] = playerNb + 1;

        // The game is over
        let winner = this.getWinner();
        if (winner !== false) {
            document.getElementById('grid').removeEventListener('click', this.playHuman);
            document.getElementById('info').innerText = `GAME OVER`;
            document.getElementById('info').innerText += winner === true ? ' | nobody win ' : ` | Player N°${winner} win `;
            document.getElementById('info').appendChild(this.createStartButton());

            // The game ends in a draw
            if (winner === true) {
                // learning human log
                // this.playersTypes.forEach((type, playerNb) => {
                //     if (type === 'h') learnWinnerLog(playerNb);
                // });
            }
            else {
                // There is a winner
                // Learn winner log
                // player 1 => 0, player 2 => 1
                this.learnWinnerLog(--winner);
            }
            return;
        }

        this.roundCounter++;

        this.displayCurrentPlayer();

        // Ask AI to play on his turn
        if (this.aiPlayers[this.getPlayerNumber()] !== null) {
            setTimeout(() => this.aiPlayers[this.getPlayerNumber()].play(), 150);
        }
    }


    /**
     * Execute a player action when a player click on the grid.
     * 
     * @param {event} event - A click event on the grid.
     * @returns void
     */
    playHuman(event) {
        const el = event.target;

        // Is the click fires on cell ?
        if (el.tagName !== 'LI') return;

        this.executeAction([parseInt(el.dataset.row), parseInt(el.dataset.col)], this.getPlayerNumber());
    }


    /**
     * Return the current grid state to the expected input layer for AI
     * @returns {array} Array of values for input layer
     */
    formatGridToLayer() {
        return this.grid.flat().map(v => v === 0 ? 0 : 2 * v - 3);
    }


    /**
     * Return the row and columns number for a given index between 0 and 8.
     * 
     * @param {number} index  - An index between 0 and 8;
     * @returns {array} the coord [row, col]
     */
    getCoordFromIndex(index) {
        return [Math.floor(index / this.grid.length), index % this.grid.length];
    }


    /**
     * Gives the LI element representing the cell with coordinates in parameters.
     * 
     * @param {array} coord - Cell coordinates with [row, column] 
     * @returns {element} The LI element representing the cell.
     */
    getCellElement(coord) {
        return document.querySelector(`[data-row='${coord[0]}'][data-col='${coord[1]}']`);
    }


    /**
     * Create a button to click on in order to start a new game.
     * 
     * @returns {element} The button element to start a new game..
     */
    createStartButton() {
        const btn = document.createElement('button');
        btn.innerText = 'Start new game';
        btn.addEventListener('click', () => {
            this.initializeGame();
        });
        return btn;
    }

    /**
     * Display which player's turn it is.
     */
    displayCurrentPlayer() {
        document.getElementById('info').innerText = `Player N°${this.getPlayerNumber() + 1} ${this.playerSymbols[this.getPlayerNumber()]}`;
    }

    /**
     * who's turn ?
     * @return {number} The player number who play.
     */
    getPlayerNumber() {
        return this.roundCounter % 2;
    }


    /**
     * Create every LI elements needed in the grid
     */
    fulfillGrid() {
        this.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                this.gridElement.appendChild(this.getNewCell(rowIndex, colIndex));
            });
        });
    }

    /**
     * Removes all the child of the grid.
     */
    emptyGrid() {
        while (this.gridElement.firstChild) this.gridElement.firstChild.remove();
    }

    /**
     * Returns the coordinate of a random free cell in the grid.
     * @returns Cell coordinates [row, column]
     */
    getRandomFreeCell() {
        if (this.isFull()) return null;

        const coord = [Math.floor(Math.random() * this.grid.length), Math.floor(Math.random() * this.grid.length)];

        if (!this.isCellFree(coord)) return this.getRandomFreeCell();

        return coord;
    }

    /**
     * Teaching AI all the round of the winner in the gaming log.
     * @param {number} winner - The winner number
     */
    async learnWinnerLog(winner) {
        // Get all the rounds from the winner
        // Transform data to input => expected output layers
        const datas = this.gamingLog
            .filter(round => round.player === winner)
            .map(round => {
                return {
                    input: round.grid,
                    expectedOutput: this.getLayerWithAction(round.action)
                };
            });

        // Learn each round
        for (const ai of this.aiPlayers) {
            if (ai === null) continue;
            ai.learnDatas(datas);
        }

        // Append datas to learn to the existing storage
        this.datasToLearn.push(...datas);

        // Update the storage
        localStorage.setItem('datasToLearn', JSON.stringify(this.datasToLearn));
    }


    /**
     * Returns a layer with '1' for the pointed cell.
     * 
     * @param {array} coord - The row and column nnumbers of the action.
     * @returns {array} The layer with only a 1 value for the pointed cell.
    */
    getLayerWithAction(coord) {
        const layer = Array(Math.pow(this.grid.length, 2)).fill(0);
        const index = coord[0] * this.grid.length + coord[1];
        layer[index] = 1;
        return layer;
    }


    /**
     * Returns a value of the input layer in terms of player.
     * -1 => 1
     * 1 => -1
     * 0 => 0
     * @param {number} value - original value
     * @returns {number} reversed value
     */
    reverseLayerValue(value) {
        if (value === 0) return 0;

        return value === 1 ? -1 : 1;
    }


    /**
     * Returns stored datas to learn from the local storage
     * @returns {array} All the datas to learn
     */
    retrieveDatasToLearnFromStorage() {
        if (localStorage.getItem('datasToLearn') === null) return [];

        return JSON.parse(localStorage.getItem('datasToLearn'));
    }


    async teachThemAll() {
        // Shuffle datas
        this.datasToLearn.sort((a, b) => 0.5 - Math.random());

        for (const ai of this.aiPlayers) {
            if (ai === null) continue;
            await ai.learnDatas(this.datasToLearn);
        }
    }
}