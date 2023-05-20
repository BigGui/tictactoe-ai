import { Brain } from "./brain.js";
import * as utils from "../utils.js";

export class AiPlayer {
    constructor(params) {
        this.brain = new Brain();
        this.game = params.game || null;
        this.counterLoop = 0;
        this.learningCounter = 0;
        this.learningRatio = null;
    }

    /**
     * Learn a sample of datas.
     * @param {array} datas - Sample of data to learn.
     */
    async learnDatas(datas) {
        let learningTotal = 0;
        let learningOK = 0;
        console.log('starting learning process...');
        for (const data of datas) {
            const output = await this.brain.learnData(data.input, data.expectedOutput);
            this.learningCounter++;
            learningTotal++;
            if (utils.getArrayMaxIndex(output) === utils.getArrayMaxIndex(data.expectedOutput)) {
                learningOK++;
            }
        }

        this.learningRatio = learningOK / learningTotal * 100;
        console.log('learning process is over ', `ratio ${Math.round(this.learningRatio)}%`);
        document.getElementById('learnMsg').innerText = `ratio ${Math.round(this.learningRatio)}%`;
    }

    async learnDatasToRatio(datas, ratio) {
        let learningList = [];
        console.log('starting learning process...');
    
        while (learningList.length < 5000 || this.learningRatio < ratio || learningList.length > 200000) {
            // Get a random data from sample
            const data = utils.getRandomFromArray(datas);

            // Ask AI to learn this data and get his output
            const output = await this.brain.learnData(data.input, data.expectedOutput);

            // Compare this output to the expected output and add the result to the learning list result (0 or 1)
            learningList.push(utils.getArrayMaxIndex(output) === utils.getArrayMaxIndex(data.expectedOutput) ? 1 : 0);
            
            // Get ratio of success for the last 1000 datas
            if (learningList.length % 500 === 0) {
                this.learningRatio = utils.getRatioFromArray(learningList, 5000);
                console.log('...', learningList.length, '=>', this.learningRatio, '%');
            }
        }
        console.log('learning process is over ', `ratio ${Math.round(this.learningRatio)}%`);
    }

    /**
     * Ask AI to play.
     */
    play() {
        // If an AI play the first turn, pick a cell randomly
        if (this.game.roundCounter === 0) {
            // Execute the action
            this.game.executeAction(this.game.getRandomFreeCell());
            return;
        }

        this.brain
            .askAnswer(this.game.formatGridToLayer())
            .then(output => {
                let coord = this.game.getCoordFromIndex(utils.getArrayMaxIndex(output));

                this.counterLoop++;
                // Avoid looping in a trap
                if (this.counterLoop > 100) coord = this.game.getRandomFreeCell();

                // The cell picked by AI is not empty
                // Teach him to play on a free cell
                // and play again
                if (!this.game.isCellFree(coord)) {
                    // Give as expected output, the value 1 only for the free cell
                    // with the best value of the inital output.
                    const expectedOutput = Array(9).fill(0);
                    const maxIndex = utils.getArrayMaxIndex(output.map((v, i) => this.game.isCellFreeFromIndex(i) ? v : -1));
                    expectedOutput[maxIndex] = 1;
                    this.brain
                        .learn(expectedOutput)
                        .then(() => this.play());
                    return;
                }

                this.counterLoop = 0;

                // Execute the action
                this.game.executeAction(coord);
            });
    }


}