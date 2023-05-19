import { Layer } from './layer.js';

export class Brain {
    constructor(params) {
        if (params && params.datas.layers) {
            this.layers = [];
            params.datas.layers.forEach(l => {
                this.layers.push(new Layer({
                    length: l.length,
                    datas: l
                }));
            });
        }
        else {
            this.layers = [
                new Layer({length:9}),
                new Layer({length:30}),
                new Layer({length:30}),
                new Layer({length:50}),
                new Layer({length:50}),
                new Layer({length:30}),
                new Layer({length:30}),
                new Layer({length:9})
            ];
        }

        this.connectAllLayers();
        this.errorStats = [];
    }

    getFirstLayer() {
        return this.layers[0];
    }

    getLastLayer() {
        return this.layers[this.layers.length - 1];
    }

    countLayers() {
        this.layers.length;
    }

    setInputValues(values) {
        this.getFirstLayer().defineInputLayer(values);
    }

    setExpectedOutput(values) {
        this.getLastLayer().setExpectedOutputs(values);
    }

    connectAllLayers() {
        for(const l in this.layers) {
            if (l < 1) continue;
            this.layers[l-1].connectTo(this.layers[l]);
        }
    }

    initAllLayers() {
        this.layers.forEach(l => l.initialize());
    }

    async learnXTimes(x) {
        for(let r = 0; r < x; r++) {    
            await this.learnData([0, 1, 0, 1, 1, 0, 0, 1, 0, 1], [-1, .5]);
        }
    }

    async learnData(input, expectedOutput) {
        this.initAllLayers();

        this.setInputValues(input);

        this.setExpectedOutput(expectedOutput);

        const output = await this.getGlobalOutput();
        // console.table({exp:expectedOutput, out:output});
        // this.addErrorStats(expectedOutput, output);

        let errors = await this.propagateErrors();

        await this.updateSynapses();

        return output;
    }

    
    async askAnswer(input) {
        this.initAllLayers();

        this.setInputValues(input);

        return await this.getGlobalOutput();
    }
    
    async learn(expectedOutput) {
        this.setExpectedOutput(expectedOutput);

        await this.propagateErrors();

        await this.updateSynapses();
    }

    addErrorStats(expectedOutput, output) {
        expectedOutput.forEach((e, i) => {
            this.errorStats.push(Math.abs(e - output[i]));
        })
    }

    async updateSynapses() {
        this.layers.forEach(l => l.updateSynapses());
    }

    async propagateErrors() {
        let errors = [];
        for (let l = this.countLayers()-1; l > 0; l--) {
            errors.push(await this.layers[l].getErrors());
        }
        return errors;
    }

    async getGlobalOutput() {
        return this.getLastLayer().getOutputs();
    }

    getCopy() {
        const copy = new Brain();
        this.layers.forEach((l, i) => {
            l.neurons.forEach((n, j) => {
                const newN = copy.layers[i].neurons[j];
                newN.setCustomActivation(n.act.a, n.act.b);
                n.synpases.forEach((s, k) => {
                    newN.synpases[k].weight = s.weight;
                })
            })
        });
        return copy;
    }

    exportDatas() {
        return {
            nbLayers: this.countLayers(),
            layers: this.layers.map(l => l.exportDatas())
        }
    }

    importDatas(datas) {
        return;
    }

}