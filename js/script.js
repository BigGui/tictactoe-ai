import { TicTacToe } from "./class/tictactoe.js";

// -------------
// SCRIPT
// -------------

const game = new TicTacToe();
document.getElementById('create-btn').addEventListener('click', function () {
    game.create();
});


// -------------
// NEURONAL NETWORK
// -------------

document.querySelectorAll('.layer[data-neurons]').forEach(layer => {
    while (layer.children.length < layer.dataset.neurons) {
        layer.appendChild(createnNeuron());
    }
});

function createnNeuron() {
    const neuron = document.createElement('div');
    neuron.className = 'neuron neuron-xxs';
    return neuron;
}
// function createSynapse() {
//     const synapse = document.createElement('div');
//     synapse.className = 'synapse';
//     return synapse;
// }

// const layers = document.querySelectorAll('.layer');
// for (let i = 0; i < layers.length - 1; i++) {
//     const currentLayer = layers[i];
//     const nextLayer = layers[i + 1];
//     const currentNeurons = currentLayer.querySelectorAll('.neuron');
//     const nextNeurons = nextLayer.querySelectorAll('.neuron');
//     currentNeurons.forEach(currentNeuron => {
//         nextNeurons.forEach(nextNeuron => {
//             const synapse = createSynapse();
//             currentNeuron.appendChild(synapse);
//         });
//     });
// }