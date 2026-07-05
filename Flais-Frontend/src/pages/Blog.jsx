import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, User } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogHeroImage, setBlogHeroImage] = useState('');
  const [blogHeroTitle, setBlogHeroTitle] = useState('News & Design Blog');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [blogsRes, homeRes] = await Promise.all([
          api.get('/blogs'),
          api.get('/home'),
        ]);
        setBlogs(blogsRes.data.blogs || []);
        const homeTexts = homeRes.data?.home?.homeTexts || {};
        setBlogHeroTitle(homeTexts.blogTitle || 'News & Design Blog');
        setBlogHeroImage(homeTexts.blogHeroImage || '');
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Latest Trends & Design Blogs"
        description="Stay updated with the latest trends in interior design, vitrified tile selection guides, tile installation tips, and home decor inspiration from FLAIS GRANITO."
        keywords="tile design blog, home decor trends, interior design tips, tile installation guide, flais granito news"
      />
      <section className="relative h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {blogHeroImage ? (
            <img
              loading="lazy"
              src={getOptimizedImageUrl(blogHeroImage, 1600)}
              alt={blogHeroTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(180deg,_#f8f5f0_0%,_#e9dfcf_100%)]" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 sm:mt-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white uppercase tracking-wider mb-6">
            {blogHeroTitle}
          </h1>
          <div className="h-1 w-20 bg-beige-600 mx-auto mb-6"></div>
          <p className="text-lg text-white/90 font-light max-w-2xl mx-auto">
            Stay updated with the latest trends in interior design, tile maintenance, and company news.
          </p>
        </div>
      </section>

      <section className="pt-20 pb-4 relative z-20 -translate-y-16">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beige-600"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {blogs.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-zinc-100 transform-gpu"
                >
                  <Link to={`/blog/${post.slug}`} className="block h-64 overflow-hidden relative transform-gpu">
                    <img 
                      src={getOptimizedImageUrl(post.image || 'https://via.placeholder.com/600x400?text=No+Image', 600)} 
                      alt={post.title} 
                      loading="lazy" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 img-reveal" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-zinc-900 border border-zinc-100">
                      Blog
                    </div>
                  </Link>
                  <div className="p-8 space-y-4 flex-grow flex flex-col">
                    <div className="flex items-center text-xs text-zinc-400 space-x-4">
                      <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold leading-tight group-hover:text-beige-600">
                      <Link to={`/blog/${post.slug}`} className="hover:text-beige-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    {/* <p className="text-zinc-500 leading-relaxed flex-grow">
                      {post.content.length > 120 ? post.content.substring(0, 120).replace(/<[^>]+>/g, '') + '...' : post.content.replace(/<[^>]+>/g, '')}
                    </p> */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-bold text-zinc-900 hover:text-beige-600 transition-colors pt-4 group"
                    >
                      Read More <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
              {blogs.length === 0 && (
                <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                  <p className="text-zinc-500 text-lg">No blog posts published yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
