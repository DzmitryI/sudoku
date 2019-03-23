module.exports = function solveSudoku(matrix) {
  // your solution
  const matrixend = [];
  const matrixnew = initMatrix(matrix);

  methods(matrixnew);

  let i_min = -1;
  let j_min = -1;
  let suggests_cnt = 0;

  for (let i = 0; i < 9; i++) {
    matrixend[i] = [];
    for (let j = 0; j < 9; j++) {
      matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], row(i, matrixnew));//уберем задвоение в массиве замен
      matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], col(j, matrixnew));
      matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], sect(i, j, matrixnew));
      matrixend[i][j] = matrixnew[i][j][0];
      // if ('no' == matrixnew[i][j][1])
        // console.log("i " + i + " j " + j + " " + matrixnew[i][j][2]);
      if ('no' == matrixnew[i][j][1] && (matrixnew[i][j][2].length < suggests_cnt || !suggests_cnt)) {
        suggests_cnt = matrixnew[i][j][2].length;
        i_min = i;
        j_min = j;
      }
    }
  }
  if (isSolved(matrixnew)) {
    // console.log("Все заполнено");
    // console.log(matrixnew);
    // console.log(matrixend);
    return matrixend;
  }
  // проходим по всем элементам, находим нерешенные,
  // выбираем кандидата и пытаемся решить
  for (let k = 0; k < suggests_cnt; k++) {
    matrixend[i_min][j_min] = matrixnew[i_min][j_min][2][k];
    // console.log("i_min " + i_min + " j_min " + j_min + " " + matrixend[i_min][j_min]);
    // console.log(matrixnew);
    // if (isFailed(matrixnew)) {
    return solveSudoku(matrixend);
    // }
  }
}

//Проверка на найденное решение
const isSolved = (matrix) => {
  let is_solved = true;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if ('no' == matrix[i][j][1]) {
        is_solved = false;
      }
    }
  }
  return is_solved;
}

const initMatrix = (matrix) => { //инициализируем матрицу
  const matrixnew = [];
  const massimply = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < matrix.length; i++) {
    matrixnew[i] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] !== 0) {
        matrixnew[i][j] = [matrix[i][j], 'yes', []];
      }
      else
        matrixnew[i][j] = [matrix[i][j], 'no', massimply];
    }
  }
  return matrixnew;
}

const methods = (matrix) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if ('no' != matrix[i][j][1]) {
        // Здесь решение либо найдено, либо задано
        continue;
      }
      // "Одиночка"
      solveSingle(i, j, matrix);
      // "Скрытый одиночка"
      solveHiddenSingle(i, j, matrix);
    }
  }
}

const row = (i, matrixnew) => {
  let znRow = [];
  for (let j = 0; j < 9; j++) {
    if ('no' != matrixnew[i][j][1]) {
      znRow[znRow.length] = matrixnew[i][j][0];
    }
  }
  return znRow;
}

const col = (j, matrixnew) => {
  let znRow = [];
  for (let i = 0; i < 9; i++) {
    if ('no' !== matrixnew[i][j][1]) {
      znRow[znRow.length] = matrixnew[i][j][0];
    }
  }
  return znRow;
}

const sect = (i, j, matrixnew) => {
  let znSect = [];
  let offset = sectOffset(i, j);
  // console.log(offset);
  for (let k = 0; k < 3; k++) {
    for (let l = 0; l < 3; l++) {
      if ('no' != matrixnew[offset.i + k][offset.j + l][1]) {
        znSect[znSect.length] = matrixnew[offset.i + k][offset.j + l][0];
      }
    }
  }
  return znSect;
}

// Расчет смещения секции
const sectOffset = (i, j) => {
  return {
    j: Math.floor(j / 3) * 3,
    i: Math.floor(i / 3) * 3
  };
}

//Вычисление разницы между двумя массивами
const arrayDiff = (ar1, ar2) => {
  // console.log("ar1 "+ar1+" \nar2 "+ar2);
  let arr_diff = [];
  for (let i = 0; i < ar1.length; i++) {
    let is_found = false;
    for (let j = 0; j < ar2.length; j++) {
      if (ar1[i] == ar2[j]) {
        is_found = true;
        break;
      }
    }
    if (!is_found) {
      arr_diff[arr_diff.length] = ar1[i];
    }
  }
  // console.log("arr_diff "+arr_diff);
  return arr_diff;
}

// Метод "Одиночка"
const solveSingle = (i, j, matrixnew) => {
  matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], row(i, matrixnew));
  matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], col(j, matrixnew));
  matrixnew[i][j][2] = arrayDiff(matrixnew[i][j][2], sect(i, j, matrixnew));
  if (1 == matrixnew[i][j][2].length) {
    // Исключили все варианты кроме одного
    markSolved(i, j, matrixnew[i][j][2][0], matrixnew);
    return 1;
  }
  return 0;
}

//Метод "Скрытый одиночка"
const solveHiddenSingle = (i, j, matrixnew) => {
  // console.log("i " + i + " j " + j);
  let less_suggest = lessRowSuggest(i, j, matrixnew);
  let changed = 0;
  if (1 == less_suggest.length) {
    markSolved(i, j, less_suggest[0], matrixnew);
    changed++;
  }
  let less_suggest1 = lessColSuggest(i, j, matrixnew);
  if (1 == less_suggest1.length) {
    markSolved(i, j, less_suggest1[0], matrixnew);
    changed++;
  }
  let less_suggest2 = lessSectSuggest(i, j, matrixnew);
  if (1 == less_suggest2.length) {
    markSolved(i, j, less_suggest2[0], matrixnew);
    changed++;
  }
  if (i == 0 && j == 2)
    // console.log(less_suggest);
    return changed;
}

//Минимизированное множество предположений по строке
const lessRowSuggest = (i, j, matrixnew) => {
  // console.log("i " + i + " j " + j);
  let less_suggest = matrixnew[i][j][2];
  for (let k = 0; k < 9; k++) {
    if (k == j || 'no' != matrixnew[i][k][1]) {
      continue;
    }
    // console.log("matrixnew K " + matrixnew[i][k][2]);
    less_suggest = arrayDiff(less_suggest, matrixnew[i][k][2]);
  }
  // console.log(less_suggest);
  return less_suggest;
}

//Минимизированное множество предположений по столбцу
const lessColSuggest = (i, j, matrixnew) => {
  // console.log("i " + i + " j " + j);
  let less_suggest = matrixnew[i][j][2];
  for (let k = 0; k < 9; k++) {
    if (k == i || 'no' != matrixnew[k][j][1]) {
      continue;
    }
    less_suggest = arrayDiff(less_suggest, matrixnew[k][j][2]);
  }
  // console.log(less_suggest);
  return less_suggest;
}

//Минимизированное множество предположений по секции
const lessSectSuggest = (i, j, matrixnew) => {
  let less_suggest = matrixnew[i][j][2];
  let offset = sectOffset(i, j, matrixnew);
  for (let k = 0; k < 3; k++) {
    for (let l = 0; l < 3; l++) {
      // console.log("Sect попал "+(offset.i+k)+" "+(offset.j+l));
      if (((offset.i + k) == i && (offset.j + l) == j) || 'no' != matrixnew[offset.i + k][offset.j + l][1]) {
        continue;
      }
      less_suggest = arrayDiff(less_suggest, matrixnew[offset.i + k][offset.j + l][2]);
    }
  }
  return less_suggest;
}

//Отмечаем найденный элемент
const markSolved = (i, j, solve, matrixnew) => {
  matrixnew[i][j][0] = solve;
  matrixnew[i][j][1] = 'solved';
}



