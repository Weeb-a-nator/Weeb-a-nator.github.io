function stablefordPoints(grossScore, par, strokesReceived = 0) {
  const netDifference = grossScore - strokesReceived - par;
  return Math.max(0, 2 - netDifference);
}

function strokesForHole(courseHandicap, holeHandicap) {
  if (courseHandicap <= 0) {
    return 0;
  }

  const base = Math.floor(courseHandicap / 18);
  const extra = courseHandicap % 18;
  return base + (holeHandicap <= extra ? 1 : 0);
}

function parseNumbers(rawValue, count, minimum = 1) {
  const values = rawValue
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  if (values.length !== count || values.some((value) => Number.isNaN(value) || value < minimum)) {
    throw new Error(`Enter exactly ${count} whole numbers (minimum ${minimum}).`);
  }

  return values;
}

function getHoleHandicaps(expectedHoles, rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return Array.from({ length: expectedHoles }, (_, index) => index + 1);
  }

  const values = value.split(/\s+/).map(Number);
  if (values.length !== expectedHoles || values.some((num) => Number.isNaN(num) || num < 1)) {
    throw new Error("Stroke indexes must contain one positive number per hole.");
  }

  return values;
}

function buildHoleRows() {
  const holeRows = document.getElementById("holeRows");
  const holes = Number(document.getElementById("holesSelect").value);

  holeRows.innerHTML = "";

  for (let hole = 1; hole <= holes; hole += 1) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${hole}</td>
      <td><input class="par-input" type="number" min="3" step="1" value="4" aria-label="Par for hole ${hole}" /></td>
      <td><input class="score-input" type="number" min="1" step="1" value="5" aria-label="Score for hole ${hole}" /></td>
    `;
    holeRows.appendChild(row);
  }
}

function updateEntryMode() {
  const isIndividual = document.getElementById("individualInput").checked;
  const bulkEntry = document.getElementById("bulkEntry");
  const individualEntry = document.getElementById("individualEntry");

  bulkEntry.classList.toggle("hidden", isIndividual);
  individualEntry.classList.toggle("hidden", !isIndividual);

  if (isIndividual) {
    buildHoleRows();
  }
}

function calculateScore(pars, scores, holeHandicaps, courseHandicap) {
  return pars.map((par, index) => {
    const received = strokesForHole(courseHandicap, holeHandicaps[index]);
    return stablefordPoints(scores[index], par, received);
  });
}

function renderResults(points, scores) {
  const results = document.getElementById("results");
  const total = points.reduce((sum, value) => sum + value, 0);
  const holes = points.length;

  const holeList = points.map((point, index) => `<span>H${index + 1}: ${point}</span>`).join(" ");

  let extraSummary = "";
  if (holes === 18) {
    const firstNine = scores.slice(0, 9).reduce((sum, value) => sum + value, 0);
    const secondNine = scores.slice(9).reduce((sum, value) => sum + value, 0);
    const totalStrokes = scores.reduce((sum, value) => sum + value, 0);
    extraSummary = `
      <div>First 9 strokes: ${firstNine}</div>
      <div>Second 9 strokes: ${secondNine}</div>
      <div>Total strokes: ${totalStrokes}</div>
    `;
  } else {
    const totalStrokes = scores.reduce((sum, value) => sum + value, 0);
    extraSummary = `<div>Total strokes: ${totalStrokes}</div>`;
  }

  results.innerHTML = `
    <h2>Hole-by-hole points</h2>
    <div class="summary">${holeList}</div>
    <div class="summary">Stableford total: ${total} points</div>
    ${extraSummary}
  `;

  results.classList.remove("hidden");
}

function calculateRound() {
  const holes = Number(document.getElementById("holesSelect").value);
  const courseHandicap = Number(document.getElementById("courseHandicap").value || 0);
  const errorMessage = document.getElementById("errorMessage");
  const individual = document.getElementById("individualInput").checked;

  try {
    let pars;
    let scores;
    let holeHandicaps;

    if (individual) {
      const rows = [...document.querySelectorAll(".hole-row")];
      const holeData = Array.from(document.querySelectorAll(".par-input")).map((parInput, index) => {
        const par = Number(parInput.value);
        const scoreInput = document.querySelectorAll(".score-input")[index];
        const score = Number(scoreInput.value);
        return { par, score };
      });

      if (holeData.some(({ par, score }) => Number.isNaN(par) || Number.isNaN(score) || par < 3 || score < 1)) {
        throw new Error("Enter valid par and score values for every hole.");
      }

      pars = holeData.map(({ par }) => par);
      scores = holeData.map(({ score }) => score);
      holeHandicaps = getHoleHandicaps(holes, document.getElementById("individualHandicaps").value);
    } else {
      pars = parseNumbers(document.getElementById("parsInput").value, holes, 3);
      scores = parseNumbers(document.getElementById("scoresInput").value, holes, 1);
      holeHandicaps = getHoleHandicaps(holes, document.getElementById("holeHandicaps").value);
    }

    const points = calculateScore(pars, scores, holeHandicaps, courseHandicap);
    errorMessage.textContent = "";
    renderResults(points, scores);
  } catch (error) {
    document.getElementById("results").classList.add("hidden");
    errorMessage.textContent = error.message;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const holesSelect = document.getElementById("holesSelect");
  const individualInput = document.getElementById("individualInput");
  const calculateButton = document.getElementById("calculateButton");

  holesSelect.addEventListener("change", () => {
    if (individualInput.checked) {
      buildHoleRows();
    }
  });

  individualInput.addEventListener("change", updateEntryMode);
  calculateButton.addEventListener("click", calculateRound);

  updateEntryMode();
});
