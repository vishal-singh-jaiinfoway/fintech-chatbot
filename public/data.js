const suggestedQuestions = {
  "Common": {
    "Common Questions": [
      "What are the most common questions asked during the Q&A portion of earnings calls?",
      "How did management teams address those questions?",
      "What topics/themes did management teams devote the most time to on earnings calls? (or what topics/themes were most common across banks)",
      "Summarize comments management teams made on earnings calls about the external environment (the economy, the regulatory landscape, customer sentiment, expectations about interest rates, loan demand, deposit competition, customer sentiment are examples)",
      "What forward looking expectations did management teams provide about net interest margin?",
      "Summarize management’s comments about credit quality"]
  },
  "Financial Performance & Guidance": {
    "Common Questions": [
      "What were the most common financial questions analysts asked?",
      "What concerns did analysts raise about revenue, EPS, net income, margins, and loan growth?",
      "Did analysts ask about guidance for the next quarter/year? What was the management’s response?",
      "Were there any unexpected financial concerns analysts highlighted?",
      "How did competitors justify misses or beats on financial expectations?",
    ],
  },
  "Interest Rate & Macro Impact": {
    "Common Questions": [
      "What did analysts ask about the impact of Fed rate changes on net interest margin (NIM)?",
      "How did competitors respond to concerns about loan demand and deposit pricing pressure?",
      "Were there any discussions around inflation and economic outlook?",
    ],
  },
  "Loan Portfolio & Credit Risk": {
    "Common Questions": [
      "What questions did analysts ask regarding loan portfolio quality, delinquency rates, and charge-offs?",
      "How did competitors address concerns about credit risk and exposure to specific industries (e.g., CRE, C&I loans)?",
      "Did analysts probe into loan loss provisions and reserve levels?",
      "Were there any regulatory concerns about stress tests or liquidity management?",
    ],
  },
  "Deposit Trends & Liquidity": {
    "Common Questions": [
      "What concerns did analysts raise about deposit outflows and cost of deposits?",
      "How did competitors explain liquidity management strategies?",
      "Were there any discussions around CDs, money market accounts, and client behavior shifts?",
    ],
  },
  "Technology & Digital Banking": {
    "Common Questions": [
      "Did analysts question digital transformation, fintech partnerships, or investment in AI/automation?",
      "What strategies did competitors highlight for digital banking growth?",
      "Were there concerns about operational risks, cybersecurity, or compliance issues?",
    ],
  },
  "Capital Allocation & Shareholder Returns": {
    "Common Questions": [
      "What did analysts ask about dividends, stock buybacks, and capital deployment?",
      "How did competitors justify capital decisions in light of regulatory requirements and growth plans?",
      "Were there discussions around M&A activity or expansion plans?",
    ],
  },
  "Regulatory & Compliance Risks": {
    "Common Questions": [
      "Did analysts ask about compliance with Basel III, stress tests, or new banking regulations?",
      "Were there any concerns raised about government scrutiny, lawsuits, or regulatory penalties?",
    ],
  },
  "Competitive Landscape & Market Positioning": {
    "Common Questions": [
      "How did analysts probe into competitive threats (regional banks, fintech, big banks)?",
      "What differentiation strategies did competitors highlight?",
      "Were there any discussions on customer retention, product offerings, or geographic expansion?",
    ],
  },
  "Cost Management & Operational Efficiency": {
    "Common Questions": [
      "What did analysts ask about cost-cutting measures, efficiency ratio, and expense control?",
      "How did competitors address questions around branch optimization and workforce restructuring?",
    ],
  },
  "Strategic Initiatives & Long-Term Vision": {
    "Common Questions": [
      "What future growth initiatives were analysts most interested in?",
      "Were there any concerns about leadership changes, succession planning, or cultural shifts?",
    ],
  },



};

const years = [2024];
const quarters = ["1st", "2nd", "3rd", "4th"];


const companies = [
  { name: "SoFi Technologies Inc.", ticker: "SOFI" },
  { name: "Morgan Stanley", ticker: "MS" },
  { name: "JPMorgan Chase & Co", ticker: "JPM" },
  { name: "Microsoft Corp", ticker: "MSFT" },
  { name: "Ameris Bancorp", ticker: "ABCB" },
  { name: "Associated Banc-Corp", ticker: "ASB" },
  { name: "Atlantic Union Bankshares Corporation", ticker: "AUB" },
  { name: "Banc of California, Inc.", ticker: "BANC" },
  { name: "Bank of America Corporation", ticker: "BAC" },
  { name: "Bank of Hawaii Corporation", ticker: "BOH" },
  { name: "Bank OZK", ticker: "OZK" },
  { name: "BankUnited, Inc.", ticker: "BKU" },
  { name: "BOK Financial Corporation", ticker: "BOKF" },
  { name: "Cadence Bank", ticker: "CADE" },
  { name: "Cathay General Bancorp", ticker: "CATY" },
  { name: "Citigroup Inc.", ticker: "C" },
  { name: "Citizens Financial Group, Inc.", ticker: "CFG" },
  { name: "Columbia Banking System, Inc.", ticker: "COLB" },
  { name: "Comerica Incorporated", ticker: "CMA" },
  { name: "Commerce Bancshares, Inc.", ticker: "CBSH" },
  { name: "Cullen/Frost Bankers, Inc.", ticker: "CFR" },
  { name: "Customers Bancorp, Inc.", ticker: "CUBI" },
  { name: "East West Bancorp, Inc.", ticker: "EWBC" },
  { name: "Eastern Bankshares, Inc.", ticker: "EBC" },
  { name: "F.N.B. Corporation", ticker: "FNB" },
  { name: "Fifth Third Bancorp", ticker: "FITB" },
  { name: "First Citizens BancShares, Inc.", ticker: "FCNC.A" },
  { name: "First Hawaiian, Inc.", ticker: "FHB" },
  { name: "First Horizon Corporation", ticker: "FHN" },
  { name: "First Interstate BancSystem, Inc.", ticker: "FIBK" },
  { name: "Flagstar Financial, Inc.", ticker: "FLG" },
  { name: "Fulton Financial Corporation", ticker: "FULT" },
  { name: "Glacier Bancorp, Inc.", ticker: "GBCI" },
  { name: "Hancock Whitney Corporation", ticker: "HWC" },
  { name: "Home Bancshares, Inc.", ticker: "HOMB" },
  { name: "Huntington Bancshares Incorporated", ticker: "HBAN" },
  { name: "KeyCorp", ticker: "KEY" },
  { name: "M&T Bank Corporation", ticker: "MTB" },
  { name: "Old National Bancorp", ticker: "ONB" },
  { name: "Pinnacle Financial Partners, Inc.", ticker: "PNFP" },
  { name: "Popular, Inc.", ticker: "BPOP" },
  { name: "Prosperity Bancshares, Inc.", ticker: "PB" },
  { name: "Provident Financial Services, Inc.", ticker: "PFS" },
  { name: "Regions Financial Corporation", ticker: "RF" },
  { name: "Simmons First National Corporation", ticker: "SFNC" },
  { name: "SouthState Corporation", ticker: "SSB" },
  { name: "Synovus Financial Corp.", ticker: "SNV" },
  { name: "Texas Capital Bancshares, Inc.", ticker: "TCBI" },
  { name: "The PNC Financial Services Group, Inc.", ticker: "PNC" },
  { name: "Truist Financial Corporation", ticker: "TFC" },
  { name: "U.S. Bancorp", ticker: "USB" },
  { name: "UMB Financial Corporation", ticker: "UMBF" },
  { name: "United Bankshares, Inc.", ticker: "UBSI" },
  { name: "United Community Banks, Inc.", ticker: "UCB" },
  { name: "Valley National Bancorp", ticker: "VLY" },
  { name: "Webster Financial Corporation", ticker: "WBS" },
  { name: "Wells Fargo & Company", ticker: "WFC" },
  { name: "Western Alliance Bancorporation", ticker: "WAL" },
  { name: "Wintrust Financial Corporation", ticker: "WTFC" },
  { name: "WSFS Financial Corporation", ticker: "WSFS" },
  { name: "Zions Bancorporation, National Association", ticker: "ZION" },
];

const personas = [
  "Controller (Chief Accounting Officer)",
  "Treasurer",
  "Head of Financial Planning & Analysis (FP&A)",
  "Head of Risk & Compliance",
  "Head of Taxation",
  "Investor Relations Director",
  "Head of Procurement & Vendor Management"
];



module.exports = { suggestedQuestions, companies, years, quarters, personas };
