import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  MessageCircle, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Brain,
  FileText,
  Users,
  Star
} from 'lucide-react';
import FloatingParticles from '../../components/FloatingParticles';

function Home() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced language models understand and analyze your documents with human-like comprehension."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multi-Format Support",
      description: "Upload PDFs, research papers, textbooks, and more. We handle all your academic documents."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Interactive Chat",
      description: "Ask questions naturally and get instant, accurate answers from your uploaded materials."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Get answers in seconds with our optimized RAG system and real-time processing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="ml-2 text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              UniDash
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link 
              to="/login" 
              className="border-2 border-blue-300 absolute top-4 right-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl mr-4 no-underline"
              >
              Login
            </Link>
            
            <Link 
              to="/signup"
              className="border-2 border-blue-300 absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl no-underline"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Learning Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Study Experience
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload your PDF documents and chat with an AI that understands your content. 
              Get instant answers, explanations, and insights from your study materials.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup" className="border-2 border-blue-300 no-underline group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
                <span className="text-lg font-semibold">Start Learning Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              {/* <button className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                <span>Watch Demo</span>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                </div>
              </button> */}
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-16"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left ml-2 my-2">
                        <p className="text-white font-medium">AI Assistant</p>
                        <p className="text-gray-400 text-sm">Online</p>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-2xl p-4">
                      <p className="text-gray-300 text-sm">
                        "I can help you understand any concept from your uploaded documents. What would you like to know?"
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="pt-5 pb-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="ml-1 text-blue-400 font-medium">Document Upload</span>
                      </div>
                      <div className="space-y-2">
                        <div className="my-1 flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="ml-1 text-gray-300 text-sm">research_paper.pdf</span>
                          <CheckCircle className="ml-1 w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="ml-1 text-gray-300 text-sm">textbook_chapter.pdf</span>
                          <CheckCircle className="ml-1 w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                UniDash?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of learning with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Learning?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using UniDash to accelerate their learning journey.
            </p>
            <Link 
              to="/signup"
              className="border-2 border-blue-300 no-underline inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                UniDash
              </span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <span className="text-sm">© 2024 UniDash. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;