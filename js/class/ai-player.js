import { Brain } from "./brain.js";
import * as utils from "../utils.js";

export class AiPlayer {
    constructor(params) {
        this.brain = new Brain();
        this.playerNb = params.playerNb || 0;
        this.game = params.game || null;
        this.counterLoop = 0;
    }

    async learnDatas(datas) {
        let learningTotal = 0;
        let learningOK = 0;
        console.log('starting learning process...');
        for (const data of datas) {
            const output = await this.brain.learnData(data.input, data.expectedOutput);
            // learningCounter++;
            learningTotal++;
            if (utils.getArrayMaxIndex(output) === utils.getArrayMaxIndex(data.expectedOutput)) {
                learningOK++;
            }
        }
        console.log('learning process is over ', `ratio ${Math.round(learningOK / learningTotal * 100)}%`);
        document.getElementById('learnMsg').innerText = `ratio ${Math.round(learningOK / learningTotal * 100)}%`;
    }

    play() {
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
                this.game.executeAction(coord, this.playerNb);
            });
    }


}