/**
 * PLACEMENT READINESS DATA MODEL
 * Source: college's official 12-Parameter Placement Readiness Framework (250 marks)
 */

const PARAMETERS = [
  {
    id: 1,
    name: "Coding Problems Solved",
    maxMarks: 25,
    mode: "single",
    evidenceHint: "Public profile URL (LeetCode / CodeChef / HackerRank / SkillRack)",
    milestones: [
      { mark: 5,  label: "200 approved problems, incl. 20 SQL" },
      { mark: 10, label: "350 approved problems, incl. 30 SQL" },
      { mark: 15, label: "550 approved problems, incl. 45 SQL" },
      { mark: 20, label: "750 approved problems, incl. 60 SQL" },
      { mark: 25, label: "1,000+ approved problems, incl. 75 SQL" },
    ],
  },
  {
    id: 2,
    name: "Open-Source Contribution",
    maxMarks: 20,
    mode: "multi",
    evidenceHint: "Public PR URL / official selection announcement",
    milestones: [
      { mark: 3,  label: "1 valid PR submitted to an approved repository" },
      { mark: 5,  label: "1 PR merged by an external maintainer" },
      { mark: 10, label: "3 merged PRs" },
      { mark: 15, label: "5+ merged PRs" },
      { mark: 17, label: "Selected as contributor (GSoC / LFX / Outreachy / GSSoC)" },
      { mark: 20, label: "Recognised contributor/maintainer status" },
    ],
  },
  {
    id: 3,
    name: "Competition Achievement",
    maxMarks: 20,
    mode: "multi",
    evidenceHint: "Official result / leaderboard / certificate link",
    milestones: [
      { mark: 2,  label: "Valid completion in one approved event" },
      { mark: 4,  label: "Preliminary round cleared" },
      { mark: 6,  label: "Second/intermediate round cleared" },
      { mark: 10, label: "Regional/state/college finalist or winner" },
      { mark: 15, label: "National finalist/top rank" },
      { mark: 20, label: "National/international winner" },
    ],
  },
  {
    id: 4,
    name: "Certification Achievement",
    maxMarks: 20,
    mode: "multi",
    evidenceHint: "Official marksheet/credential + centre proof",
    milestones: [
      { mark: 3,  label: "Academic (NPTEL etc.): Completed" },
      { mark: 5,  label: "Academic: Elite" },
      { mark: 10, label: "Academic: Silver" },
      { mark: 15, label: "Academic: Gold" },
      { mark: 5,  label: "Industry credential: Foundation" },
      { mark: 10, label: "Industry credential: Associate" },
      { mark: 15, label: "Industry credential: Professional/Advanced" },
    ],
  },
  {
    id: 5,
    name: "Competitive Programming Rating",
    maxMarks: 20,
    mode: "single",
    evidenceHint: "Public rating profile URL (one platform)",
    milestones: [
      { mark: 5,  label: "CodeChef 2★ / Codeforces Pupil / AtCoder Brown" },
      { mark: 10, label: "CodeChef 3★ / Codeforces Specialist / AtCoder Green" },
      { mark: 15, label: "CodeChef 4★ / Codeforces Expert / AtCoder Cyan / LeetCode Knight" },
      { mark: 20, label: "CodeChef 5★ / Codeforces Candidate Master / AtCoder Blue / LeetCode Guardian" },
    ],
  },
  {
    id: 6,
    name: "Project / Product, Publication & Patent",
    maxMarks: 30,
    mode: "multi",
    evidenceHint: "Official result / publisher / patent record",
    milestones: [
      { mark: 3,  label: "Completed project submitted to an approved external event" },
      { mark: 5,  label: "Accepted submission or officially filed patent" },
      { mark: 10, label: "External demo/selection or peer-reviewed paper accepted" },
      { mark: 15, label: "Company/national shortlist, verified publication, or patent published" },
      { mark: 20, label: "Regional/state/national finalist, research distinction, or granted patent" },
      { mark: 30, label: "Winner, funded/incubated product, or licensed technology" },
    ],
  },
  {
    id: 7,
    name: "External Aptitude, Communication & Employability",
    maxMarks: 20,
    evidenceHint: "Official proctored scorecard",
    note: "Best aptitude mark (max 15) + best communication mark (max 5) combine.",
    subtracks: [
      {
        key: "aptitude", label: "Aptitude", cap: 15, mode: "single",
        milestones: [
          { mark: 3,  label: "Assessment completed with valid scorecard" },
          { mark: 6,  label: "Percentile 60–69" },
          { mark: 9,  label: "Percentile 70–79" },
          { mark: 12, label: "Percentile 80–89" },
          { mark: 15, label: "Percentile 90+" },
        ],
      },
      {
        key: "communication", label: "Communication", cap: 5, mode: "single",
        milestones: [
          { mark: 3, label: "Assessment completed with valid scorecard" },
          { mark: 5, label: "Score reaches Central threshold" },
        ],
      },
    ],
  },
  {
    id: 8,
    name: "Monthly Coding Assessment",
    maxMarks: 20,
    mode: "single",
    evidenceHint: "Central result (college-conducted)",
    note: "Cumulative average across all semesters — never resets.",
    milestones: [
      { mark: 0,  label: "Cumulative average below 50" },
      { mark: 5,  label: "Cumulative average 50–59" },
      { mark: 10, label: "Cumulative average 60–69" },
      { mark: 15, label: "Cumulative average 70–79" },
      { mark: 20, label: "Cumulative average 80+" },
    ],
  },
  {
    id: 9,
    name: "GATE & Optional Higher-Studies",
    maxMarks: 25,
    evidenceHint: "Official GATE/GRE/TOEFL dashboard or scorecard",
    note: "GATE is mandatory. Optional +3/+5 only apply once GATE core ≥ 5, total capped at 25.",
    subtracks: [
      {
        key: "gateCore", label: "GATE Core", cap: 25, mode: "single",
        milestones: [
          { mark: 3,  label: "Diagnostic + 3 GA/Maths tests" },
          { mark: 5,  label: "5 approved foundation/subject tests" },
          { mark: 10, label: "10 tests, avg 40%+" },
          { mark: 15, label: "15 tests incl. 3 full, avg 55%+" },
          { mark: 15, label: "Official GATE appearance" },
          { mark: 20, label: "Official GATE qualification" },
          { mark: 25, label: "Official GATE score 500+" },
        ],
      },
      {
        key: "gateOptional", label: "Optional exam", cap: 5, mode: "multi",
        milestones: [
          { mark: 3, label: "GRE/GMAT/CAT scorecard achieved" },
          { mark: 5, label: "TOEFL/IELTS/PTE Central threshold achieved" },
        ],
      },
    ],
  },
  {
    id: 10,
    name: "Internship, Startup, Industry & Off-Campus",
    maxMarks: 20,
    mode: "multi",
    evidenceHint: "Official employer/incubator record",
    milestones: [
      { mark: 2,  label: "Company OA completed" },
      { mark: 4,  label: "First round cleared" },
      { mark: 6,  label: "Interview shortlist" },
      { mark: 10, label: "Internship offer" },
      { mark: 15, label: "Completed internship" },
      { mark: 20, label: "PPO/PPI or verified offer" },
      { mark: 3,  label: "Startup shortlist" },
      { mark: 5,  label: "Approved pre-incubation" },
      { mark: 8,  label: "Recognised incubator selection" },
      { mark: 10, label: "Registered founder" },
      { mark: 15, label: "Official recognition or grant" },
      { mark: 20, label: "Funding round / national startup award" },
    ],
  },
  {
    id: 11,
    name: "Foreign Language Proficiency",
    maxMarks: 15,
    mode: "single",
    evidenceHint: "Official certificate/score report",
    milestones: [
      { mark: 7,  label: "CEFR A1 (JLPT N5 / Goethe A1 / DELF A1)" },
      { mark: 12, label: "CEFR A2 (JLPT N4 / Goethe A2 / DELF A2)" },
      { mark: 15, label: "CEFR B1 (JLPT N3 104+ / Goethe B1 / DELF B1)" },
    ],
  },
  {
    id: 12,
    name: "Hundred Days Training Programme",
    maxMarks: 15,
    mode: "single",
    evidenceHint: "Official Central selection list",
    note: "Categories don't accumulate — highest applies. Not selected = 0.",
    milestones: [
      { mark: 5,  label: "Selected for PEP training batch" },
      { mark: 10, label: "Selected for HOPE Non-Elite batch" },
      { mark: 15, label: "Selected for HOPE Elite batch" },
    ],
  },
];

const PLACEMENT_LEVELS = [
  { name: "Not Eligible", minTotal: 0,   pkg: null,             minCoding: 0,  minGate: 0  },
  { name: "Level 1",      minTotal: 80,  pkg: "Up to ₹5 LPA",   minCoding: 5,  minGate: 5  },
  { name: "Level 2",      minTotal: 120, pkg: "Up to ₹10 LPA",  minCoding: 10, minGate: 10 },
  { name: "Level 3",      minTotal: 160, pkg: "Up to ₹20 LPA",  minCoding: 15, minGate: 15 },
  { name: "Elite",        minTotal: 200, pkg: "Above ₹20 LPA",  minCoding: 15, minGate: 15 },
];

const BATCH_MULTIPLIER = {
  "2024-28": 0.75,
  "2023-27": 0.50,
  "2025-29": 0.80,
};

function calculatePlacementLevel(totalMarks, codingMark, gateCoreMark, batch) {
  const multiplier = BATCH_MULTIPLIER[batch] ?? 1;
  let achieved = PLACEMENT_LEVELS[0];

  for (const level of PLACEMENT_LEVELS) {
    const reqCoding = level.minCoding * multiplier;
    const reqGate = level.minGate * multiplier;
    if (totalMarks >= level.minTotal && codingMark >= reqCoding && gateCoreMark >= reqGate) {
      achieved = level;
    }
  }

  const blocked = totalMarks >= 80 && achieved.name === "Not Eligible";
  return {
    name: achieved.name,
    pkg: achieved.pkg,
    blockedReason: blocked
      ? "Your marks qualify for a higher level, but Coding Assessment or GATE core minimums aren't met yet."
      : null,
  };
}
