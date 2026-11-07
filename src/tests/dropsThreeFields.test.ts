import fs from 'fs';
import path from 'path';
import { INITIAL_PROJECTS } from '../data/initialData';
import { parseDropDescription, formatDropDescription } from '../utils/drops';
import { Project } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING DROPS 3-FIELD DESCRIPTION & REMOVAL OF HIGH-RESOLUTION PHOTOGRAPHY TESTS ---');

// 1. Verify "HIGH RESOLUTION PHOTOGRAPHY" line is completely removed from ProjectsSection
const projectsSectionPath = path.resolve(process.cwd(), 'src/components/sections/ProjectsSection.tsx');
const projectsSectionContent = fs.readFileSync(projectsSectionPath, 'utf-8');

assert(
  !projectsSectionContent.toLowerCase().includes('high-resolution photography & motion visuals'),
  'High-Resolution Photography tagline is completely removed from ProjectsSection.tsx'
);
assert(
  !projectsSectionContent.toLowerCase().includes('high-resolution photography'),
  '"High-Resolution Photography" text does not exist in ProjectsSection.tsx'
);
assert(
  !projectsSectionContent.includes('★ TOP'),
  '"★ TOP" badge is removed from DropTileCard in ProjectsSection.tsx'
);
assert(
  !projectsSectionContent.includes('{project.category} · {project.year}'),
  '"{project.category} · {project.year}" label is removed from DropTileCard in ProjectsSection.tsx'
);

// 2. Verify all INITIAL_PROJECTS descriptions contain ONLY the three required fields
assert(INITIAL_PROJECTS.length > 0, 'INITIAL_PROJECTS has projects');

for (const proj of INITIAL_PROJECTS) {
  const desc = proj.description.trim();
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);

  assert(
    lines.length === 3,
    `Project "${proj.name}" description has exactly 3 lines (has ${lines.length})`
  );

  assert(
    lines[0].startsWith('Artist name:'),
    `Project "${proj.name}" line 1 starts with "Artist name:"`
  );
  assert(
    lines[1].startsWith('Live at:'),
    `Project "${proj.name}" line 2 starts with "Live at:"`
  );
  assert(
    lines[2].startsWith("Artist's description:"),
    `Project "${proj.name}" line 3 starts with "Artist's description:"`
  );

  // Verify no extraneous lines or legacy paragraphs exist
  const remainingText = lines[0].replace('Artist name:', '').trim();
  assert(remainingText.length > 0, `Project "${proj.name}" has artist name value`);

  const liveAtText = lines[1].replace('Live at:', '').trim();
  assert(liveAtText.length > 0, `Project "${proj.name}" has live at value`);

  const artistDescText = lines[2].replace("Artist's description:", '').trim();
  assert(artistDescText.length > 0, `Project "${proj.name}" has artist description value`);
}

// 3. Test parseDropDescription & formatDropDescription
const sampleProject: Partial<Project> = {
  name: 'Festival Nights',
  clientName: 'Sunidhi Chauhan',
  description: "Artist name: Sunidhi Chauhan Live Tour\nLive at: Mumbai D.Y. Patil Stadium\nArtist's description: High-voltage concert energy with stadium spotlights.",
};

const parsed = parseDropDescription(sampleProject);
assert(parsed.artistName === 'Sunidhi Chauhan Live Tour', 'parseDropDescription parses Artist name correctly');
assert(parsed.liveAt === 'Mumbai D.Y. Patil Stadium', 'parseDropDescription parses Live at correctly');
assert(
  parsed.artistDescription === 'High-voltage concert energy with stadium spotlights.',
  'parseDropDescription parses Artist description correctly'
);

const formatted = formatDropDescription(parsed);
assert(
  formatted ===
    "Artist name: Sunidhi Chauhan Live Tour\nLive at: Mumbai D.Y. Patil Stadium\nArtist's description: High-voltage concert energy with stadium spotlights.",
  'formatDropDescription outputs the exact 3-field format'
);

// 4. Verify Admin Dashboard includes editing inputs for the 3 fields
const adminPath = path.resolve(process.cwd(), 'src/components/admin/AdminDashboard.tsx');
const adminContent = fs.readFileSync(adminPath, 'utf-8');

assert(
  adminContent.includes('Artist name *'),
  'AdminDashboard project form contains "Artist name *" input label'
);
assert(
  adminContent.includes('Live at *'),
  'AdminDashboard project form contains "Live at *" input label'
);
assert(
  adminContent.includes("Artist's description *") || adminContent.includes('Artist&apos;s description *'),
  'AdminDashboard project form contains "Artist\'s description *" input label'
);

// 5. Verify ProjectDetailModal renders the 3 fields
const modalPath = path.resolve(process.cwd(), 'src/components/modals/ProjectDetailModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf-8');

assert(
  modalContent.includes('Artist name:'),
  'ProjectDetailModal renders "Artist name:"'
);
assert(
  modalContent.includes('Live at:'),
  'ProjectDetailModal renders "Live at:"'
);
assert(
  modalContent.includes('{project.name}'),
  'ProjectDetailModal renders "{project.name}" heading'
);
assert(
  !modalContent.includes('Project {project.number}'),
  'ProjectDetailModal does not contain "Project {project.number}" label'
);
assert(
  !modalContent.includes('Released {project.year}'),
  'ProjectDetailModal does not contain "Released {project.year}" metadata'
);
assert(
  !modalContent.includes('Client: {project.clientName}'),
  'ProjectDetailModal does not contain "Client: {project.clientName}" metadata'
);

console.log('--- ALL DROPS 3-FIELD DESCRIPTION & HIGH RESOLUTION PHOTOGRAPHY REMOVAL TESTS PASSED ---');
