function computeCostMatrix(s1, s2, metric = (x, y) => Math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)) {
    const m = s1.length;
    const n = s2.length;
    const matrix = new Array(m).fill(null).map(() => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = metric(s1[i], s2[j]);
        }
    }

    return matrix;
}

function computeAccumulatedCostMatrixSubsequenceDTW(C) {
    const N = C.length;
    const M = C[0].length;
    const D = new Array(N).fill(null).map(() => new Array(M).fill(0));

    for (let i = 0; i < N; i++) {
        D[i][0] = i === 0 ? C[i][0] : D[i - 1][0] + C[i][0];
    }

    for (let j = 0; j < M; j++) {
        D[0][j] = C[0][j];
    }

    for (let n = 1; n < N; n++) {
        for (let m = 1; m < M; m++) {
            D[n][m] = C[n][m] + Math.min(D[n - 1][m], D[n][m - 1], D[n - 1][m - 1]);
        }
    }

    return D;
}

function computeOptimalWarpingPathSubsequenceDTW(D, m = -1) {
    const N = D.length;
    // const M = D[0].length;
    let n = N - 1;

    if (m < 0) {
        m = D[N - 1].reduce((minIndex, value, index) => value < D[N - 1][minIndex] ? index : minIndex, 0);
    }

    const P = [[n, m]];

    while (n > 0) {
        let cell;

        if (m === 0) {
            cell = [n - 1, 0];
        } else {
            const val = Math.min(D[n - 1][m - 1], D[n - 1][m], D[n][m - 1]);

            if (val === D[n - 1][m - 1]) {
                cell = [n - 1, m - 1];
            } else if (val === D[n - 1][m]) {
                cell = [n - 1, m];
            } else {
                cell = [n, m - 1];
            }
        }

        P.push(cell);
        [n, m] = cell;
    }

    P.reverse();
    return P;
}

function subsequenceDTW(s1, s2, metric = (x, y) => Math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)) {
    const costMatrix = computeCostMatrix(s1, s2, metric);
    const accumulatedMatrix = computeAccumulatedCostMatrixSubsequenceDTW(costMatrix);
    const optimalPath = computeOptimalWarpingPathSubsequenceDTW(accumulatedMatrix);

    const aStar = optimalPath[0][1];
    const bStar = optimalPath[optimalPath.length - 1][1];
    const optimalSubsequence = s2.slice(aStar, bStar + 1);
    const accumulatedCost = accumulatedMatrix[accumulatedMatrix.length - 1][bStar];

    return {
        optimalPath: optimalPath,
        aStar: aStar,
        bStar: bStar,
        optimalSubsequence: optimalSubsequence,
        accumulatedCost: accumulatedCost
    };
}

// const s1 = [3, 0, 6]
// const s2 = [2, 4, 0, 4, 0, 0, 5, 2]

const s1 = [[3, 3], [0, 0], [6, 6]]
const s2 = [[2, 2], [4, 4], [0, 0], [4, 4], [0, 0], [0, 0], [5, 5], [2, 2]]

const res = subsequenceDTW(s1, s2)

console.log(res)