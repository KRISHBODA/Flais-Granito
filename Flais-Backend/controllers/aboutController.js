const AboutPage = require("../models/AboutPage");

const DEFAULT_ABOUT = {
  aboutSettings: {
    heroTitle: 'GUIDED BY EXCELLENCE',
    heroSubtitle: 'FLAIS GRANITO is dedicated to transforming spaces with superior craftsmanship and cutting-edge technology.',
    heroImage: '',
    narrativeTitle: 'Crafting a New Benchmark',
    narrativeDesc1: 'At FLAIS GRANITO, we specialize in crafting premium full body vitrified tiles, blending cutting-edge technology with artisanal craftsmanship. Our state-of-the-art facilities and innovative processes ensure tiles of the highest quality, redefining aesthetics and functionality in any space.',
    narrativeDesc2: 'With a wide range of colors, textures, and sizes, we offer limitless design possibilities to architects, designers, and homeowners, transforming ordinary spaces into extraordinary environments.',
    narrativeImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    statYears: '20+',
    statDealers: '500+',
    statCountries: '45+',
    statDesigns: '1000+',
    manuTitle: 'Manufacturing Excellence',
    manuDesc1: 'Explore our top-notch manufacturing facility, where cutting-edge technology meets expert craftsmanship. Our state-of-the-art equipment and rigorous quality control processes ensure the highest standards in full body vitrified tile production.',
    manuDesc2: 'With precision and innovation driving our operations, we transform raw materials into exceptional tiles that redefine industry standards. Our tiles stand out for their exceptional quality, innovative designs, and advanced manufacturing technology.',
    manuImage: '',
    sustainTitle: 'Sustainability First',
    sustainDesc1: "At FLAIS GRANITO, sustainability isn't an afterthought — it's embedded in every step of our manufacturing process. We believe premium quality and environmental responsibility go hand in hand.",
    sustainDesc2: "From water recycling systems to solar-powered facilities, we're committed to reducing our environmental footprint while delivering world-class vitrified tiles.",
    sustainImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    filmTitle: 'The Art of Modern Surfaces',
    filmDesc1: 'FLAIS GRANITO tiles are more than just surfaces — they are a testament to technological innovation and architectural durability. Every tile tells the story of precision, passion, and craftsmanship.',
    filmDesc2: 'Crafted with high-pressure technology and premium raw materials, our tiles offer unparalleled strength, stain resistance, and a flawless aesthetic finish that stands the test of time.',
    filmDesc3: 'From intimate residential spaces to grand commercial environments, FLAIS GRANITO delivers surfaces that inspire awe — a true mark of refined luxury.',
    exportTitle: 'Export Details',
    exportDesc: 'FLAIS GRANITO tiles travel across continents, gracing homes and commercial spaces worldwide. Our export network spans 45+ countries with dedicated logistics ensuring on-time delivery.',
    exportStat1Value: '45+',
    exportStat1Label: 'Export Countries',
    exportStat1Icon: '🌍',
    exportStat2Value: '500+',
    exportStat2Label: 'International Dealers',
    exportStat2Icon: '🤝',
    exportStat3Value: '2M+',
    exportStat3Label: 'Sq. Metres Exported/Yr',
    exportStat3Icon: '📦',
    exportStat4Value: '15+',
    exportStat4Label: 'Years of Exports',
    exportStat4Icon: '🏆',
  },
  videos: { 
    flaisFilm: 'FLAIS FILM_3 25SEC - [25FPS].mp4', 
    exhibition: 'FLAISVIDEO2.m4v' 
  },
  pillars: [
    { id: 1, title: 'Quality Excellence', desc: 'Advanced technology ensures top-tier tile durability and aesthetics.', icon: 'Shield' },
    { id: 2, title: 'Innovative Design', desc: 'Cutting-edge designs offer endless customization and style.', icon: 'Sparkles' },
    { id: 3, title: 'Manufacturing', desc: 'Latest technology and craftsmanship for superior performance.', icon: 'Layout' },
  ],
  exportCountries: [
    {
      id: 1,
      name: 'UAE',
      fullName: 'United Arab Emirates',
      coordinates: [54.37, 24.47],
      flag: '🇦🇪',
      region: 'Middle East',
      highlight: 'Premium Hospitality & Luxury Residential',
      detail: 'Our largest export market. FLAIS tiles grace luxury residential and hospitality projects across Dubai, Abu Dhabi, and beyond.',
    },
    {
      id: 2,
      name: 'USA',
      fullName: 'United States',
      coordinates: [-99.13, 38.01],
      flag: '🇺🇸',
      region: 'North America',
      highlight: 'Commercial & High-End Residential',
      detail: 'Supplying premium vitrified tiles to commercial developers and design studios across major US metro areas.',
    },
    {
      id: 3,
      name: 'UK',
      fullName: 'United Kingdom',
      coordinates: [-1.17, 52.37],
      flag: '🇬🇧',
      region: 'Europe',
      highlight: 'Retail Distribution & Design Studios',
      detail: 'Partnering with UK retailers and interior designers to deliver contemporary tile collections across England, Scotland, and Wales.',
    },
    {
      id: 4,
      name: 'Australia',
      fullName: 'Australia',
      coordinates: [133.77, -25.27],
      flag: '🇦🇺',
      region: 'Oceania',
      highlight: 'Construction & Outdoor Spaces',
      detail: "Growing presence in Australia's thriving construction sector with a focus on full-body vitrified and outdoor-rated tile collections.",
    },
    {
      id: 5,
      name: 'Canada',
      fullName: 'Canada',
      coordinates: [-96.8, 56.1],
      flag: '🇨🇦',
      region: 'North America',
      highlight: 'Architectural & Climate-Resistant Tiles',
      detail: 'Trusted by Canadian architects and contractors for our frost-resistant, durable tile solutions suited to extreme climates.',
    },
  ]
};

exports.getAboutPage = async (req, res) => {
  try {
    let about = await AboutPage.findOne();
    if (!about) {
      about = await AboutPage.create(DEFAULT_ABOUT);
    }
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertAboutPage = async (req, res) => {
  try {
    const payload = req.body?.about ? req.body.about : req.body;
    const about = await AboutPage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json({ success: true, message: "About page updated", about });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
