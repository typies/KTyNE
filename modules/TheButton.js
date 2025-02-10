function solveModuleTheButton(color, text, batteries, litCar, litFrk) {
  if (text == "Detonate") {
    return batteries <= 1 ? "Hold" : "Press/Release";
  }

  let frkCondition = litFrk && batteries >= 3;
  if (color == "White") {
    return litCar || !frkCondition ? "Hold" : "Press/Release";
  }

  if (color == "Blue" && text == "Abort") {
    return "Hold";
  }

  if (color == "Red" && text == "Hold") {
    return "Press/Release";
  }

  return !frkCondition ? "Hold" : "Press/Release";
}
