const grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

const gridElement = document.getElementById('grid'); 

grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        const li = document.createElement('li');
        li.id = `cell${rowIndex}-${colIndex}`;
        gridElement.appendChild(li);
    });
});
