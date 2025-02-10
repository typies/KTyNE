function solveModuleWires(wires, bombSerial) {
  let lastSerialOdd = bombSerial.at(-1) % 2 == 0;
  switch (wires.length) {
    case 3:
      if (countOccurence(wires, "red") == 0) {
        return 2;
      } else if (wires[2] == "white") {
        return 3;
      } else if (countOccurence(wires, "blue") > 1) {
        return wires.findLastIndex("blue") + 1;
      } else {
        return 3;
      }
    case 4:
      if (countOccurence(wires, "red") > 1 && lastSerialOdd) {
        return wires.findLastIndex("red") + 1;
      } else if (
        wires.at(-1) == "yellow" &&
        countOccurence(wires, "red") == 0
      ) {
        return 1;
      } else if (countOccurence(wires, blue) == 1) {
        return 1;
      } else if (countOccurence(wires, yellow) > 1) {
        return 4;
      } else {
        return 2;
      }
    case 5:
      if (wires.at(-1) == "black" && lastSerialOdd) {
        return 4;
      } else if (
        countOccurence(wires, "red") == 1 &&
        countOccurence(wires, "yellow") > 1
      ) {
        return 1;
      } else if (countOccurence(wires, "black") == 0) {
        return 2;
      } else {
        return 1;
      }
    case 6:
      if (countOccurence(wires, "yellow") == 0 && lastSerialOdd) {
        return 3;
      } else if (
        countOccurence(wires, "yellow") == 1 &&
        countOccurence(wires, "white") > 1
      ) {
        return 4;
      } else if (countOccurence(wires, "red") == 0) {
        return 6;
      } else {
        return 4;
      }
  }
}

function countOccurence(wires, color) {
  return wires.reduce((accumulator, currentValue) => {
    if (currentValue == color) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);
}
