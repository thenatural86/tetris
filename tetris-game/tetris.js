// select the canvas element
const cvs = document.getElementById("tetris")
// the getContext method called on canvas returns an object that provides methods and properties for drawing on the canvas
const ctx = cvs.getContext("2d")
const scoreElement = document.getElementById("score")
// game board has 10 columns and 20 rows
const ROW = 20
const COL = (COLUMN = 10)
const SQ = (squareSize = 20)
// empty square color
const VACANT = "#336BA4"

// getContext methods, draw a square
function drawSquare(x, y, color) {
  // sets the color, gradient or pattern to fill the drawing
  ctx.fillStyle = color
  // 	Draws a "filled" rectangle (x,y,width, height)
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ)
  // Sets or returns the color, gradient, or pattern used for strokes
  ctx.strokeStyle = "BLACK"
  // Draws a rectangle (no fill)
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

// create the board
// board is defined as an empty array
let board = []
// for loop to create rows
for (r = 0; r < ROW; r++) {
  // initialize as empty array
  board[r] = []
  // create columns
  for (c = 0; c < COL; c++) {
    //set every square of the board to VACANT
    board[r][c] = VACANT
  }
}

// draw the board
// use same for loops to draw rows/cols, then drawSquare function called with c,r,board[r][c] as x,y and color arguments
function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c])
    }
  }
}

drawBoard()

// pieces and the colors
const PIECES = [
  [Z, "red"],
  [S, "lime"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"]
]

// generate random pieces
function randomPiece() {
  let r = Math.floor(Math.random() * PIECES.length)
  return new Piece(PIECES[r][0], PIECES[r][1])
}

// initiate a piece
let p = randomPiece()

// Create the Piece Object
// parameters
function Piece(tetromino, color) {
  // properties
  this.tetromino = tetromino
  this.color = color
  // start from the first pattern of tetrominoes array
  this.tetrominoN = 0
  // the piece or pattern that user is playing with in real time
  this.activeTetromino = this.tetromino[this.tetrominoN]
  // coordinates for where the piece where fall from
  this.x = 3
  this.y = -2
}

// fill function
Piece.prototype.fill = function(color) {
  // each loop through draws out the rows for the square
  for (r = 0; r < this.activeTetromino.length; r++) {
    // each loop through draws out the columns for the square
    for (c = 0; c < this.activeTetromino.length; c++) {
      // only draw occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color)
      }
    }
  }
}

// draw a piece to the board using the this.fill helper method
Piece.prototype.draw = function() {
  this.fill(this.color)
}

// undraw a piece to the board using the this.fill helper method
Piece.prototype.unDraw = function() {
  this.fill(VACANT)
}

// Move piece down
Piece.prototype.moveDown = function() {
  // check to see if there is no collision before making a movement
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw()
    // increments the y position by 1 square
    this.y++
    // draw piece in new position
    this.draw()
  } else {
    // we lock the piece and generate a new one
    this.lock()
    p = randomPiece()
  }
}

// move a piece to the right
Piece.prototype.moveRight = function() {
  // check to see if there is no collision before making a movement
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw()
    // increments the x position by 1 square
    this.x++
    // draw piece in new position
    this.draw()
  }
}

// move a piece to the left
Piece.prototype.moveLeft = function() {
  // check to see if there is no collision before making a movement
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw()
    // decrements the x position by 1 square
    this.x--
    // draw piece in new position
    this.draw()
  }
}

// rotate the piece
// go through the tetromino piece patterns and increment through the array of patterns
Piece.prototype.rotate = function() {
  let nextPattern = this.tetromino[
    // cannot use strict increment to cycle through pattern, so use the modulo operator, i.e
    //  0 + 1 % 4 = 1; 3 + 1 % 4 = 1
    (this.tetrominoN + 1) % this.tetromino.length
  ]
  let kick = 0
  // checking to see if there is a collision,
  if (this.collision(0, 0, nextPattern)) {
    // checking to see which side the collision happens on, if right wall, the kick is -1, moving the piece 1 over to the left
    if (this.x > COL / 2) {
      kick = -1
      // if it's the left wall, we kick to 1, moving the piece 1 over to the right
    } else {
      kick = 1
    }
  }
  // check to see if there is no collision with the kick, if there us not,
  if (!this.collision(kick, 0, nextPattern)) {
    // undraw the piece
    this.unDraw()
    // then kick the piece
    this.x += kick
    // increment the tetromino number
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length
    // update active tetromino
    this.activeTetromino = this.tetromino[this.tetrominoN]
    // then draw the pattern
    this.draw()
  }
}

let score = 0
Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // skip vacant squares
      if (!this.activeTetromino[r][c]) {
        continue
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) {
        alert("Game Over :(")
        // stop request animation frame
        gameOver = true
        break
      }
      // lock the piece
      board[this.y + r][this.x + c] = this.color
    }
  }
  // remove full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && board[r][c] != VACANT
    }
    if (isRowFull) {
      // if the row is full
      // we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c]
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT
      }
      // increment the score
      score += 10
    }
  }
  drawBoard()
  scoreElement.innerHTML = score
}

//collision detection function. Before any movement of a piece (right, left, down, rotation) we have to check if that movement will lead to a collision. Check if there will be a collision, if false do the movement, if true, don't do the movement. Therefore function needs to now the piece and its future coordinates so we pass in x, y and piece as parameters.
Piece.prototype.collision = function(x, y, piece) {
  // loop over all the tetromino squares
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if this tetromino square is not occupied, skip
      if (!piece[r][c]) {
        // continue key word?
        continue
      }
      //  coordinates of the piece after moving
      // this.x + c and this.y + r are the coordinates of any square, then plus x or plus y is the coordinate for the new square     after movement.

      let newX = this.x + c + x
      let newY = this.y + r + y

      // if new x coordinate is less than 0 which is the left wall border, or new x coordinate is greater than column, or new y is greater than row, then true, there is a collision
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true
      }
      // skip newY < 0; board[-1] will crash game, no index with -1
      if (newY < 0) {
        continue
      }
      // check if there is a locked pieced already in place so that the tetromino doesn't go through locked piece, if square if not vacant, return true and there is a collision
      if (board[newY][newX] != VACANT) {
        return true
      }
    }
  }
  return false
}

// control the piece, whenever the player presses a key down the control function fires off
document.addEventListener("keydown", CONTROL)
// every key on keyboard has a code, if the code corresponds to one of the below codes run the control function
function CONTROL(event) {
  // 37 corresponds to left arrow
  if (event.keyCode == 37) {
    p.moveLeft()
    dropStart = Date.now()
    // 38 corresponds to left arrow
  } else if (event.keyCode == 38) {
    p.rotate()
    dropStart = Date.now()
    // 39 corresponds to left arrow
  } else if (event.keyCode == 39) {
    p.moveRight()
    dropStart = Date.now()
    // 40 corresponds to left arrow
  } else if (event.keyCode == 40) {
    p.moveDown()
    // dropStart = Date.now()
  }
}

// drop the piece every 1 second
let dropStart = Date.now()
let gameOver = false
function drop() {
  let now = Date.now()
  let delta = now - dropStart
  if (delta > 1000) {
    p.moveDown()
    dropStart = Date.now()
  }
  if (!gameOver) {
    requestAnimationFrame(drop)
  }
}

drop()
