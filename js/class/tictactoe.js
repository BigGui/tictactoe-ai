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
        this.aiPlayer = null;
        this.roundCounter = 0;
        this.gridElement = document.getElementById('grid');
        this.gameWinners = [];
        
        this.initDataManagement();
    }

    /**
     * Hide the start panel.
     */
    hideStartPanel() {
        document.getElementById('start-game').classList.add('hidden');
    }
    
    /**
     * Initialize data management.
     */
    initDataManagement() {
        this.datasToLearn = this.retrieveDatasToLearnFromStorage();
        document.getElementById('learn-stored').innerText = this.datasToLearn.length;

        // Manage learning button
        document.getElementById('learn-all').addEventListener('click', () => {
            this.teachAI();
        });

        // Manage reset counter button
        document.getElementById('reset-counter').addEventListener('click', () => {
            this.gameWinners = [];
            this.updateWinnerProgress();
        });
    }

    /**
     * Create the game with a new configuration.
     */
    create() {
        this.playersTypes = [document.getElementById('p1').value, document.getElementById('p2').value];

        if (this.playersTypes.filter(t => t !== 'h').length > 0) {
            if (this.playersTypes[0] === 'h') this.playerSymbols[0] = '☺️';
            if (this.playersTypes[0] === 'a') this.playerSymbols[0] = '🖥️';
            if (this.playersTypes[1] === 'h') this.playerSymbols[1] = '🙂';
            if (this.playersTypes[1] === 'a') this.playerSymbols[1] = '🤖';
        }

        for (const i in this.playerSymbols) {
            document.querySelector(`#progress-${i} .symbol`).innerText = this.playerSymbols[i];
        }

        // Hide start panel
        this.hideStartPanel();

        // Create AI player if needed
        if (this.playersTypes.includes('a')) {
            this.aiPlayer = new AiPlayer({game: this});
            document.getElementById('bloc-artificial').classList.remove('bloc-hidden');
        }

        document.getElementById('info').innerText = '';

        this.initializeGame();

        document.getElementById('game-info').classList.remove('hidden');
    }

    /**
     * Create a cell element for the grid.
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
        this.roundCounter = 0;
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
        if (this.playersTypes[this.getPlayerNumber()] === 'a') {
            setTimeout(() => this.aiPlayer.play(), 150);
        }
        else if (this.playersTypes[this.getPlayerNumber()] === 'r') {
            this.playRandom();
        }
    }

    isFull() {
        return this.grid.flat().every(v => v !== 0);
    }

    /**
     * Return the current game result
     * @returns {bool|number} false => game is not over | true => game ends in a draw | number => the winner number
     */
    getWinner() {
        const diagonals = [[], []];

        // Analyze rows and columns
        for (const i in this.grid) {
            // Rows
            if (utils.isArrayFullAndRegular(this.grid[i])) {
                this.showWinningCells([[i, 0], [i, 1], [i, 2]]);
                return this.grid[i][0];
            }
            
            // Columns
            if (utils.isArrayFullAndRegular(this.grid.map(row => row[i]))) {
                this.showWinningCells([[0, i], [1, i], [2, i]]);
                return this.grid[0][i];
            }

            // Aggregate values from diagonals
            diagonals[0].push(this.grid[i][i]);
            diagonals[1].push(this.grid[i][this.grid.length - i - 1]);
        }

        // Analyze diagonals
        for (const i in diagonals) {
            if (utils.isArrayFullAndRegular(diagonals[i])) {
                this.showWinningCells(i == 0 ? [[0, 0], [1, 1], [2, 2]] : [[0, 2], [1, 1], [2, 0]]);
                return diagonals[i][0];
            }
        }

        // Is the game over because the grid is full ?
        return this.isFull();
    }


    /**
     * Add a color to the winning cells.
     * 
     * @param {array} coord - An array of coord
     */
    showWinningCells(coordList) {
        coordList.forEach(coord => this.getCellElement(coord).classList.add('win'));
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
    executeAction(coord) {
        // Is this cell empty ?
        if (!this.isCellFree(coord)) return;

        // Add action to gaming log
        // Reverse layer data for player (1 playerNb === 0)
        this.gamingLog.push({
            player: this.getPlayerNumber(),
            grid: this.getPlayerNumber() === 0 ? this.formatGridToLayer().map(this.reverseLayerValue) : this.formatGridToLayer(),
            action: coord
        });

        // Add the symbol associated to the current player
        this.getCellElement(coord).innerText = this.playerSymbols[this.getPlayerNumber()];
        this.grid[coord[0]][coord[1]] = this.getPlayerNumber() + 1;

        // The game is over
        let winner = this.getWinner();
        if (winner !== false) {
            document.getElementById('grid').removeEventListener('click', this.playHuman);
            document.getElementById('info').innerText = '';
            document.getElementById('info').appendChild(this.createStartButton());

            // add Winner to History
            this.gameWinners.push(winner === true ? '' : winner - 1);
            this.updateWinnerProgress();

            // The game ends in a draw
            if (winner === true) {
                // learning human log only
                // this.playersTypes.forEach((type, this.getPlayerNumber()) => {
                //     if (type === 'h') learnWinnerLog(this.getPlayerNumber());
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
        if (this.playersTypes[this.getPlayerNumber()] === 'a') {
            setTimeout(() => this.aiPlayer.play(), 200);
        }
        else if (this.playersTypes[this.getPlayerNumber()] === 'r') {
            setTimeout(() => this.playRandom(), 200);
        }
    }

    /**
     * Update winners progress bar.
     */
    updateWinnerProgress() {
        const winners = this.gameWinners.slice(-300);

        // Counter is empty
        if (winners.length === 0) {
            for (const i in this.playerSymbols) {
                document.getElementById(`progress-${i}`).style.width = '0';
                document.querySelector(`#progress-${i} .percent`).innerText = '0';
            }
            return;
        }

        for (const i in this.playerSymbols) {
            const nb = winners.filter(p => p == i).length;
            document.getElementById(`progress-${i}`).style.width = `${Math.floor(nb / winners.length * 100)}%`;
            document.querySelector(`#progress-${i} .percent`).innerText = `${nb}`;
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
        if (el.tagName !== 'LI' || this.getWinner() !== false) return;

        this.executeAction([parseInt(el.dataset.row), parseInt(el.dataset.col)]);
    }


    /**
     * Execute a random action player on the grid.
     */
    playRandom() {
        this.executeAction(this.getRandomFreeCell());
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
        if (document.getElementById('autoplay').checked) {
            setTimeout(() => this.initializeGame(), 1000);
        }

        const btn = document.createElement('button');
        btn.innerText = 'Start new game';
        btn.classList.add('button');
        btn.addEventListener('click', () => {
            this.initializeGame();
        });
        return btn;
    }

    /**
     * Display which player's turn it is.
     */
    displayCurrentPlayer() {
        document.getElementById('info').innerText = this.playerSymbols[this.getPlayerNumber()];
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
        if (this.aiPlayer !== null) this.aiPlayer.learnDatas(datas);

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

    async teachAI() {
        if (this.aiPlayer.isLearning) {
            this.aiPlayer.isLearning = false;
            document.getElementById('learn-all').innerText = "Commencer l'apprentissage";
            document.getElementById('learn-spinner').classList.add('hidden');
            return;
        }

        // Shuffle datas
        this.datasToLearn.sort((a, b) => 0.5 - Math.random());
        
        document.getElementById('learn-spinner').classList.remove('hidden');
        document.getElementById('learn-all').innerText = "Arrêter l'apprentissage";

        this.aiPlayer.isLearning = true;
        this.aiPlayer.learnDataRecursively(this.datasToLearn);
    }
}