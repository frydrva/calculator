// Select elements
const inputDisplay = document.getElementById('calculator-input');
const outputDisplay = document.getElementById('calculator-output');
const historyDisplay = document.getElementById('history-display');
const clearAllBtn = document.getElementById('clear-all-btn'); // CE button
const clearBtn = document.getElementById('clear-btn'); // C button
const equalBtn = document.getElementById('equal-sign');
const historyClearBtn = document.getElementById('clear-history-btn');
const answerBtn = document.getElementById('answer-btn');

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
  // Surround with parentheses to avoid operator precedence issues
  return expression.replace(/ans/g, `(${lastResult})`);
}

// Safely evaluate an expression string
function safeEvaluate(expression) {
  // Replace 'ans' tokens
  let expr = replaceAns(expression);
  // Replace ÷ and × symbols if any
  expr = expr.replace(/÷/g, '/').replace(/×/g, '*');
  // Replace ^ with ** for exponentiation
  expr = expr.replace(/\^/g, '**');

  // Validate allowed characters only: digits, operators, parentheses, dot, spaces
  if (!/^[0-9+\-*/%^().\s]+$/.test(expr)) {
    throw new Error('Invalid characters in expression');
  }

  // Evaluate using Function constructor
  const func = new Function('return ' + expr);
  return func();
}

// Perform calculation of currentInput
function calculate() {
  if (!currentInput.trim()) return; // Empty input

  try {
    let result = safeEvaluate(currentInput);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }

    // Round result to max 10 decimals for neatness
    result = +result.toFixed(10);

    updateOutputDisplay(result);
    history.push(`${currentInput} = ${result}`);
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();

    lastResult = result;
    currentInput = '';
    updateInputDisplay();

  } catch {
    updateOutputDisplay('Error');
  }
}

// Append value to input safely
function appendToInput(value) {
  // If the value is an operator and currentInput empty but lastResult exists, start with lastResult
  const operators = ['+', '-', '*', '/', '^', '%'];
  if (lastResult !== null && operators.includes(value) && currentInput === '') {
    currentInput = lastResult.toString();
  }

  // Prevent multiple decimals in a number block
  if (value === '.') {
    const segments = currentInput.split(/[\+\-\*\/\^\%\(\)]/);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.includes('.')) return;
  }

  // Prevent adjacent 'ans's (not strictly necessary, but cleaner UX)
  if (value === 'ans' && currentInput.endsWith('ans')) return;

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

// Answer button: Insert 'ans' visibly but use lastResult internally
answerBtn.addEventListener('click', () => {
  appendToInput('ans');
});

// Buttons for digits/operators except clear/equal handled here
document.querySelectorAll('.calculator-buttons button').forEach(button => {
  if (['clear-all-btn', 'clear-btn', 'equal-sign', 'clear-history-btn', 'answer-btn'].includes(button.id)) {
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
  } else if (key.toLowerCase() === 'a') {
    // Optional: bind 'a' key to insert ans
    appendToInput('ans');
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
