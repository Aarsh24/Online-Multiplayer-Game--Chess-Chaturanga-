import Chess from 'chess.js';

let chess;

const INF = 99999999;

let pieceValue = [];
// black piece with lower case letters
pieceValue['p'] = 100; // pawn
pieceValue['n'] = 300; // knight
pieceValue['b'] = 300; // bishop
pieceValue['r'] = 500; // rook
pieceValue['q'] = 900; // queen
pieceValue['k'] = 20000; // king

// white piece with upper case letters
pieceValue['P'] = 100; // pawn
pieceValue['N'] = 300; // knight
pieceValue['B'] = 300; // bishop
pieceValue['R'] = 500; // rook
pieceValue['Q'] = 900; // queen
pieceValue['K'] = 20000; // king

// during evalution all pieces will also be evaluted based on their position on board.
// this values is for white pieces.
let positionWeightWhite = [];
positionWeightWhite['p'] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

positionWeightWhite['n'] = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
];

positionWeightWhite['b'] = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
];

positionWeightWhite['r'] = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
];

positionWeightWhite['q'] = [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
];
positionWeightWhite['k'] = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
];
positionWeightWhite['k_end'] = [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
];

let positionWeightBlack = positionWeightWhite;

for (let i in positionWeightBlack) {
    for (let j = 0; j < 8; j++) {
        positionWeightBlack[i][j].reverse();
    }
    positionWeightBlack[i].reverse();
}

const evaluteBoard = (maximizingPlayer) => {
    if (chess.in_checkmate()) {
        // if it's checkmate then check which player got checkmate
        // if computer got checkmate then it is not desirable
        // if opponent got checkmate then it is the best position we want
        if (maximizingPlayer) {
            return INF;
        } else {
            return -INF;
        }
    }

    let evalution = 0;
    let fen = chess.fen();

    // from fen notation find get piece detail part.
    let pieces = fen.split(' ')[0];

    // now find the position of all piece and give score accroding to postion.
    let curx = 0,
        cury = 0;
    // if we are in endgame we will evalute king with little bit different values.
    // if number of pieces is low than we define this as endgame.
    let endGame = false,
        pieceCnt = 0;
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i] in pieceValue) {
            pieceCnt++;
        }
    }
    if (pieceCnt <= 10) endGame = true;

    // now we will evalute board position based on 2 things
    // 1. piece values
    // 2. piece postion values.

    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i] in pieceValue) {
            // if it is lowercase then it is black piece.
            // else it is white pieces.
            if (pieces[i] >= 'a' && pieces[i] <= 'z') {
                evalution += pieceValue[pieces[i]];

                if (endGame && pieces[i] === 'k') {
                    evalution += positionWeightBlack['k_end'][curx][cury];
                } else {
                    evalution += positionWeightBlack[pieces[i]][curx][cury];
                }
            } else {
                evalution -= pieceValue[pieces[i]];

                if (endGame && pieces[i] === 'k') {
                    evalution += positionWeightWhite['k_end'][curx][cury];
                } else {
                    evalution -= positionWeightWhite[pieces[i].toLowerCase()][curx][cury];
                }
            }
        } else {
            // if we encounter '/' then it measn that we reached the end of the row.
            if (pieces[i] === '/') {
                // go to the next row on chess board.
                curx++;
                cury = 0;
            } else {
                // if it is number then jump position on board in current row by that number.
                cury += parseInt(pieces[i]);
            }
        }
    }

    return evalution;
};

const minimax = (depth, alpha, beta, maximizingPlayer) => {
    // if we reach the depth limit or game is over then return then evalution value for the current board position.
    if (depth === 0 || chess.game_over()) {
        return [evaluteBoard(!maximizingPlayer), null];
    }

    // generate all possible moves.
    const moves = chess.moves({ verbose: true });

    // sort moves randomly to avoid selecting same move again and again.
    for (let i = moves.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [moves[i], moves[j]] = [moves[j], moves[i]];
    }

    if (maximizingPlayer) {
        // if it is the turn of maximizing player then try to pick position with maximum evalution value.
        let maxEvalution = -INF;
        let move = null;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            let res = minimax(depth - 1, alpha, beta, !maximizingPlayer);
            if (maxEvalution < res[0]) {
                maxEvalution = res[0];
                move = moves[i];
            }
            alpha = Math.max(alpha, res[0]);
            chess.undo();

            if (beta <= alpha) {
                break;
            }
        }
        return [maxEvalution, move];
    } else {
        // if it is the turn of minimizing player then try to pick position with minimum evalution value.
        let minEvalution = INF;
        let move = null;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            let res = minimax(depth - 1, alpha, beta, !maximizingPlayer);
            if (minEvalution > res[0]) {
                minEvalution = res[0];
                move = moves[i];
            }
            beta = Math.min(beta, res[0]);
            chess.undo();

            if (beta <= alpha) {
                break;
            }
        }
        return [minEvalution, move];
    }
};

export const GenerateMove = (fen) => {
    chess = new Chess(fen);

    // depth of minimax.
    const depth = 3;

    // const t0 = performance.now();
    const result = minimax(depth, -INF, INF, true);
    // const t1 = performance.now();
    // console.log(`Took ${t1 - t0} milliseconds`)

    // result will have 2 values
    // first one is evalution value
    // second is the move
    return result[1];
};
