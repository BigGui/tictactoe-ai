
// -------------
// FUNCTIONS
// -------------

/**
 * Create a cell element to add to the grid.
 * 
 * @param {number} rowIndex - The row number of the cell
 * @param {number} colIndex - The column number of the cell
 * @returns The new LI element to display a cell grid
 */
function getNewCell(rowIndex, colIndex) {
    const li = document.createElement('li');
    li.id = `cell${rowIndex}-${colIndex}`;
    return li;
}



// -------------
// SCRIPT
// -------------

const grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

const gridElement = document.getElementById('grid'); 

grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        gridElement.appendChild(getNewCell(rowIndex, colIndex));
    });
});

gridElement.addEventListener('click', function(event) {
    if (event.target.tagName !== 'LI') return;

    console.log('Click on a cell !');
});
