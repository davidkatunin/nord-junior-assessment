# nord-junior-assessment

`nord-junior-assessment` is a contract renewal script made for a Nord Security interview

## Stack
TypeScript

## Download

Clone the script from the [Github repo](https://github.com/davidkatunin/nord-junior-assessment)

```bash
git clone https://github.com/davidkatunin/nord-junior-assessment.git
```

## Installation/Dependencies

Install the dependencies with:
```bash
npm install
```

## Usage

To run the script: 
```bash
npm start
```

To test the script: 
```bash
npm test
```

Note: tests have hard-coded logic from the script instead of pulling "functions" from the file directly

## Layout
nord-junior-assessment/
├── .gitignore
├── data/
│   ├── config.json
│   └── contracts.json
├── output/
│   └── notification_log.json
├── package-lock.json
├── package.json
├── README.md
├── src/
│   └── script.ts <- main script
├── test/
│   └── testScriptLogic.ts <- script tests
└── tsconfig.json

## 
Created by @davidkatunin