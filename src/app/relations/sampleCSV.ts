export const sampleCSV1 = `parent,child,relation
Root claim: Universal basic income would eliminate poverty.,A guaranteed income would ensure basic needs.,Support
Root claim: Universal basic income would eliminate poverty.,It could reduce motivation to work.,Attack
A guaranteed income would ensure basic needs.,It could increase consumer spending.,Support
It could reduce motivation to work.,Higher taxes could be required.,Attack
It could reduce motivation to work.,People may pursue creative work instead.,Support
Higher taxes could be required.,Small businesses might struggle.,Attack
Higher taxes could be required.,Government revenue could rise.,Support
Small businesses might struggle.,Some businesses may relocate abroad.,Attack
Some businesses may relocate abroad.,Local unemployment may rise.,Attack
Government revenue could rise.,Public services could improve.,Support
Public services could improve.,Healthcare and education could be more accessible.,Support
Local unemployment may rise.,Social assistance may be needed.,Support
Social assistance may be needed.,Poverty may persist despite UBI.,Attack
Poverty may persist despite UBI.,Targeted programs could help.,Support
Targeted programs could help.,Bureaucracy may increase.,Attack
Bureaucracy may increase.,Transparency and auditing could prevent misuse.,Support
Transparency and auditing could prevent misuse.,Public trust could improve.,Support
People may pursue creative work instead.,Innovation and entrepreneurship may increase.,Support
Innovation and entrepreneurship may increase.,Economic growth could accelerate.,Support
Economic growth could accelerate.,UBI benefits may be amplified.,Support
`;

export const sampleCSV2 = `parent,child,relation
Root claim: Artificial intelligence will transform society for the better.,AI can automate dangerous jobs, reducing human risk.,Support
Root claim: Artificial intelligence will transform society for the better.,AI may replace human workers, increasing unemployment.,Attack
Root claim: Artificial intelligence will transform society for the better.,AI could exacerbate social inequality.,Attack
Root claim: Artificial intelligence will transform society for the better.,AI can improve healthcare outcomes.,Support
AI can automate dangerous jobs,Humans can focus on creative tasks.,Support
AI may replace human workers,Social safety nets may be required.,Support
AI may replace human workers,Ethical concerns about fairness arise.,Attack
AI could exacerbate social inequality,Targeted policies could reduce disparity.,Support
AI could exacerbate social inequality,Wealth may concentrate further.,Attack
AI can improve healthcare outcomes,Medical diagnosis becomes faster and more accurate.,Support
Humans can focus on creative tasks,Innovation could accelerate.,Support
Innovation could accelerate,New industries may emerge.,Support
New industries may emerge,Some traditional sectors may decline.,Attack
Some traditional sectors may decline,Reskilling programs may help.,Support
Reskilling programs may help,Education systems need reform.,Support
Education systems need reform,Costs may rise.,Attack
Costs may rise,Long-term benefits could outweigh short-term losses.,Support
Ethical concerns about fairness arise,Regulations may be needed.,Support
Regulations may be needed,Responsible AI deployment increases public trust.,Support
Responsible AI deployment increases public trust,Adoption rates grow faster.,Support
`;

export function parseCSVString(csv: string) {
  const lines = csv.trim().split("\n");
  const header = lines.shift()?.split(",") || [];
  return lines.map((line) => {
    const values = line.split(",");
    const obj: any = {};
    header.forEach((h, i) => {
      obj[h.trim()] = values[i].trim();
    });
    return obj;
  });
}
