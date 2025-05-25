## Overview
This experiment allows you to simulate and analyze CMOS XOR and XNOR gates using SPICE. You can study their voltage transfer characteristics (VTC) and transient response through an interactive web interface.

### Prerequisites
- Basic understanding of CMOS logic gates
- Familiarity with SPICE syntax
- Understanding of MOSFET parameters (W/L ratio, threshold voltage)

## Steps

#### 1. Select Gate Type
- Click on either "XOR Gate" or "XNOR Gate" tab at the top of the page
- Each gate has four sub-tabs:
  - Schematic
  - Parameters
  - SPICE Code
  - Results

#### 2. Study the Schematic
- View the gate schematic in the Schematic tab
- Note the transistor connections and network structure
- Review the circuit description and learning objectives
- Understand the relationship between inputs and output

#### 3. Configure Parameters
- Navigate to the Parameters tab
- Adjust the following parameters using the sliders:
  - Supply Voltage (VDD): 1V to 5V
    - Default: 5V
    - Affects power consumption and noise margins
  - PMOS Width (Wp): 0.5μm to 10μm
    - Default: 2.0μm
    - Affects rise time and high-to-low transition
  - NMOS Width (Wn): 0.5μm to 10μm
    - Default: 1.0μm
    - Affects fall time and low-to-high transition
  - MOSFET Length (L): 0.1μm to 1.0μm
    - Default: 0.18μm
    - Affects current drive and switching speed

- Click "Check Parameters" to validate your settings
  - System will verify:
    - W/L ratios (should be between 2 and 20)
    - PMOS/NMOS width ratio (should be between 1.5 and 2.5)
    - Supply voltage range (1V to 5V)
- Use "Reset Parameters" to restore default values if needed

#### 4. Review and Edit SPICE Code
- Go to the SPICE Code tab
- Review the automatically generated SPICE netlist
- The code includes:
  - Power supply definition
  - Input voltage sources
  - Transistor definitions with current parameters
  - MOSFET model parameters
  - Analysis commands
- Optional: Edit the code if needed
- Click "Validate SPICE Code" to check for:
  - Required elements (VDD, VIN1, VIN2, transistors, models)
  - Proper syntax and formatting
  - Complete model definitions
  - Valid transistor parameters
- Use "Restore Default" to reset the code if needed

#### 5. Run Simulations
- In the SPICE Code tab, use the simulation buttons:
  - "Run DC Analysis" button:
    - Generates Voltage Transfer Characteristic (VTC)
    - Shows relationship between input and output voltages
    - Displays switching threshold and noise margins
  - "Run Transient Analysis" button:
    - Shows time-domain behavior
    - Displays input and output waveforms
    - Illustrates propagation delays and switching characteristics

#### 6. Analyze Results
- Go to the Results tab to view simulation outputs
- DC Analysis Results show:
  - Voltage Transfer Characteristic (VTC) plot
  - Input vs. Output voltage relationship
  - Switching threshold point
  - Noise margins
  - Gain at switching point
- Transient Analysis Results show:
  - Input waveforms (Input 1 and Input 2)
  - Output waveform
  - Propagation delays
  - Rise and fall times
  - Switching behavior

#### 7. Compare Gates
- Switch between XOR and XNOR gates using the main tabs
- Compare their characteristics:
  - VTC curves
  - Switching behavior
  - Propagation delays
  - Power consumption
- Note that results are preserved when switching between analysis types
- Each gate's results are stored separately