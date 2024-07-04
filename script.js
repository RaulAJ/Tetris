
function getRandomInt(min, max) {
    // `Math.floor` redondea hacia abajo y `Math.random` genera un número entre 0 y 1.
    // Esto asegura que el número está dentro del rango [min, max).
    return Math.floor(Math.random() * (max - min) + min);
}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('myCanvas');
    const  ctx = canvas.getContext('2d');
    let audio = document.getElementById('myAudio');
    audio.play();


    audio.addEventListener('ended', function() {
        // Reinicia la reproducción desde el principio
        audio.currentTime = 0;
        audio.play();
    });
    document.addEventListener('keydown', handleKeyPress);
    let color = 'blue';
    const gridSize = 50;  // Tamaño de cada cuadrado
    const numRows = canvas.height / gridSize;
    const numCols = canvas.width / gridSize;
    let grid = [];
    let tile = null;
    let lineas_rotas = 0;
    let random = 1;
    let time_interval = 500;
    let interval = null;

    function initializeCanvas(){
        for (let row = 0; row < numRows; row++) {
            grid[row] = [];
            for (let col = 0; col < numCols; col++) {
                grid[row][col] = 'white'; // Inicialmente, todos los cuadrados son blancos
            }
        }
    }
    initializeCanvas();

    function start(){
        interval = setInterval(moveDown, time_interval);
        audio.play();
    }

    function stop(){
        clearInterval(interval);
        audio.pause();
    }

    function reset(){
        time_interval = 1000;
        despawnTile(random);
        stop();
        initializeCanvas();
        drawGrid();
        spawnTile(random);
        lineas_rotas = 0;
        audio.currentTime = 0
    }

    document.getElementById('pauseButton').addEventListener('click', stop);
    document.getElementById('startButton').addEventListener('click', start);
    document.getElementById('resetButton').addEventListener('click', reset);



    function changeInterval(new_interval){
        clearInterval(interval);
        time_interval = new_interval;
        interval = setInterval(moveDown, time_interval);
    }

    function drawGrid() {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                ctx.fillStyle = grid[row][col];
                ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
                /*ctx.strokeStyle = 'black';
                ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);*/
            }
        }
    }
    function defeat(){
        stop();
        alert("Has perdido palomo");
        let reset = confirm("Quieres jugar de nuevo?");
        if(reset){
            time_interval = 1000;
            lineas_rotas = 0;
            start();
            initializeCanvas();
        }
    }

    

    function spawnTile(){
        random = getRandomInt(1, 5);
        tile = {row: 0, col: 2, size: 3, 
            map: [
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1]
        ]};
        switch (random){
            case 1:
                tile.map = [
                    [1, 1, 1],
                    [0, 0, 0],
                    [0, 0, 0]
                ];
                color = 'blue';
                break;
            case 2:
                tile.map = [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ];
                color = 'red';
                break;

            case 3:
                tile.map = [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]
                ];
                color = 'orange';
                break;
            case 4: 
                tile.map = [
                    [0, 0, 0],
                    [0, 1, 1],
                    [1, 1, 0]
                ];
                color = 'yellow';
            break;
        }

        let derrota = false;
        for(let i = 0; i < tile.size; i++){
            for(let j = 0; j < tile.size; j++){
                if(tile.map[i][j] === 1){
                    if(grid[i + tile.row][j + tile.col] !== 'white'){
                        derrota = true;
                    }
                    else{
                        grid[i + tile.row][j + tile.col] = color;
                    }
                }
            }
        }
        if(derrota){
            defeat();
        }
    }

    

    function despawnTile(){
        
        for(let i = 0; i < tile.size; i++){
            for(let j = 0; j < tile.size; j++){
                if(tile.map[i][j] === 1){
                    grid[i + tile.row][j + tile.col] = 'white';
                }
            }
        }
    }

    function handleKeyPress(event){
        switch(event.key){
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;

            case 'ArrowDown':
                moveDown();
                break;

            case 'r':
            case 'R':
                despawnTile();
                rotate();
                drawGrid();
                break;
        }
        
    }

    function borroLinea(linea){
        for(let i = 0; i < numCols; i++){
            grid[linea][i] = 'white';
        }
    }

    function bajoLineas(linea_rota){
        for (let row = linea_rota; row >= 1; row--) {
            for (let col = numCols - 1; col >= 0; col--) {
                grid[row][col] = grid[row - 1][col];
            }
        }
    }

    function destroyLines(){
        for (let row = 0; row < numRows; row++) {
            let linea_completa = false;
            for (let col = 0; col < numCols; col++) {
                if(grid[row][col] === 'white'){
                    break;
                }
                if(col === numCols - 1){
                    linea_completa = true;
                }
            }
            if(linea_completa){
                lineas_rotas++;
                borroLinea(row);
                bajoLineas(row);
                changeInterval(time_interval - 10);
            }
        }
        
    }

    function lockTile(){
        destroyLines();
        drawGrid();
        spawnTile(random);
    }

    function updateGridAfterRotate(){
        for(let i = 0; i < tile.size; i++){
            for(let j = 0; j < tile.size; j++){
                if(tile.map[i][j] === 1){
                    grid[i + tile.row][j + tile.col] = color;
                }
            }
        }
    }

    function trasponerMatriz(tile){
        let nuevaMatriz = 
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        for(let i = 0; i < tile.size; i++){
            for(let j = 0; j < tile.size; j++){
                nuevaMatriz[j][i] = tile.map[i][j];
            }
        }

        for (let i = 0; i < tile.size; i++) {
            nuevaMatriz[i].reverse();
        }
        for(let i = 0; i < tile.size; i++){
            for(let j = 0; j < tile.size; j++){
                if(grid[i + tile.row][j + tile.col] !== 'white'){
                    return;
                }
            }
        }

        tile.map = nuevaMatriz;
    }

    function rotate(){
        //updateGridBeforeRotate();
        trasponerMatriz(tile);
        updateGridAfterRotate();
    }

    function puedeAbajo(){
       
        for(let i = 0; i < tile.size; i++){
            if(tile.map[2][i] === 1){
                return 0;
            }
        }
        for(let i = 0; i < tile.size; i++){
            if(tile.map[1][i] === 1){
                return 1;
            }
        }
        return 2;
    
    }

    function moveDown(){
        let val = puedeAbajo();

        if(tile.row + tile.size - val < numRows){
                //miro la parte baja de la ficha
                /*for(let j = 0; j < tile.size; j++){
                    if(tile.map[tile.size - val - 1][j] === 1 && grid[tile.row + tile.size - val][j + tile.col] !== 'white'){
                        lockTile();
                    }
                }*/
                for(let i = 0; i < tile.size; i++){
                    for(let j = 0; j < tile.size; j++){
                        if(tile.map[i][j] === 1){
                            if(i !== tile.size - 1){    
                                if(tile.map[i+1][j] !== 1 && grid[tile.row + 1 + i][tile.col + j] !== 'white'){
                                    lockTile();
                                }
                            }
                            else{
                                if(grid[tile.row + 1 + i][tile.col + j] !== 'white'){
                                    lockTile();
                                }
                            }
                        }
                    }
                }
            despawnTile();

            for(let i = 0; i < tile.size; i++){
                for(let j = 0; j < tile.size; j++){
                    if(tile.map[i][j] === 1){
                        grid[i + tile.row + 1][j + tile.col] = color;
                    }
                }
            }
            let newTile = {row: tile.row + 1, col: tile.col, size: tile.size, map: tile.map};
            tile = newTile;
            drawGrid();
        }

        else{
            lockTile();
        }
        
    }

    function puedeIzq(){
        for(let i = 0; i < tile.size; i++){
            if(tile.map[i][0] === 1){
                return 0;
            }
        }
        for(let i = 1; i < tile.size; i++){
            if(tile.map[i][1] === 1){
                return 1;
            }
        }
        return 2;
    }

    function moveLeft(){
        let val = puedeIzq();
        if(val + tile.col){
            //miro izq
            for(let j = 0; j < tile.size; j++){
                if(tile.map[j][val] === 1 && grid[tile.row + j][tile.col - 1 + val] !== 'white'){
                    //lockTile();
                    return;
                }
            }

            despawnTile();

            for(let i = 0; i < tile.size; i++){
                for(let j = 0; j < tile.size; j++){
                    if(tile.map[i][j] === 1){
                        grid[i + tile.row][j + tile.col - 1] = color;
                    }
                }
            }
            let newTile = {row: tile.row, col: tile.col - 1, size: tile.size, map: tile.map};            
            tile = newTile;
            drawGrid();
        }
    }

    function puedeDer(){
        for(let i = 0; i < tile.size; i++){
            if(tile.map[i][2] === 1){
                return 0;
            }
        }
        for(let i = 1; i < tile.size; i++){
            if(tile.map[i][1] === 1){
                return 1;
            }
        }
        return 2;
    }


    function moveRight(){
        //potenciamlmente modificar como en izq
        let val = puedeDer();
        if(tile.col + tile.size - val !== numCols){
            //miro der
            
            for(let j = 0; j < tile.size; j++){
                if(tile.map[j][tile.size - 1 - val] === 1 && grid[j + tile.row][tile.col + 1 + tile.size - 1 - val] !== 'white'){
                    //lockTile();
                    return;
                }
            }

            despawnTile();


            for(let i = 0; i < tile.size; i++){
                for(let j = 0; j < tile.size; j++){
                    if(tile.map[i][j] === 1){
                        grid[i + tile.row][j + tile.col + 1] = color;
                    }
                }
            }
            let newTile = {row: tile.row, col: tile.col + 1, size: tile.size, map: tile.map};            
            tile = newTile;
            drawGrid();
        }
    }

    
    spawnTile(random);

    drawGrid();
    
    start();

});


