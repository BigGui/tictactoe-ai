import { Brain } from "./brain.js";
import * as utils from "../utils.js";

export class AiPlayer {
    constructor(params) {
        this.brain = new Brain();
        this.game = params.game || null;
        this.counterLoop = 0;
        this.learningCounter = 0;
        this.learningRatio = null;
        this.learningList = [];
        this.isLearning = false;
    }

    /**
     * Learn a sample of datas.
     * @param {array} datas - Sample of data to learn.
     */
    async learnDatas(datas) {
        let learningTotal = 0;
        let learningOK = 0;
        for (const data of datas) {
            const output = await this.brain.learnData(data.input, data.expectedOutput);
            this.learningCounter++;
            learningTotal++;
            if (utils.getArrayMaxIndex(output) === utils.getArrayMaxIndex(data.expectedOutput)) {
                learningOK++;
            }
        }
    }

    learnDatasToRatio(datas) {    
        // Get a random data from sample
        const data = utils.getRandomFromArray(datas);

        // Ask AI to learn this data and get his output
        this.brain
            .learnData(data.input, data.expectedOutput)
            .then(output => {
                // Compare this output to the expected output and add the result to the learning list result (0 or 1)
                this.learningList.push(utils.getArrayMaxIndex(output) === utils.getArrayMaxIndex(data.expectedOutput) ? 1 : 0);
                
                // Get ratio of success for the last 1000 datas
                if (this.learningList.length % 500 === 0) {
                    this.learningRatio = utils.getRatioFromArray(this.learningList, 5000);
                    console.log('...', this.learningList.length, '=>', this.learningRatio, '%');

                    document.getElementById('learn-count').innerText = `${this.learningList.length} actions apprises`;
                    document.getElementById('progress-learn').style.width = `${this.learningRatio.toFixed(2)}%`;
                    document.querySelector('#progress-learn .percent').innerText = `${this.learningRatio.toFixed(1)}% de bonnes réponses`;
                }

                if (this.isLearning) {
                    if (this.learningList.length % 500 === 0) {
                        setTimeout(() => this.learnDatasToRatio(datas), 200);
                    }
                    else {
                        this.learnDatasToRatio(datas);
                    }
                }
                else {
                    console.log('learning process is over ', `ratio ${Math.round(this.learningRatio)}%`);
                    document.getElementById('learn-spinner').classList.add('hidden');
                }
            });
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

        const input = this.game.formatGridToLayer();

        this.brain
            .askAnswer(input)
            .then(output => {

                this.showNetwork(input, output);

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

    showNetwork(input, output) {
        input.forEach((value, i) => {
            document.querySelector(`#layer-input .neuron:nth-child(${i+1})`).style.backgroundColor = utils.getNeuronColor(value);
            document.querySelector(`#layer-input .neuron:nth-child(${i+1})`).innerText = value.toFixed(1);
        });
        output.forEach((value, i) => {
            document.querySelector(`#layer-output .neuron:nth-child(${i+1})`).style.backgroundColor = utils.getNeuronColor(value);
            document.querySelector(`#layer-output .neuron:nth-child(${i+1})`).innerText = value.toFixed(1);
        });
        this.brain.layers.forEach((layer, i) => {
            if (i === 0 || i > 6) return;
            layer.getOutputs().forEach((value, j) => {
                document.querySelector(`#hidden-layers .layer:nth-child(${i}) .neuron:nth-child(${j+1})`).style.backgroundColor = utils.getNeuronColor(value);
            });
        });
    }

}