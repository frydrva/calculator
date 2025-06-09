// Select elements from the DOM
const inputDisplay = document.getElementById('calculator-input');
const outputDisplay = document.getElementById('calculator-output');
const historyDisplay = document.getElementById('history-display');
const clearAllBtn = document.getElementById('clear-all-btn'); // CE button
const clearBtn = document.getElementById('clear-btn'); // C button
const equalBtn = document.getElementById('equal-sign');
const historyClearBtn = document.getElementById('clear-history-btn');
const anwserBtn = document.getElementById('answer-btn');

let currentInput = '';
let lastResult = null; // To enable operation chaining with result
let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

// Update input display with overflow hiding (text-overflow handled by CSS)
function updateInputDisplay() {
  inputDisplay.innerText = currentInput || '0';
}

// Update output display
function updateOutputDisplay(value) {
  outputDisplay.innerText = value;
}

// Evaluate the current input expression safely
function calculate() {
  if (!currentInput) return; // Nothing to calculate
  try {
    let expression = currentInput.replace(/\^/g, '**');
    if (!/^[0-9+\-*/().$^ \t]+$/.test(currentInput)) {
      updateOutputDisplay('Error');
      return;
    }
    const func = new Function('return ' + expression);
    let result = func();

    if (typeof result === 'number') {
      result = +result.toFixed(10);
    }

    updateOutputDisplay(result);
    history.push(`${currentInput} = ${result}`);
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();

    currentInput = '';
    lastResult = result;
    updateInputDisplay();
  } catch {
    updateOutputDisplay('Error');
  }
}

// Update history display area
function updateHistoryDisplay() {
  if (history.length === 0) {
    historyDisplay.innerHTML = '<i>No history...</i>';
  } else {
    historyDisplay.innerHTML = history.map(entry => `<div>${entry}</div>`).join('');
  }
}

// Append characters to current input safely
function appendToInput(value) {
  const operators = ['+', '-', '*', '/', '^'];
  if (lastResult !== null && operators.includes(value) && currentInput === '') {
    currentInput = lastResult.toString();
  }

  if (value === '.') {
    const lastNumberSegment = currentInput.split(/[\+\-\*\/\^\(\)\$]/).pop();
    if (lastNumberSegment.includes('.')) {
      return; // ignore second decimal in a number block
    }
  }

  currentInput += value;
  updateInputDisplay();
}

// Clear last character (C button)
clearBtn.addEventListener('click', () => {
  if (currentInput.length > 0) {
    currentInput = currentInput.slice(0, -1);
    updateInputDisplay();
  }
});

// Clear all input (CE button)
clearAllBtn.addEventListener('click', () => {
  currentInput = '';
  updateInputDisplay();
  updateOutputDisplay(0);
  lastResult = null;
});

// Equal button
equalBtn.addEventListener('click', calculate);

// Clear history button
historyClearBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('calculatorHistory');
  updateHistoryDisplay();
});

// Answer button: append last result from history to input
anwserBtn.addEventListener('click', () => {
  if (history.length > 0) {
    // Get the last entry from history
    const lastEntry = history[history.length - 1];
    // Extract the result from the last entry (e.g., "2 + 2 = 4")
    const result = lastEntry.split('=').pop().trim();
    // Append the result to the current input
    currentInput += result;
    updateInputDisplay();
  }
});

// Button click handlers for other buttons except CE, C, =
document.querySelectorAll('.calculator-buttons button').forEach(button => {
  if (button.id === 'clear-all-btn' || button.id === 'clear-btn' || button.id === 'equal-sign') {
    return; // handled above
  }
  button.addEventListener('click', () => {
    const val = button.value;
    if (val !== undefined) {
      appendToInput(val);
    }
  });
});

// Improved keyboard support
document.addEventListener('keydown', (event) => {
  const key = event.key;

  // Allowed numeric keys
  if (/^\d$/.test(key)) {
    appendToInput(key);
  }
  // Allowed operators and parentheses
  else if (['+', '-', '*', '/', '^', '(', ')', '.'].includes(key)) {
    appendToInput(key);
  }
  else if (key === '$') {
    event.preventDefault();
    currentInput = currentInput+=input; 
    updateInputDisplay();
  }
  else if (key === 'Enter') {
    event.preventDefault();
    calculate();
  }
  else if (key === 'Backspace') {
    event.preventDefault();
    currentInput = currentInput.slice(0, -1);
    updateInputDisplay();
  }
  else if (key === 'Escape') {
    event.preventDefault();
    currentInput = '';
    updateInputDisplay();
    updateOutputDisplay(0);
    lastResult = null;
  }
});

// Initial state
updateInputDisplay();
updateOutputDisplay(0);
updateHistoryDisplay();

