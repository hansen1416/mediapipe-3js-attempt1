"""
function subsequenceDTW(s, t, w) {
  // s and t are the two time series to compare
  // w is the half window size

  // Compute the distance matrix
  const n = s.length;
  const m = t.length;
  const DTW = new Array(n).fill(null).map(() => new Array(m).fill(Infinity));
  DTW[0][0] = 0;

  for (let i = 1; i < n; i++) {
    for (let j = Math.max(1, i - w); j < Math.min(m, i + w); j++) {
      const cost = Math.abs(s[i] - t[j]);
      DTW[i][j] = cost + Math.min(DTW[i - 1][j], DTW[i][j - 1], DTW[i - 1][j - 1]);
    }
  }

  // Return the DTW distance between the two time series
  return DTW[n - 1][m - 1];
}
"""
import math
import numpy as np


def dtw_distance(s1, s2, dist_func=lambda x, y: math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)):
    n, m = len(s1), len(s2)
    DTW = [[float('inf') for j in range(m + 1)] for i in range(n + 1)]
    DTW[0][0] = 0

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = dist_func(s1[i - 1], s2[j - 1])
            DTW[i][j] = cost + min(DTW[i - 1][j], DTW[i]
                                   [j - 1], DTW[i - 1][j - 1])

    return DTW[n][m]


def compute_cost_matrix(s1, s2, metric=lambda x, y: math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)):

    m, n = len(s1), len(s2)
    matrix = np.zeros((m, n))

    for i in range(m):
        for j in range(n):
            matrix[i][j] = metric(s1[i], s2[j])

    return matrix


def compute_accumulated_cost_matrix_subsequence_dtw(C):
    """Given the cost matrix, compute the accumulated cost matrix for
    subsequence dynamic time warping with step sizes {(1, 0), (0, 1), (1, 1)}

    Notebook: C7/C7S2_SubsequenceDTW.ipynb

    Args:
        C (np.ndarray): Cost matrix

    Returns:
        D (np.ndarray): Accumulated cost matrix
    """
    N, M = C.shape
    D = np.zeros((N, M))
    D[:, 0] = np.cumsum(C[:, 0])
    D[0, :] = C[0, :]
    for n in range(1, N):
        for m in range(1, M):
            D[n, m] = C[n, m] + min(D[n-1, m], D[n, m-1], D[n-1, m-1])
    return D


def compute_optimal_warping_path_subsequence_dtw(D, m=-1):
    """Given an accumulated cost matrix, compute the warping path for
    subsequence dynamic time warping with step sizes {(1, 0), (0, 1), (1, 1)}

    Notebook: C7/C7S2_SubsequenceDTW.ipynb

    Args:
        D (np.ndarray): Accumulated cost matrix
        m (int): Index to start back tracking; if set to -1, optimal m is used (Default value = -1)

    Returns:
        P (np.ndarray): Optimal warping path (array of index pairs)
    """
    N, M = D.shape
    n = N - 1
    if m < 0:
        m = D[N - 1, :].argmin()
    P = [(n, m)]

    while n > 0:
        if m == 0:
            cell = (n - 1, 0)
        else:
            val = min(D[n-1, m-1], D[n-1, m], D[n, m-1])
            if val == D[n-1, m-1]:
                cell = (n-1, m-1)
            elif val == D[n-1, m]:
                cell = (n-1, m)
            else:
                cell = (n, m-1)
        P.append(cell)
        n, m = cell
    P.reverse()
    P = np.array(P)
    return P


def subsequenceDTW(s1, s2, metric=lambda x, y: math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)):

    cost_matrix = compute_cost_matrix(s1, s2, metric)

    accumulated_matrix = compute_accumulated_cost_matrix_subsequence_dtw(
        cost_matrix)

    optimal_path = compute_optimal_warping_path_subsequence_dtw(
        accumulated_matrix)

    return {
        'optimal_path': optimal_path.tolist(),
        'a*': optimal_path[0, 1],
        'b*': optimal_path[-1, 1],
        'optimal_subsequence': s2[optimal_path[0, 1]:optimal_path[-1, 1]+1],
        'accumulated_cost': accumulated_matrix[-1, optimal_path[-1, 1]]
    }


if __name__ == "__main__":

    # s1 = [0, 0, 1, 2, 1, 0, 1, 0, 0]
    # s2 = [0, 1, 2, 0, 0, 0, 0, 0, 0]
    s1 = [[3, 3], [0, 0], [6, 6]]
    s2 = [[2, 2], [4, 4], [0, 0], [4, 4], [0, 0], [0, 0], [5, 5], [2, 2]]

    # s1 = [3, 0, 6]
    # s2 = [2, 4, 0, 4, 0, 0, 5, 2]

    # res = subsequenceDTW(s1, s2, metric=lambda x, y: abs(x-y))
    res = subsequenceDTW(s1, s2)

    print(res)


    # # c = dtw_distance(s1, s2, dist_func=lambda x, y: abs(x-y))
    # c = dtw_distance(s1, s2)

    # print(c)
