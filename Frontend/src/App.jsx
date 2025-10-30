import { useState } from 'react';
import { Brain, Upload, MessageSquare } from 'lucide-react';
import React from "react";
import FileUpload from "./components/FileUpload";
import ChatInterface from "./components/ChatInterface";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>📚 DocuMind AI Assistant</h1>
      <FileUpload />
      <ChatInterface />
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DocuMind</h1>
              <p className="text-sm text-gray-500">AI-Powered Knowledge Assistant</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {uploadedDocs} {uploadedDocs === 1 ? 'Document' : 'Documents'} Uploaded
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 border-b border-gray-200">
          {['upload', 'chat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'upload' ? <Upload className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              {tab === 'upload' ? 'Upload Documents' : 'Ask Questions'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' ? (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Upload Your Documents</h2>
              <p className="text-gray-500 mt-1">Supports PDF, Word, Excel, PowerPoint & Text files</p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>
        ) : (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Ask Questions</h2>
              <p className="text-gray-500 mt-1">Get instant answers from your uploaded documents</p>
            </div>
            <ChatInterface />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-100 bg-white/50 backdrop-blur-md">
        Built with <span className="text-blue-600 font-medium">FastAPI</span>,{' '}
        <span className="text-indigo-600 font-medium">React</span>, LangChain & ChromaDB
      </footer>
    </div>
  );
}

export default App;
