// Select elements
const inputDisplay = document.getElementById('calculator-input');
const outputDisplay = document.getElementById('calculator-output');
const historyDisplay = document.getElementById('history-display');
const clearAllBtn = document.getElementById('clear-all-btn'); // CE button
const clearBtn = document.getElementById('clear-btn'); // C button
const equalBtn = document.getElementById('equal-sign');
const historyClearBtn = document.getElementById('clear-history-btn');

let currentInput = '';
let lastResult = null;
let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

// Update input display with overflow handling (CSS scroll)
function updateInputDisplay() {
  inputDisplay.textContent = currentInput || '0';
}

// Update output display
function updateOutputDisplay(value) {
  outputDisplay.textContent = value;
}

// Update history display
function updateHistoryDisplay() {
  if (history.length === 0) {
    historyDisplay.innerHTML = '<i>No history...</i>';
  } else {
    historyDisplay.innerHTML = history.map(entry => `<div>${entry}</div>`).join('');
  }
}

// Replace all 'ans' tokens with lastResult number for evaluation
function replaceAns(expression) {
  if (lastResult === null) {
    return expression.replace(/ans/g, '0');
  }
  return expression.replace(/ans/g, `(${lastResult})`);
}

// Safely evaluate an expression string
function safeEvaluate(expression) {
  // Only allow numbers, +, -, *, /, %, ^, and parentheses
  if (!/^[\d+\-*/%^().\s]+$/.test(expression)) {
    throw new Error('Invalid characters in expression');
  }

  // Convert ^ to ** for exponentiation
  const expr = expression.replace(/\^/g, '**');

  try {
    // Use a restricted parser via Function with safer scope
    return Function('"use strict"; return (' + expr + ')')();
  } catch (e) {
    throw new Error('Invalid expression');
  }
}

// Perform calculation of currentInput
function calculate() {
  if (!currentInput.trim()) return; // Empty input

  try {
    let result = safeEvaluate(currentInput);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }

    result = +result.toFixed(10);
    updateOutputDisplay(result);
    history.push(`${currentInput} = ${result}`);
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();

    lastResult = result;
    currentInput = result.toString(); // Set input to result
    updateInputDisplay();

  } catch {
    updateOutputDisplay('Error');
  }
}

// Append value to input safely
function appendToInput(value) {
  const operators = ['+', '-', '*', '/', '^', '%'];

  // If the value is an operator and currentInput is empty but lastResult exists, start with lastResult
  if (lastResult !== null && operators.includes(value) && currentInput === '') {
    currentInput = lastResult.toString();
  }

  // Prevent multiple decimals in a number block
  if (value === '.') {
    const segments = currentInput.split(/[\+\-\*\/\^\%\(\)]/);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.includes('.')) return;
  }

  // Prevent adjacent operators
  if (operators.includes(value)) {
    const lastChar = currentInput.slice(-1);
    if (operators.includes(lastChar)) {
      currentInput = currentInput.slice(0, -1); // Replace last operator
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

// Clear all (CE button)
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

// Buttons for digits/operators except clear/equal handled here
document.querySelectorAll('.calculator-buttons button').forEach(button => {
  if (['clear-all-btn', 'clear-btn', 'equal-sign', 'clear-history-btn'].includes(button.id)) {
    return; // Already handled above
  }
  button.addEventListener('click', () => {
    if (button.value !== undefined) {
      appendToInput(button.value);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', event => {
  const key = event.key;

  if (/^\d$/.test(key)) {
    appendToInput(key);
  } else if (['+', '-', '*', '/', '^', '(', ')', '%', '.'].includes(key)) {
    appendToInput(key);
  } else if (key === 'Enter') {
    event.preventDefault();
    calculate();
  } else if (key === 'Backspace') {
    event.preventDefault();
    currentInput = currentInput.slice(0, -1);
    updateInputDisplay();
  } else if (key === 'Escape') {
    event.preventDefault();
    currentInput = '';
    updateInputDisplay();
    updateOutputDisplay(0);
    lastResult = null;
  }
});

// Init displays
updateInputDisplay();
updateOutputDisplay(0);
updateHistoryDisplay();
