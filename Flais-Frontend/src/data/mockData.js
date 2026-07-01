import modernLivingImg from './../assets/modern_living.jpg';
import eleganceImg from './../assets/elegance.jpg';
import bravBlueImg from './../assets/BRAZILLIAN BLUE.jpg';

export const categories = [
  { id: 'full-body', name: 'Full Body Tiles', image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=800&auto=format&fit=crop' },
  { id: 'digital-full-body', name: 'Color Body Tiles', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=800&auto=format&fit=crop' },
  { id: 'slab', name: 'Gvt/Pgvt tiles', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop' },
  { id: 'technical-porcelain', name: 'Technical Porcelain Tiles', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop' },
  { id: 'color-body', name: 'Color Body Tiles', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop' },
];

export const products = [
  {
    id: 1,
    name: 'Flecka',
    category: 'full-body',
    thickness: '15mm',
    size: '600x600mm',
    application: 'floor',
    look: 'stone',
    price: 45.99,
    image: eleganceImg,
    images: [
      eleganceImg,
      'https://images.unsplash.com/photo-1600585154340-be6199f68b0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Elegant flecked tile with subtle veining, perfect for a luxurious floor finish.',
    specs: { size: '600x600mm', material: 'Polished Porcelain', finish: 'High Gloss' }
  },
  {
    id: 2,
    name: 'Grain',
    category: 'digital-full-body',
    thickness: '9mm',
    size: '300x600mm',
    application: 'wall',
    look: 'wood',
    price: 32.50,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6199f68b0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Durable and textured grain tiles for a natural look in your living spaces.',
    specs: { size: '300x600mm', material: 'Natural Stone', finish: 'Matte' }
  },
  {
    id: 3,
    name: 'Intrica',
    category: 'slab',
    thickness: '15mm',
    size: '800x2400mm',
    application: 'outdoor',
    look: 'marble',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527359443443-84a48abc7df0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6199f68b0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Classic edge tiles for a timeless kitchen or bathroom backsplash.',
    specs: { size: '100x200mm', material: 'Ceramic', finish: 'Glossy' }
  },
  {
    id: 4,
    name: 'Oak Wood Look Plank',
    category: 'floor',
    thickness: '9mm',
    size: '600x1200mm',
    application: 'floor',
    look: 'wood',
    price: 38.00,
    image: bravBlueImg,
    images: [
      bravBlueImg,
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6199f68b0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'The warmth of wood with the durability of porcelain. Ideal for high traffic areas.',
    specs: { size: '200x1200mm', material: 'Porcelain', finish: 'Textured' }
  },
  {
    id: 5,
    name: 'Terrazzo Multi-Color',
    category: 'kitchen',
    thickness: '15mm',
    size: '600x600mm',
    application: 'wall',
    look: 'stone',
    price: 42.00,
    image: modernLivingImg,
    images: [
      modernLivingImg,
      'https://images.unsplash.com/photo-1600585154340-be6199f68b0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Modern terrazzo tiles with colorful speckles for a contemporary kitchen island or floor.',
    specs: { size: '600x600mm', material: 'Cement-based Porcelain', finish: 'Satin' }
  },
  {
    id: 6,
    name: 'Onyx Pearl Wall',
    category: 'wall',
    thickness: '9mm',
    size: '800x3000mm',
    application: 'wall',
    look: 'marble',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616137422495-1e902b78793c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617103023188-fb6c08d8b8b4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486029423-aaa47a300076?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Translucent onyx-effect tiles that create a stunning, high-end look for feature walls.',
    specs: { size: '800x1600mm', material: 'Onyx Porcelain', finish: 'Polished' }
  },
  {
    id: 7,
    name: 'Concrete Industrial Grey',
    category: 'floor',
    thickness: '15mm',
    size: '600x1200mm',
    application: 'outdoor',
    look: 'rustic',
    price: 28.00,
    image: bravBlueImg,
    images: [
      bravBlueImg,
      'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518481612222-68bbe828e5ec?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590483734748-36112ce34bb3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523413363574-c3c444a16d78?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Modern industrial aesthetic with a cool concrete grey tone. Perfect for lofts and open spaces.',
    specs: { size: '600x1200mm', material: 'Porcelain', finish: 'Matte' }
  },
  {
    id: 8,
    name: 'Moroccan Azure Mosaic',
    category: 'wall',
    thickness: '9mm',
    size: '300x600mm',
    application: 'wall',
    look: 'decor',
    price: 65.00,
    image: eleganceImg,
    images: [
      eleganceImg,
      'https://images.unsplash.com/photo-1576016773942-0039e248f76d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523213139764-647950c40461?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617104424032-b9bd6972d0e4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618221609143-9b0d3d526860?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Handcrafted-look mosaic tiles with intricate Moroccan patterns in vibrant azure blue.',
    specs: { size: '300x300mm', material: 'Glass/Ceramic', finish: 'Glazed' }
  }
];

export const blogPosts = [
  {
    id: "9mm-vs-15mm",
    date: "Apr 14, 2026",
    title: "9mm Full Body Tiles vs 15mm Full Body Tiles: Which One Should You Choose?",
    excerpt: "Confused between 9mm and 15mm full body tiles? Compare strength, cost, applications, and durability to choose the right tile for your project....",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4ea0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: "Full content goes here..."
  },
  {
    id: "installation-guide",
    date: "Apr 06, 2026",
    title: "Full Body Tiles Installation Guide: Step-by-Step Process",
    excerpt: "Learn how to install full body tiles step-by-step. Avoid common mistakes and ensure perfect leveling, spacing, and long-lasting tile performance....",
    image: "https://images.unsplash.com/photo-1600566752229-250ce01d8487?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: "Full content goes here..."
  },
  {
    id: "high-traffic-areas",
    date: "Mar 14, 2026",
    title: "Why Full Body Vitrified Tiles Are Best for High-Traffic Areas in India",
    excerpt: "Discover why full body vitrified tiles are ideal for high-traffic areas in India. Learn about durability, abrasion resistance, and long-term performance....",
    image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: "Full content goes here..."
  }
];

export const testimonials = [
  { id: 1, name: 'John Doe', text: 'FLAIS GRANITO transformed our living room. The quality of the marble is unmatched.', role: 'Homeowner' },
  { id: 2, name: 'Sarah Miller', text: 'Fantastic service and a wide range of designs. Highly recommend for any renovation project.', role: 'Interior Designer' },
  { id: 3, name: 'Robert Wilson', text: 'The wood-look tiles are so realistic, even our guests can\'t tell the difference!', role: 'Architect' }
];


export const catalogs = [
  {
    id: 1,
    title: "Premium Floor Collection 2026",
    description: "Explore our latest oversized slabs and high-gloss finishes perfect for expansive living areas.",
    image: modernLivingImg,
    link: "#"
  },
  {
    id: 2,
    title: "Architectural Wall Series",
    description: "Discover textured, 3D, and acoustic wall tiles that bring depth to any commercial space.",
    image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800&auto=format&fit=crop",
    link: "#"
  },
  {
    id: 3,
    title: "Elegant Kitchen & Bath",
    description: "A curated selection of moisture-resistant ceramics, mosaics, and easy-to-clean surfaces.",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop",
    link: "#"
  }
];
