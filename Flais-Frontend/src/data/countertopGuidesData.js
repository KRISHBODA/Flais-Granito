/**
 * Comprehensive technical data and guides for FLAIS Granito 15mm Countertops & Porcelain Slabs.
 */

export const COUNTERTOP_GUIDES = [
  {
    id: 'laying-for-floor',
    title: 'Laying for Floor',
    category: 'Installation',
    shortDesc: 'Substrate preparation, leveling, and joint spacing for 15mm floor slabs.',
    icon: 'Layers',
    pdfUrl: 'https://cdn.flowpage.com/images/1b4b0ccd-65c0-4296-a788-845f90ae3a36-pdf?m=1650780761',
    steps: [
      {
        title: 'Substrate Inspection & Flatness',
        desc: 'Ensure the screed or concrete base is fully cured (>28 days), clean, and level with a maximum tolerance of 2mm over a 2m straight edge.'
      },
      {
        title: 'Double Spreading (Back-Buttering)',
        desc: 'Apply adhesive to both the substrate using a 10mm-12mm square notched trowel and a flat contact layer (1mm-2mm) on the back of the 15mm slab to achieve 100% void-free coverage.'
      },
      {
        title: 'Vibration & Mechanical Leveling',
        desc: 'Use an electric vibrating plate or rubber mallet to settle the slab and eliminate trapped air pockets. Install mechanical leveling clips (2mm minimum joint width).'
      },
      {
        title: 'Perimeter & Expansion Joints',
        desc: 'Never butt slabs against walls or columns. Leave a 5mm perimeter joint and perimeter expansion joints every 4m to 5m in large commercial areas.'
      }
    ],
    keySpecs: [
      { label: 'Minimum Joint Width', value: '2.0 mm' },
      { label: 'Recommended Adhesive', value: 'Class C2TES1 / S2' },
      { label: 'Adhesive Coverage', value: '100% Void-Free' },
      { label: 'Grouting Wait Time', value: '24 - 48 Hours' }
    ]
  },
  {
    id: 'video-cutting-handling',
    title: 'Video - Cutting & Handling',
    category: 'Video Tutorial',
    shortDesc: 'Professional masterclass on cutting, beveling, and transporting 15mm porcelain slabs.',
    icon: 'Play',
    isVideo: true,
    videoUrl: 'https://www.youtube.com/embed/O7oT47o92hM?autoplay=1',
    youtubeId: 'O7oT47o92hM',
    steps: [
      {
        title: 'Safety & Equipment Setup',
        desc: 'Wear PPE including safety goggles, cut-resistant gloves, and dust masks. Use a rigid cutting bench with sacrificial wooden or rubber support.'
      },
      {
        title: 'Continuous Rim Blade Cutting',
        desc: 'Utilize specialized continuous rim diamond blades designed for 15mm sintered stone / porcelain with abundant water cooling.'
      },
      {
        title: 'Controlled Feed Rate',
        desc: 'Maintain constant, steady forward pressure without forcing the saw. Slow down entry and exit by 50% to prevent corner chipping.'
      }
    ],
    keySpecs: [
      { label: 'Format', value: 'Full HD 1080p' },
      { label: 'Tool Focus', value: 'Bridge Saw & Hand Rail Saw' },
      { label: 'Cooling Requirement', value: 'Continuous Water Jet' }
    ]
  },
  {
    id: 'edge-polishing',
    title: 'Edge Polishing & Profiling',
    category: 'Fabrication',
    shortDesc: 'Beveling, 45° miter joints, bullnose edges, and diamond pad progression.',
    icon: 'Wrench',
    pdfUrl: 'https://cdn.flowpage.com/images/85430fab-d458-4e9b-985e-3564cac1cf5a-pdf?m=1668249800',
    steps: [
      {
        title: 'Initial Shaping & Chamfer',
        desc: 'Use continuous diamond cup wheels to create the desired profile (e.g. 2mm-3mm micro-bevel or 45° miter for monolithic box edges).'
      },
      {
        title: 'Grit Progression (Wet Polishing)',
        desc: 'Progress sequentially through resin diamond pads: 50 -> 100 -> 200 -> 400 -> 800 -> 1500 -> 3000 grit under constant water lubrication.'
      },
      {
        title: 'Final Buffing & Sealing',
        desc: 'Use felt buffing wheels with cerium oxide or specialized porcelain polishing compound to match the factory gloss or satin finish.'
      }
    ],
    keySpecs: [
      { label: 'Optimal Polishing RPM', value: '2,000 - 3,500 RPM' },
      { label: 'Diamond Grit Sequence', value: '50 to 3000 Grit' },
      { label: 'Edge Profiles', value: 'Miter 45°, Chamfer, Pencil, Bullnose' }
    ]
  },
  {
    id: 'handling-the-slab',
    title: 'Handling the Slab',
    category: 'Logistics',
    shortDesc: 'Safe lifting protocols, A-frame storage, and mechanical suction frames.',
    icon: 'UserCheck',
    pdfUrl: 'https://cdn.flowpage.com/images/5d80dd88-c7ec-481f-a057-d8e2d30f547e-pdf?m=1650780735',
    steps: [
      {
        title: 'A-Frame Vertical Storage',
        desc: 'Always store 15mm slabs vertically on rubberized A-frames tilted at an angle of 3° to 5°. Never store horizontally without continuous rigid support.'
      },
      {
        title: 'Multi-Cup Suction Handling Frame',
        desc: 'Always lift large format slabs using an aluminum handling frame equipped with vacuum suction cups (minimum 6-8 cups) and cross-bracing.'
      },
      {
        title: 'Two-to-Four Person Transport',
        desc: 'Carry the slab on edge in the vertical plane. Never transport slabs horizontally to avoid tensile flexing stresses.'
      }
    ],
    keySpecs: [
      { label: 'Storage Orientation', value: 'Vertical on A-Frame (3°-5°)' },
      { label: 'Lifting Tool', value: 'Reinforced Suction Frame' },
      { label: 'Minimum Crew', value: '2 - 4 Trained Handlers' }
    ]
  },
  {
    id: 'cutting-guide',
    title: 'Cutting Guide',
    category: 'Fabrication',
    shortDesc: 'Bridge saw blade parameters, waterjet piercing, and feed speeds.',
    icon: 'Disc',
    pdfUrl: 'https://cdn.flowpage.com/images/e82c8817-cc97-4fc5-a58b-d0374483ab38-pdf?m=1668249976',
    steps: [
      {
        title: 'Bridge Saw Blade Selection',
        desc: 'Use thin continuous-rim or narrow turbo diamond blades formulated specifically for sintered compact surfaces and 15mm porcelain.'
      },
      {
        title: 'Blade Speed & Water Supply',
        desc: 'Operate at 2,000 - 2,500 RPM. Ensure high-pressure water nozzles spray directly at the blade contact point from both sides.'
      },
      {
        title: 'Cut In & Cut Out Technique',
        desc: 'Reduce the feed rate to 0.5 m/min for the first 100mm, increase to 1.2-1.5 m/min for the body, and slow to 0.5 m/min for the exit.'
      },
      {
        title: 'Internal Cutouts (Sinks & Cooktops)',
        desc: 'Always pre-drill corner radii (min radius 8mm-10mm) before making straight cuts to eliminate internal stress concentrations.'
      }
    ],
    keySpecs: [
      { label: 'Spindle Speed', value: '2,000 - 2,500 RPM' },
      { label: 'Linear Feed Rate', value: '1.0 - 1.5 m/min' },
      { label: 'Corner Radius for Cutouts', value: 'Minimum 8.0 mm' },
      { label: 'Coolant Flow', value: 'Continuous High Flow' }
    ]
  },
  {
    id: 'laying-application',
    title: 'Laying Application',
    category: 'Installation',
    shortDesc: 'Troweling methods, perimeter clearance, and adhesive bonding standards.',
    icon: 'BrickWall',
    pdfUrl: 'https://cdn.flowpage.com/images/2815f37f-b2bc-4553-abac-4eb49e410273-pdf?m=1668249916',
    steps: [
      {
        title: 'Straight Parallel Troweling',
        desc: 'Trowel adhesive in straight, parallel lines perpendicular to the short side of the slab. Avoid swirling or curved ridges to allow air expulsion.'
      },
      {
        title: 'Open Time Awareness',
        desc: 'Never exceed the adhesive open time (typically 20-30 minutes). Check for skinning by touching the ridges before placing the slab.'
      },
      {
        title: 'Anti-Lipping Leveling System',
        desc: 'Insert leveling clips every 40-50 cm along all edges and tighten wedges to ensure absolute plane flatness without lippage.'
      }
    ],
    keySpecs: [
      { label: 'Trowel Type', value: '12mm Square or Slant Notch' },
      { label: 'Back Bedding', value: '100% Solid Contact' },
      { label: 'Leveling Spacing', value: 'Every 40 - 50 cm' }
    ]
  },
  {
    id: 'pre-installation-guidelines',
    title: 'Pre-Installation Guidelines',
    category: 'Inspection',
    shortDesc: 'Quality check, batch and tone confirmation, dry layout, and substrate curing.',
    icon: 'ClipboardCheck',
    pdfUrl: 'https://cdn.flowpage.com/images/802f620d-5348-4718-84aa-dcbf9331ba8c-pdf?m=1668249933',
    steps: [
      {
        title: 'Batch & Caliber Verification',
        desc: 'Inspect all carton boxes before opening to ensure identical batch codes, shade tonality, and caliber ratings.'
      },
      {
        title: 'Dry Layout & Vein Matching',
        desc: 'Perform a dry layout of multiple slabs on a clean surface to harmonize vein patterns, bookmatch symmetry, and continuous grain flow.'
      },
      {
        title: 'Surface Dust Removal',
        desc: 'Wipe the back of each slab with a damp sponge or clean rag to remove manufacturing dust before applying adhesive.'
      }
    ],
    keySpecs: [
      { label: 'Tone Check', value: 'Compare Under White Light (5000K)' },
      { label: 'Inspection Obligation', value: 'Must Inspect Before Cutting' },
      { label: 'Vein Direction', value: 'Check Arrow Markers on Back' }
    ]
  },
  {
    id: 'adhesive-information',
    title: 'Adhesive Information',
    category: 'Materials',
    shortDesc: 'Recommended polymer-modified cementitious adhesives (EN 12004 C2TES1/S2).',
    icon: 'Pipette',
    pdfUrl: 'https://cdn.flowpage.com/images/74b5e69e-d9a6-4d88-b6c6-0e423da9147f-pdf?m=1650780798',
    steps: [
      {
        title: 'Class C2TES1 Cementitious Mortar',
        desc: 'Formulated with high polymer content, extended open time (E), slip resistance (T), and transverse deformation > 2.5mm (S1).'
      },
      {
        title: 'Mixing Consistency',
        desc: 'Mix with clean potable water using a mechanical slow-speed paddle mixer (300-400 RPM). Allow 5 minutes slake time, then re-mix.'
      },
      {
        title: 'Heavy Duty / Heated Screeds (C2TES2)',
        desc: 'For radiant floor heating, external cladding, or countertop substrate bonding, use highly deformable Class S2 adhesives.'
      }
    ],
    keySpecs: [
      { label: 'Standard Classification', value: 'ISO 13007 / EN 12004 C2TES1' },
      { label: 'Elastic Deformation', value: 'S1 (>=2.5mm) / S2 (>=5.0mm)' },
      { label: 'Pot Life', value: 'Approximately 3 - 4 Hours' }
    ]
  },
  {
    id: 'cleaning-maintenance',
    title: 'Cleaning & Maintenance',
    category: 'Care',
    shortDesc: 'Initial post-laying acid wash, routine maintenance, and stain removal procedures.',
    icon: 'Sparkles',
    pdfUrl: 'https://cdn.flowpage.com/images/1e1db5a3-7e29-42d1-ab0d-fd5da31af9fd-pdf?m=1668249962',
    steps: [
      {
        title: 'End-of-Installation Acid Cleanse',
        desc: 'Wash the surface with a buffered acidic detergent (e.g. sulfamic / buffered acid) 4-5 days after grouting to remove cementitious grout haze. Rinse thoroughly with water.'
      },
      {
        title: 'Daily Neutral Cleaning',
        desc: 'Use warm water with neutral pH floor cleaner. Avoid waxes, oily soaps, or hydrofluoric acid based chemicals.'
      },
      {
        title: 'Stubborn Stains (Grease & Wine)',
        desc: 'Apply alkaline degreasing cleaner for oils, or dilute bleach for organic pigments. Rinse immediately with fresh water.'
      }
    ],
    keySpecs: [
      { label: 'Daily Cleaner pH', value: 'Neutral pH 7.0' },
      { label: 'Prohibited Substances', value: 'Hydrofluoric Acid (HF)' },
      { label: 'Water Absorption', value: '< 0.05% (Stain Proof)' }
    ]
  },
  {
    id: 'disclaimer-specifications',
    title: 'Technical Specifications & Disclaimer',
    category: 'Compliance',
    shortDesc: 'Quality tolerances, expansion provisions, and warranty conditions.',
    icon: 'ShieldAlert',
    pdfUrl: 'https://cdn.flowpage.com/images/5f1c0138-ece7-4230-a4e1-ce8216fa96ad-pdf?m=1678094053',
    steps: [
      {
        title: 'Pre-Laying Inspection Obligation',
        desc: 'FLAIS Granito products are manufactured to rigorous ISO 13006 & Keval Granito LLP standards. Slabs must be thoroughly inspected prior to cutting or laying. Installation constitutes acceptance.'
      },
      {
        title: 'Thermal & Structural Movement',
        desc: 'Appropriate structural expansion joints must be maintained in substrates, vertical junctions, and countertop corner cutouts.'
      },
      {
        title: 'Authorized Installation Practices',
        desc: 'Failure to follow manufacturer guidelines regarding adhesive class, void-free double spreading, and blade specs will void warranty claims.'
      }
    ],
    keySpecs: [
      { label: 'Standard', value: 'ISO 13006 / EN 14411 Group BIa' },
      { label: 'Mohs Surface Hardness', value: '>= 7' },
      { label: 'Bending Strength', value: '>= 45 N/mm²' },
      { label: 'Manufacturer', value: 'FLAIS Granito / Keval Granito LLP' }
    ]
  }
];
