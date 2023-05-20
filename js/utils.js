/**
 * Return the index of the maximum value in the the given array.
 * 
 * @param {array} array - The array 
 * @returns the index for the max value of the array
 */
export function getArrayMaxIndex(array) {
    let maxIndex;
    for (const i in array) {
        if (maxIndex === undefined || array[i] > array[maxIndex]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}


/**
 * Indicates if the array given has been filled with the same value.
 * 
 * @param {array} array - The array to analyze
 * @returns {boolean} Result of the analysis ?
 */
export function isArrayFullAndRegular(array) {
    return array.every(v => v !== 0 && v === array[0]);
}

export function getRatioFromArray(array, nb) {
    const slice = array.slice(nb * -1);
    return slice.reduce((a, b) => a + b, 0) / slice.length * 100;
} 

export function getRandomFromArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

