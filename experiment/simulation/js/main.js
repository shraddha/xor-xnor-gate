// DOM Elements
let currentGate = 'xor';
let parameters = {
    vdd: 5.0,
    pmosWidth: 2.0,
    nmosWidth: 1.0,
    channelLength: 0.18
};

// Store results for each gate and analysis type
let results = {
    xor: {
        dc: null,
        transient: null
    },
    xnor: {
        dc: null,
        transient: null
    }
};

// Default SPICE code template
const defaultSpiceCode = `* CMOS XOR/XNOR Gate SPICE Netlist

* Power Supply
VDD vdd 0 DC 5V

* Input Voltage Sources (for DC sweep)
VIN1 in1 0 DC 0V
VIN2 in2 0 DC 0V

* PMOS Transistors
M1 out in1 vdd vdd PMOS W=2.0u L=0.18u
M2 out in2 vdd vdd PMOS W=2.0u L=0.18u

* NMOS Transistors
M3 out in1 0 0 NMOS W=1.0u L=0.18u
M4 out in2 0 0 NMOS W=1.0u L=0.18u

* MOSFET Model Parameters
.MODEL NMOS NMOS (LEVEL=3 TOX=3.5E-9 VTO=0.5 GAMMA=0.2 PHI=0.6)
.MODEL PMOS PMOS (LEVEL=3 TOX=3.5E-9 VTO=-0.5 GAMMA=0.2 PHI=0.6)

* Analysis Commands
.DC VIN1 0 5 0.01
.PRINT DC V(in1) V(in2) V(out)

.END`;

// Function to clear plots
function clearPlots() {
    console.log('Clearing all plots');
    const gates = ['xor', 'xnor'];
    gates.forEach(gate => {
        const dcResults = document.getElementById(`${gate}-dc-results`);
        const transientResults = document.getElementById(`${gate}-transient-results`);
        
        if (dcResults) {
            Plotly.purge(dcResults);
            dcResults.innerHTML = '';
        }
        if (transientResults) {
            Plotly.purge(transientResults);
            transientResults.innerHTML = '';
        }
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeMainTabs();
    initializeSubTabs();
    initializeParameters();
    initializeSPICEEditor();
    initializeRunButtons();
});

function initializeMainTabs() {
    console.log('Initializing main tabs...');
    const mainTabs = document.querySelectorAll('.main-tabs .tab');
    const gateContents = document.querySelectorAll('.gate-content');

    mainTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            console.log('Main tab clicked:', tab.getAttribute('data-tab'));
            // Remove active class from all main tabs and gate contents
            mainTabs.forEach((t) => t.classList.remove("active"));
            gateContents.forEach((c) => c.classList.remove("active"));

            // Add active class to clicked tab and corresponding content
            tab.classList.add("active");
            const tabId = tab.getAttribute("data-tab");
            const content = document.getElementById(tabId);
            if (content) {
                content.classList.add("active");
            }

            // Update current gate based on tab
            currentGate = tabId.split('-')[0]; // 'xor' or 'xnor'
            
            // Clear plots when switching gates
            clearPlots();
        });
    });
}

function initializeSubTabs() {
    console.log('Initializing sub-tabs...');
    const gateContents = document.querySelectorAll('.gate-content');

    gateContents.forEach((gateContent) => {
        const subTabs = gateContent.querySelectorAll('.sub-tabs .tab');
        const tabContents = gateContent.querySelectorAll('.tab-content');

        subTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                console.log('Sub-tab clicked:', tab.getAttribute('data-tab'));
                // Remove active class from all sub-tabs and tab contents in this gate
                subTabs.forEach((t) => t.classList.remove("active"));
                tabContents.forEach((c) => c.classList.remove("active"));

                // Add active class to clicked tab and corresponding content
                tab.classList.add("active");
                const tabId = tab.getAttribute("data-tab");
                const content = document.getElementById(tabId);
                if (content) {
                    content.classList.add("active");
                }
            });
        });
    });
}

function initializeParameters() {
    console.log('Initializing parameters...');
    const gates = ['xor', 'xnor'];
    
    gates.forEach(gate => {
        const parameterSection = document.querySelector(`#${gate}-parameters .parameter-controls`);
        if (!parameterSection) {
            console.error(`Parameter section not found in ${gate}-gate`);
            return;
        }

        const sliders = parameterSection.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', function() {
                console.log('Slider changed:', this.id);
                const value = parseFloat(this.value);
                const param = this.id.replace(`${gate}-`, '').replace('-slider', '');
                parameters[param] = value;
                const valueDisplay = this.parentElement.querySelector(`#${this.id}-value`);
                if (valueDisplay) {
                    valueDisplay.textContent = `${value}${getUnit(param)}`;
                }
                updateSPICECode();
            });
        });

        // Reset parameters button
        const resetBtn = parameterSection.querySelector(`#${gate}-reset-params`);
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('Reset parameters clicked for:', gate);
                resetParameters(gate);
            });
        }

        // Check parameters button
        const checkBtn = parameterSection.querySelector(`#${gate}-check-params`);
        if (checkBtn) {
            checkBtn.addEventListener('click', function() {
                console.log('Check parameters clicked for:', gate);
                validateParameters(gate);
            });
        }
    });
}

function initializeSPICEEditor() {
    console.log('Initializing SPICE editor...');
    const gates = ['xor', 'xnor'];
    
    gates.forEach(gate => {
        console.log('Processing gate content:', gate);
        const spiceEditor = document.querySelector(`#${gate}-spice-code .spice-editor`);
        if (!spiceEditor) {
            console.error(`SPICE editor not found in ${gate}-gate`);
            return;
        }

        // Initialize SPICE code for this gate
        updateSPICECode();

        // Add event listeners for SPICE code buttons
        const validateBtn = spiceEditor.querySelector(`#${gate}-validate-spice`);
        const restoreBtn = spiceEditor.querySelector(`#${gate}-restore-spice`);
        const runDcBtn = spiceEditor.querySelector(`#${gate}-run-dc-sim`);
        const runTransientBtn = spiceEditor.querySelector(`#${gate}-run-transient-sim`);

        console.log('Found buttons:', {
            validate: !!validateBtn,
            restore: !!restoreBtn,
            runDc: !!runDcBtn,
            runTransient: !!runTransientBtn
        });

        if (validateBtn) {
            validateBtn.addEventListener('click', function() {
                console.log('Validate SPICE clicked for:', gate);
                validateSPICECode(gate);
            });
        }

        if (restoreBtn) {
            restoreBtn.addEventListener('click', function() {
                console.log('Restore SPICE clicked for:', gate);
                restoreDefaultSPICECode(gate);
            });
        }

        if (runDcBtn) {
            console.log('Adding DC simulation click handler');
            runDcBtn.addEventListener('click', function() {
                console.log('Run DC simulation clicked for:', gate);
                try {
                    if (validateParameters(gate) && validateSPICECode(gate)) {
                        console.log('Validation passed, running DC analysis');
                        runDCAnalysis(gate);
                    } else {
                        console.error('Cannot run simulation: validation failed');
                        const feedback = document.querySelector(`#${gate}-gate .spice-feedback`);
                        if (feedback) {
                            feedback.className = "spice-feedback error";
                            feedback.innerHTML = "Cannot run simulation: Please fix validation errors first.";
                        }
                    }
                } catch (error) {
                    console.error('Error in DC simulation:', error);
                }
            });
        }

        if (runTransientBtn) {
            console.log('Adding transient simulation click handler');
            runTransientBtn.addEventListener('click', function() {
                console.log('Run transient simulation clicked for:', gate);
                try {
                    if (validateParameters(gate) && validateSPICECode(gate)) {
                        console.log('Validation passed, running transient analysis');
                        runTransientAnalysis(gate);
                    } else {
                        console.error('Cannot run simulation: validation failed');
                        const feedback = document.querySelector(`#${gate}-gate .spice-feedback`);
                        if (feedback) {
                            feedback.className = "spice-feedback error";
                            feedback.innerHTML = "Cannot run simulation: Please fix validation errors first.";
                        }
                    }
                } catch (error) {
                    console.error('Error in transient simulation:', error);
                }
            });
        }
    });
}

function initializeRunButtons() {
    console.log('Initializing run buttons...');
    const gates = ['xor', 'xnor'];
    
    gates.forEach(gate => {
        // DC Analysis button
        const dcButton = document.querySelector(`#${gate}-run-dc-sim`);
        if (dcButton) {
            console.log(`Found ${gate.toUpperCase()} DC button`);
            dcButton.addEventListener('click', function() {
                console.log(`Run DC analysis clicked for ${gate}`);
                if (validateParameters(gate) && validateSPICECode(gate)) {
                    runDCAnalysis(gate);
                }
            });
        } else {
            console.error(`${gate.toUpperCase()} DC button not found`);
        }

        // Transient Analysis button
        const transientButton = document.querySelector(`#${gate}-run-transient-sim`);
        if (transientButton) {
            console.log(`Found ${gate.toUpperCase()} Transient button`);
            transientButton.addEventListener('click', function() {
                console.log(`Run transient analysis clicked for ${gate}`);
                if (validateParameters(gate) && validateSPICECode(gate)) {
                    runTransientAnalysis(gate);
                }
            });
        } else {
            console.error(`${gate.toUpperCase()} Transient button not found`);
        }
    });
}

function resetParameters(gate) {
    console.log('Resetting parameters for:', gate);
    const parameterSection = document.querySelector(`#${gate}-parameters .parameter-controls`);
    if (!parameterSection) {
        console.error(`Parameter section not found for ${gate}`);
        return;
    }

    const sliders = parameterSection.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const defaultValue = parseFloat(slider.getAttribute('data-default'));
        slider.value = defaultValue;
        const param = slider.id.replace('-slider', '');
        parameters[param] = defaultValue;
        const valueDisplay = slider.parentElement.querySelector(`#${slider.id}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = `${defaultValue}${getUnit(param)}`;
        }
    });
    updateSPICECode();
}

function initializeGateSelector() {
    console.log('Initializing gate selector...');
    const xorBtn = document.getElementById('xor-btn');
    const xnorBtn = document.getElementById('xnor-btn');

    if (xorBtn) {
        xorBtn.addEventListener('click', () => {
            console.log('XOR button clicked');
            switchGate('xor');
        });
    }

    if (xnorBtn) {
        xnorBtn.addEventListener('click', () => {
            console.log('XNOR button clicked');
            switchGate('xnor');
        });
    }
}

// Update slider value displays
function updateSliderValue(slider, valueDisplay) {
  const value = slider.value;
  const unit = slider.getAttribute("data-unit");
  valueDisplay.textContent = `${value}${unit}`;
}

// Update SPICE code based on parameter changes
function updateSPICECode() {
    console.log('Updating SPICE code for gate:', currentGate);
    const codeElement = document.querySelector(`#${currentGate}-spice-code .spice-code`);
    if (!codeElement) {
        console.error(`SPICE code element not found for ${currentGate}`);
        return;
    }
    codeElement.textContent = generateDefaultSPICECode(currentGate);
}

// Gate selector functionality
function switchGate(gate) {
    currentGate = gate;
    
    // Update gate selector buttons
    document.getElementById('xor-btn').classList.toggle('active', gate === 'xor');
    document.getElementById('xnor-btn').classList.toggle('active', gate === 'xnor');
    
    // Update tab labels
    const tabs = document.querySelectorAll('.tab[data-gate]');
    tabs.forEach(tab => {
        const tabType = tab.getAttribute('data-tab');
        tab.textContent = `${gate.toUpperCase()} ${tabType.charAt(0).toUpperCase() + tabType.slice(1)}`;
        tab.setAttribute('data-gate', gate);
    });
    
    // Update schematic image
    const schematicImg = document.getElementById('gate-schematic');
    schematicImg.src = `images/${gate}_schematic.png`;
    
    // Update SPICE code
    updateSPICECode();
    
    // Clear plots when switching gates
    clearPlots();
}

function clearCurrentTabResults() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'results-section') {
        clearPlots();
    }
}

function getUnit(param) {
    switch(param) {
        case 'vdd': return 'V';
        case 'pmosWidth':
        case 'nmosWidth':
        case 'channelLength': return 'μm';
        default: return '';
    }
}

function validateParameters(gate) {
    console.log('Validating parameters for:', gate);
    const parameterSection = document.querySelector(`#${gate}-parameters .parameter-controls`);
    if (!parameterSection) {
        console.error(`Parameter section not found for ${gate}`);
        return false;
    }

    // Get current parameter values
    const vddSlider = parameterSection.querySelector(`#${gate}-vdd-slider`);
    const pmosWidthSlider = parameterSection.querySelector(`#${gate}-pmos-width-slider`);
    const nmosWidthSlider = parameterSection.querySelector(`#${gate}-nmos-width-slider`);
    const lengthSlider = parameterSection.querySelector(`#${gate}-mosfet-length-slider`);

    if (!vddSlider || !pmosWidthSlider || !nmosWidthSlider || !lengthSlider) {
        console.error('One or more sliders not found:', {
            vdd: !!vddSlider,
            pmos: !!pmosWidthSlider,
            nmos: !!nmosWidthSlider,
            length: !!lengthSlider
        });
        return false;
    }

    const vdd = parseFloat(vddSlider.value);
    const pmosWidth = parseFloat(pmosWidthSlider.value);
    const nmosWidth = parseFloat(nmosWidthSlider.value);
    const length = parseFloat(lengthSlider.value);

    console.log('Current parameters:', { vdd, pmosWidth, nmosWidth, length });

    let isValid = true;
    let message = "";

    // Check VDD
    if (vdd < 1 || vdd > 5) {
        isValid = false;
        message += "VDD must be between 1V and 5V.<br>";
    }

    // Check PMOS width
    if (pmosWidth < 0.2 || pmosWidth > 10) {
        isValid = false;
        message += "PMOS width must be between 0.2μm and 10μm.<br>";
    }

    // Check NMOS width
    if (nmosWidth < 0.2 || nmosWidth > 10) {
        isValid = false;
        message += "NMOS width must be between 0.2μm and 10μm.<br>";
    }

    // Check MOSFET length
    if (length < 0.1 || length > 1.0) {
        isValid = false;
        message += "MOSFET length must be between 0.1μm and 1.0μm.<br>";
    }

    // Check W/L ratio
    const pmosRatio = pmosWidth / length;
    const nmosRatio = nmosWidth / length;
    if (pmosRatio < 2 || pmosRatio > 20) {
        isValid = false;
        message += "PMOS W/L ratio must be between 2 and 20.<br>";
    }
    if (nmosRatio < 2 || nmosRatio > 20) {
        isValid = false;
        message += "NMOS W/L ratio must be between 2 and 20.<br>";
    }

    // Check PMOS/NMOS width ratio
    const widthRatio = pmosWidth / nmosWidth;
    if (widthRatio < 1.5 || widthRatio > 2.5) {
        isValid = false;
        message += "PMOS/NMOS width ratio must be between 1.5 and 2.5.<br>";
    }

    // Display feedback
    const feedback = parameterSection.querySelector(`#${gate}-parameter-feedback`);
    if (feedback) {
        feedback.className = `parameter-feedback ${isValid ? "success" : "error"}`;
        feedback.innerHTML = isValid
            ? "Parameters are valid. You can proceed with simulation."
            : message;
    }

    console.log('Parameter validation result:', { isValid, message });
    return isValid;
}

function validateSPICECode(gate) {
    console.log('Validating SPICE code for:', gate);
    const codeElement = document.querySelector(`#${gate}-spice-code .spice-code`);
    const feedback = document.querySelector(`#${gate}-spice-code .spice-feedback`);
    
    if (!codeElement || !feedback) {
        console.error(`Required elements not found for ${gate} validation`);
        return false;
    }

    const code = codeElement.textContent;
    console.log('Validating SPICE code:', code);
    
    const errors = [];
    
    // Check for required elements
    const requiredElements = [
        "VDD",
        "VIN1",
        "VIN2",
        "M1",
        "M2",
        "M3",
        "M4",
        ".MODEL",
        ".DC",
        ".PRINT",
        ".END"
    ];

    requiredElements.forEach(element => {
        if (!code.includes(element)) {
            errors.push(`Missing required element: ${element}`);
        }
    });

    // Check for basic syntax errors
    if (code.includes("..")) {
        errors.push("Invalid syntax: consecutive dots");
    }

    // Check for proper line breaks
    if (!code.includes("\n")) {
        errors.push("Invalid format: missing line breaks");
    }

    // Check for proper spacing
    if (code.includes("VDDvdd") || code.includes("VIN1in1") || code.includes("VIN2in2")) {
        errors.push("Invalid format: missing spaces between elements");
    }

    // Check for proper model parameters
    if (!code.includes("LEVEL=3") || !code.includes("TOX=3.5E-9") || !code.includes("VTO=")) {
        errors.push("Invalid model parameters");
    }

    // Check for complete model definitions
    if (!code.includes(".MODEL NMOS NMOS") || !code.includes(".MODEL PMOS PMOS")) {
        errors.push("Missing or incomplete MOSFET model definitions");
    }

    // Check for proper transistor definitions
    const transistorLines = code.split('\n').filter(line => line.trim().startsWith('M'));
    if (transistorLines.length !== 4) {
        errors.push("Invalid number of transistor definitions");
    } else {
        transistorLines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 6) {
                errors.push(`Invalid transistor definition: ${line}`);
            }
            if (!line.includes("PMOS") && !line.includes("NMOS")) {
                errors.push(`Missing transistor type in: ${line}`);
            }
            if (!line.includes("W=") || !line.includes("L=")) {
                errors.push(`Missing W/L parameters in: ${line}`);
            }
            // Check for proper W/L format
            if (!line.includes("W=") || !line.match(/W=\d+\.?\d*u/)) {
                errors.push(`Invalid width format in: ${line}`);
            }
            if (!line.includes("L=") || !line.match(/L=\d+\.?\d*u/)) {
                errors.push(`Invalid length format in: ${line}`);
            }
        });
    }

    // Check for proper voltage source definitions
    const voltageLines = code.split('\n').filter(line => line.trim().startsWith('V'));
    if (voltageLines.length !== 3) {
        errors.push("Invalid number of voltage source definitions");
    } else {
        voltageLines.forEach(line => {
            if (!line.includes("DC")) {
                errors.push(`Missing DC parameter in: ${line}`);
            }
            if (line.includes("VDD") && !line.match(/DC\s+\d+\.?\d*V/)) {
                errors.push(`Invalid VDD voltage format in: ${line}`);
            }
        });
    }

    // Check for proper analysis commands
    if (!code.match(/\.DC\s+VIN1\s+\d+\.?\d*\s+\d+\.?\d*\s+\d+\.?\d*/)) {
        errors.push("Invalid DC analysis command format");
    }

    // Display feedback
    if (errors.length === 0) {
        feedback.className = "spice-feedback success";
        feedback.innerHTML = "SPICE code is valid. You can proceed with simulation.";
        console.log('SPICE code validation successful');
        return true;
    } else {
        feedback.className = "spice-feedback error";
        feedback.innerHTML = "Validation errors:<br>" + errors.join("<br>");
        console.log('SPICE code validation failed:', errors);
        return false;
    }
}

function restoreDefaultSPICECode(gate) {
    console.log('Restoring default SPICE code for:', gate);
    const codeElement = document.querySelector(`#${gate}-spice-code .spice-code`);
    if (!codeElement) {
        console.error(`SPICE code element not found for ${gate}`);
        return;
    }
    codeElement.textContent = generateDefaultSPICECode(gate);
}

function generateDefaultSPICECode(gate) {
    const { vdd, pmosWidth, nmosWidth, channelLength } = parameters;
    
    let code = `* CMOS ${gate.toUpperCase()} Gate SPICE Netlist\n\n`;
    code += `* Power Supply\n`;
    code += `VDD vdd 0 DC ${vdd}V\n\n`;
    code += `* Input Voltage Sources (for DC sweep)\n`;
    code += `VIN1 in1 0 DC 0V\n`;
    code += `VIN2 in2 0 DC 0V\n\n`;

    if (gate === 'xor') {
        code += `* PMOS Transistors\n`;
        code += `M1 out in1 vdd vdd PMOS W=${pmosWidth}u L=${channelLength}u\n`;
        code += `M2 out in2 vdd vdd PMOS W=${pmosWidth}u L=${channelLength}u\n\n`;
        code += `* NMOS Transistors\n`;
        code += `M3 out in1 0 0 NMOS W=${nmosWidth}u L=${channelLength}u\n`;
        code += `M4 out in2 0 0 NMOS W=${nmosWidth}u L=${channelLength}u\n\n`;
    } else {
        code += `* PMOS Transistors\n`;
        code += `M1 n1 in1 vdd vdd PMOS W=${pmosWidth}u L=${channelLength}u\n`;
        code += `M2 out in2 n1 vdd PMOS W=${pmosWidth}u L=${channelLength}u\n\n`;
        code += `* NMOS Transistors\n`;
        code += `M3 out in1 0 0 NMOS W=${nmosWidth}u L=${channelLength}u\n`;
        code += `M4 out in2 0 0 NMOS W=${nmosWidth}u L=${channelLength}u\n\n`;
    }

    code += `* MOSFET Model Parameters\n`;
    code += `.MODEL NMOS NMOS (LEVEL=3 TOX=3.5E-9 VTO=0.5 GAMMA=0.2 PHI=0.6)\n`;
    code += `.MODEL PMOS PMOS (LEVEL=3 TOX=3.5E-9 VTO=-0.5 GAMMA=0.2 PHI=0.6)\n\n`;
    code += `* Analysis Commands\n`;
    code += `.DC VIN1 0 ${vdd} 0.01\n`;
    code += `.PRINT DC V(in1) V(in2) V(out)\n\n`;
    code += `.END\n`;

    return code;
}

function runDCAnalysis(gate) {
    console.log('Starting DC analysis for:', gate);
    
    // Switch to results tab
    const resultsTab = document.querySelector(`#${gate}-gate .sub-tabs .tab[data-tab="${gate}-results"]`);
    if (resultsTab) {
        console.log('Found results tab, clicking it');
        resultsTab.click();
        
        // Ensure the results content is visible
        const resultsContent = document.getElementById(`${gate}-results`);
        if (resultsContent) {
            resultsContent.classList.add('active');
            console.log('Results content made visible');
        } else {
            console.error('Results content not found');
        }
    } else {
        console.error('Results tab not found');
    }

    // Generate DC analysis data
    console.log('Generating DC analysis data');
    const vin = Array.from({ length: 501 }, (_, i) => i * 0.01);
    const vout = vin.map((v) => {
        // Simplified VTC model for XOR/XNOR gate
        const vth = 2.5;
        if (gate === 'xor') {
            if (v < vth) {
                return 5 * (1 - Math.exp(-v / (vth / 2)));
            } else {
                return 5 * Math.exp(-(v - vth) / (vth / 2));
            }
        } else {
            if (v < vth) {
                return 5 * Math.exp(-v / (vth / 2));
            } else {
                return 5 * (1 - Math.exp(-(v - vth) / (vth / 2)));
            }
        }
    });

    // Create trace and layout
    console.log('Creating plot trace and layout');
    const trace = {
        x: vin,
        y: vout,
        type: "scatter",
        mode: "lines",
        name: `${gate.toUpperCase()} VTC`,
        line: {
            color: gate === 'xor' ? "#2196F3" : "#4CAF50",
            width: 2,
        },
    };

    const layout = {
        title: `${gate.toUpperCase()} Gate Voltage Transfer Characteristic (VTC)`,
        xaxis: {
            title: "Input Voltage (V)",
            range: [0, 5],
        },
        yaxis: {
            title: "Output Voltage (V)",
            range: [0, 5],
        },
        showlegend: false,
        margin: { t: 50, r: 20, b: 50, l: 50 },
    };

    // Store results
    results[gate].dc = { traces: [trace], layout: layout };

    // Display results
    const resultsContainer = document.getElementById(`${gate}-dc-results`);
    if (resultsContainer) {
        console.log('Plotting DC results');
        Plotly.newPlot(resultsContainer, [trace], layout, { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
        });
    } else {
        console.error('DC results container not found');
    }
}

function runTransientAnalysis(gate) {
    console.log('Starting transient analysis for:', gate);
    
    // Switch to results tab
    const resultsTab = document.querySelector(`#${gate}-gate .sub-tabs .tab[data-tab="${gate}-results"]`);
    if (resultsTab) {
        console.log('Found results tab, clicking it');
        resultsTab.click();
        
        // Ensure the results content is visible
        const resultsContent = document.getElementById(`${gate}-results`);
        if (resultsContent) {
            resultsContent.classList.add('active');
            console.log('Results content made visible');
        } else {
            console.error('Results content not found');
        }
    } else {
        console.error('Results tab not found');
    }

    // Generate transient data
    console.log('Generating transient data');
    const time = Array.from({ length: 1001 }, (_, i) => i * 0.1);
    const vin1 = time.map((t) => Math.sin((2 * Math.PI * t) / 10) > 0 ? 5 : 0);
    const vin2 = time.map((t) => Math.sin((2 * Math.PI * (t + 2.5)) / 10) > 0 ? 5 : 0);
    const vout = time.map((t, i) => {
        const delay = 0.2;
        if (i < delay * 10) return 0;
        const in1 = vin1[i - delay * 10];
        const in2 = vin2[i - delay * 10];
        if (gate === 'xor') {
            return (in1 > 2.5) !== (in2 > 2.5) ? 4.5 : 0.5;
        } else {
            return (in1 > 2.5) === (in2 > 2.5) ? 4.5 : 0.5;
        }
    });

    // Create traces
    console.log('Creating plot traces and layout');
    const traces = [
        {
            x: time,
            y: vin1,
            type: "scatter",
            mode: "lines",
            name: "Input 1",
            line: {
                color: "#28a745",
                width: 2,
            },
        },
        {
            x: time,
            y: vin2,
            type: "scatter",
            mode: "lines",
            name: "Input 2",
            line: {
                color: "#17a2b8",
                width: 2,
            },
        },
        {
            x: time,
            y: vout,
            type: "scatter",
            mode: "lines",
            name: `${gate.toUpperCase()} Output`,
            line: {
                color: gate === 'xor' ? "#2196F3" : "#4CAF50",
                width: 2,
            },
        },
    ];

    const layout = {
        title: `${gate.toUpperCase()} Gate Transient Response`,
        xaxis: {
            title: "Time (ns)",
            range: [0, 100],
        },
        yaxis: {
            title: "Voltage (V)",
            range: [0, 5],
        },
        showlegend: true,
        margin: { t: 50, r: 20, b: 50, l: 50 },
    };

    // Store results
    results[gate].transient = { traces: traces, layout: layout };

    // Display results
    const resultsContainer = document.getElementById(`${gate}-transient-results`);
    if (resultsContainer) {
        console.log('Plotting transient results');
        Plotly.newPlot(resultsContainer, traces, layout, { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
        });
    } else {
        console.error('Transient results container not found');
    }
}
