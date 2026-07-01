import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Share2, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { blogPosts } from '../data/mockData';

const BlogDetails = () => {
  const { id } = useParams();
  const { data: post, isLoading: loading } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/blogs/${id}`);
        if (res.data.blog) {
          return res.data.blog;
        }
      } catch (error) {
              }
      
      // Fallback to mock post
      const mockPost = blogPosts.find(p => p.id === id);
      if (mockPost) {
        return {
          _id: mockPost.id,
          slug: mockPost.id,
          title: mockPost.title,
          content: mockPost.content || mockPost.excerpt,
          image: mockPost.image,
          createdAt: mockPost.date
        };
      }
      return null;
    },
    enabled: !!id,
  });

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beige-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-40 pb-24 text-center min-h-screen">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <Link to="/blog" className="text-beige-600 hover:underline mt-4 block">Back to blog</Link>
      </div>
    );
  }

  // Helper to safely format dates
  const formatISO = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.image || 'https://via.placeholder.com/1200x800?text=No+Image'],
    "datePublished": formatISO(post.createdAt),
    "dateModified": formatISO(post.updatedAt || post.createdAt),
    "author": [{
      "@type": "Person",
      "name": "Admin Author"
    }]
  };

  const blogExcerpt = post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'Flais Granito Blog article';

  return (
    <div className="pt-36 min-h-screen bg-white">
      <SEO 
        title={post.title}
        description={blogExcerpt}
        keywords={`flais granito blog, tile design trends, ${post.title}`}
        image={post.image}
        schema={blogSchema}
      />
      {/* Article Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img loading="lazy" src={post.image || 'https://via.placeholder.com/1200x800?text=No+Image'} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container-custom relative z-10 text-center text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-4 text-sm font-medium opacity-80 text-white"
          >
            <span>Design Trends</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold max-w-4xl mx-auto leading-tight"
            style={{ color: post.textColor || '#ffffff' }}
          >
            {post.title}
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container-custom max-w-4xl">
          <div className="flex justify-between items-center mb-12 border-b border-zinc-100 pb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-beige-100 flex items-center justify-center font-bold text-beige-700">
                A
              </div>
              <div>
                <p className="font-bold text-zinc-900">Admin Author</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Industry Expert</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
                <Share2 size={18} className="text-zinc-500" />
              </button>
              <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
                <MessageSquare size={18} className="text-zinc-500" />
              </button>
            </div>
          </div>

          <div 
            className="prose prose-lg prose-zinc max-w-none text-zinc-600 leading-relaxed space-y-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-20 pt-12 border-t border-zinc-100 flex justify-between items-center">
            <Link to="/blog" className="inline-flex items-center font-bold text-zinc-900 hover:text-beige-600 transition-colors">
              <ArrowLeft size={18} className="mr-2" /> Back to All Posts
            </Link>
            <div className="flex items-center space-x-4 cursor-pointer">
              <span className="text-sm font-medium text-zinc-400">Next Post</span>
              <ArrowLeft size={18} className="rotate-180" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetails;
