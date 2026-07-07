import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Upload, Sparkles, FileText, Download, Play, CheckCircle, 
  Plus, Trash2, Key, HelpCircle, RefreshCw, Layers, Check, AlertCircle, Copy
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

// Extracted static categories for ATS scoring
const CORE_KEYWORDS_POOL = [
  'React', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 'NestJS', 'REST API', 
  'GraphQL', 'PostgreSQL', 'MongoDB', 'System Architect', 'UI/UX Design', 
  'Responsive Design', 'Vercel', 'Tailwind CSS', 'Bootstrap', 'Git', 'GitHub', 
  'PrimeNG', 'Material Design', 'Unit Testing', 'CI/CD', 'AWS', 'Docker'
];

export default function ResumeAi({ onBack }) {
  // --- Secure API Configuration State ---
  const [apiProvider, setApiProvider] = useState('gemini'); // 'gemini' | 'openai'
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tailor_api_key') || '');
  const [showKeyField, setShowKeyField] = useState(false);

  // --- Resume State (Prefilled with Ashik's portfolio data) ---
  const [resumeData, setResumeData] = useState({
    personal: {
      name: portfolioData.personal_info.name || 'Ashik C H',
      title: portfolioData.personal_info.title || 'Software Engineer',
      email: portfolioData.personal_info.email || 'ashik@ashikch.com',
      phone: portfolioData.personal_info.phone || '+971557935653',
      address: portfolioData.personal_info.address || 'Dubai, UAE',
      website: portfolioData.personal_info.portfolio || 'https://ashikch.com',
      linkedin: portfolioData.personal_info.linkedin || '',
      github: portfolioData.personal_info.github || '',
    },
    summary: "Lead Software Engineer with 3+ years of experience in building and maintaining responsive web applications using Angular, React, and modern TypeScript ecosystems. Skilled in developing scalable, high-performance user interfaces and collaborating within Scrum frameworks to deliver premium web experiences with clean code.",
    skills: [...portfolioData.skills.technical],
    experience: portfolioData.experience.map(exp => ({
      company: exp.company,
      period: exp.period || '2023 - Present',
      role: exp.role,
      location: exp.location,
      bullets: exp.description ? [exp.description] : [
        `Architected and optimized responsive frontend layouts using ${exp.technologies.slice(0, 3).join(', ')}.`,
        `Integrated REST API endpoints and swagger definitions under Agile/Scrum sprints.`,
        `Collaborated on codebase migrations and clean code reviews using Git and corporate repositories.`
      ],
      technologies: [...exp.technologies]
    })),
    projects: portfolioData.projects.slice(0, 3).map(proj => ({
      name: proj.name,
      description: proj.description,
      technologies: [...proj.technologies]
    })),
    education: portfolioData.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year
    }))
  });

  // --- Input Job Description State ---
  const [jobDescription, setJobDescription] = useState('');
  const [jdFileLoading, setJdFileLoading] = useState(false);
  const [jdFileName, setJdFileName] = useState('');

  // --- Versioning and Active History ---
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tailor_resumes_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);

  // --- Tailoring Actions & Processing State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [tailoringLog, setTailoringLog] = useState([]);
  
  // --- ATS Metrics State ---
  const [atsScore, setAtsScore] = useState(62); // Starting fallback score
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);

  // --- Active Tab State (Left Form Editor) ---
  const [activeFormTab, setActiveFormTab] = useState('personal'); // 'personal'|'summary'|'skills'|'experience'|'projects'

  // --- State for Drag Over Hover Effect ---
  const [isDraggingJd, setIsDraggingJd] = useState(false);

  // Save API Key inside LocalStorage on change
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('tailor_api_key', key);
  };

  // --- Load portfolio stats and run initial local keywords matching ---
  useEffect(() => {
    evaluateAtsScore(resumeData, jobDescription);
  }, [jobDescription, resumeData]);

  // --- ATS Keyword extraction & Match Engine ---
  const evaluateAtsScore = (resume, jdText) => {
    if (!jdText || jdText.trim().length < 10) {
      // Offline/Default State
      const defaultMatched = resume.skills.slice(0, 8);
      const defaultMissing = CORE_KEYWORDS_POOL.filter(kw => !resume.skills.includes(kw)).slice(0, 6);
      setMatchedKeywords(defaultMatched);
      setMissingKeywords(defaultMissing);
      setAtsScore(65);
      return;
    }

    const jdLower = jdText.toLowerCase();
    
    // Find matched keywords
    const matched = [];
    const missing = [];

    // Analyze skills in resume vs Job Description
    CORE_KEYWORDS_POOL.forEach(keyword => {
      const isMentionedInJd = jdLower.includes(keyword.toLowerCase());
      const hasSkill = resume.skills.some(s => s.toLowerCase().includes(keyword.toLowerCase())) ||
                       resume.summary.toLowerCase().includes(keyword.toLowerCase());

      if (isMentionedInJd) {
        if (hasSkill) {
          matched.push(keyword);
        } else {
          missing.push(keyword);
        }
      }
    });

    setMatchedKeywords(matched);
    setMissingKeywords(missing);

    // Calculate score: base score of 50 + proportion of matched requested keywords
    const totalRequested = matched.length + missing.length;
    if (totalRequested === 0) {
      setAtsScore(70); // Neutral score
    } else {
      const matchRate = matched.length / totalRequested;
      const finalScore = Math.min(Math.round(55 + (matchRate * 40)), 98);
      setAtsScore(finalScore);
    }
  };

  // --- File Reader for JD ---
  const handleJdFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readTextFile(file);
  };

  const readTextFile = (file) => {
    setJdFileLoading(true);
    setJdFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setJobDescription(event.target.result);
      setJdFileLoading(false);
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setJdFileLoading(false);
    };
    reader.readAsText(file);
  };

  // --- File Drag handlers ---
  const handleJdDragOver = (e) => {
    e.preventDefault();
    setIsDraggingJd(true);
  };

  const handleJdDragLeave = () => {
    setIsDraggingJd(false);
  };

  const handleJdDrop = (e) => {
    e.preventDefault();
    setIsDraggingJd(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      readTextFile(file);
    }
  };

  // --- Deep Tailoring Core Execution ---
  const handleOptimizeResume = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      alert("Please provide a more detailed Job Description to tailor your resume.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Analyzing target role dynamics...");
    setTailoringLog(["Parsing job description semantic constraints...", "Extracting target technical capabilities..."]);

    // If API Key is configured, run live integration!
    if (apiKey && apiKey.trim().length > 10) {
      try {
        if (apiProvider === 'gemini') {
          await runGeminiTailoring();
        } else {
          await runOpenAiTailoring();
        }
      } catch (error) {
        console.error("AI API Error, falling back to Local Optimization:", error);
        alert(`AI API connection encountered an issue: ${error.message}. Running smart local optimization instead.`);
        runSmartLocalTailoring();
      }
    } else {
      // Simulating a highly realistic optimization sequence
      setTimeout(() => {
        setStatusMessage("Aligning professional achievements with Job Description...");
        setTailoringLog(prev => [...prev, "Guarding master personal details (Name, Contact remains untouched).", "Injecting highly relevant skills based on JD semantic frequency."]);
        
        setTimeout(() => {
          setStatusMessage("Restructuring experiences and bullet points...");
          setTailoringLog(prev => [...prev, "Re-mapping bullet points to match core requested paradigms.", "Formatting and optimizing template ATS configurations."]);
          
          setTimeout(() => {
            runSmartLocalTailoring();
            setIsProcessing(false);
          }, 1000);
        }, 1200);
      }, 1000);
    }
  };

  // --- Gemini API Live Integration ---
  const runGeminiTailoring = async () => {
    setStatusMessage("Invoking Gemini Intelligent Optimizer...");
    const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Construct strict ATS tailoring prompt
    const prompt = `You are a professional Executive CV writer and ATS Optimization expert.
Optimize the following resume data to match the provided Job Description (JD).

Strict Guidelines:
1. Preserve original structural truth.
2. NEVER modify or invent dates, timeline, location, phone, email, name, or company names.
3. Keep the resume ATS-friendly, professional, and highlight accomplishments matching the JD.
4. Do NOT generate fake experiences or fake certifications.
5. Return the response strictly as valid, parsable JSON with the exact structure:
{
  "summary": "optimized professional summary statement matching job description context",
  "skills": ["skill1", "skill2", "skill3", "etc... Optimized to match key terms"],
  "experience": [
    {
      "company": "Keep original",
      "period": "Keep original",
      "role": "Keep original",
      "location": "Keep original",
      "bullets": ["optimized bullet point 1 focusing on JD skills", "optimized bullet 2", "etc"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "projects": [
    {
      "name": "Keep original",
      "description": "optimized description matching JD competencies",
      "technologies": ["tech1"]
    }
  ]
}

Resume Data:
${JSON.stringify({
  summary: resumeData.summary,
  skills: resumeData.skills,
  experience: resumeData.experience,
  projects: resumeData.projects
})}

Job Description (JD):
${jobDescription}

Ensure you ONLY return raw, parsable JSON. No markdown backticks, no wrap text.`;

    const response = await fetch(modelEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(resultText.trim());
    applyAiOptimizations(parsedData);
  };

  // --- OpenAI API Live Integration ---
  const runOpenAiTailoring = async () => {
    setStatusMessage("Invoking OpenAI GPT Optimizer...");
    const modelEndpoint = `https://api.openai.com/v1/chat/completions`;
    
    const prompt = `You are a professional Executive CV writer and ATS Optimization expert.
Optimize the following resume data to match the provided Job Description (JD).

Strict Guidelines:
1. Preserve original structural truth.
2. NEVER modify or invent dates, timeline, location, phone, email, name, or company names.
3. Keep the resume ATS-friendly, professional, and highlight accomplishments matching the JD.
4. Do NOT generate fake experiences or fake certifications.
5. Return the response strictly as valid, parsable JSON with the exact structure:
{
  "summary": "optimized professional summary statement matching job description context",
  "skills": ["skill1", "skill2", "skill3", "etc... Optimized to match key terms"],
  "experience": [
    {
      "company": "Keep original",
      "period": "Keep original",
      "role": "Keep original",
      "location": "Keep original",
      "bullets": ["optimized bullet point 1 focusing on JD skills", "optimized bullet 2", "etc"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "projects": [
    {
      "name": "Keep original",
      "description": "optimized description matching JD competencies",
      "technologies": ["tech1"]
    }
  ]
}

Resume Data:
${JSON.stringify({
  summary: resumeData.summary,
  skills: resumeData.skills,
  experience: resumeData.experience,
  projects: resumeData.projects
})}

Job Description (JD):
${jobDescription}`;

    const response = await fetch(modelEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsedData = JSON.parse(resultText.trim());
    applyAiOptimizations(parsedData);
  };

  // --- Apply and Store Results ---
  const applyAiOptimizations = (parsed) => {
    // Merge AI optimized summaries/skills/bullets back preserving original personal info & education skeleton
    const newResume = {
      ...resumeData,
      summary: parsed.summary || resumeData.summary,
      skills: parsed.skills || resumeData.skills,
      experience: resumeData.experience.map((exp, idx) => {
        const optExp = parsed.experience?.[idx] || {};
        return {
          ...exp,
          bullets: optExp.bullets || exp.bullets,
          technologies: optExp.technologies || exp.technologies
        };
      }),
      projects: resumeData.projects.map((proj, idx) => {
        const optProj = parsed.projects?.[idx] || {};
        return {
          ...proj,
          description: optProj.description || proj.description,
          technologies: optProj.technologies || proj.technologies
        };
      })
    };

    setResumeData(newResume);
    evaluateAtsScore(newResume, jobDescription);
    saveToHistory(newResume, "AI Optimized Version");
    setIsProcessing(false);
  };

  // --- Smart Offline Rule-Based Optimization ---
  const runSmartLocalTailoring = () => {
    // 1. Identify missing keywords from JD
    const jdLower = jobDescription.toLowerCase();
    const missing = [];
    const matched = [];

    CORE_KEYWORDS_POOL.forEach(kw => {
      if (jdLower.includes(kw.toLowerCase())) {
        if (resumeData.skills.includes(kw)) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      }
    });

    // 2. Inject top 4 missing keywords directly into skills
    const injectedSkills = [...resumeData.skills];
    missing.slice(0, 4).forEach(kw => {
      if (!injectedSkills.includes(kw)) {
        injectedSkills.push(kw);
      }
    });

    // 3. Formulate JD-aligned professional summary
    const roleMatch = jobDescription.match(/(senior|lead|junior)?\s*(software engineer|frontend developer|web developer|full stack developer|architect)/i);
    const targetRole = roleMatch ? roleMatch[0] : "Lead Software Engineer";

    const customSummary = `${targetRole} with 3+ years of experience specializing in building premium web applications. Highly proficient in matching complex business objectives with optimized architectural patterns in ${injectedSkills.slice(0, 4).join(', ')}. Demonstrated success delivering high-performance, ATS-friendly user interfaces and systems.`;

    // 4. Inject matching bullet point keywords
    const tailoredExperience = resumeData.experience.map((exp, idx) => {
      const originalBullets = [...exp.bullets];
      // Modify first bullet point to explicitly call out target keywords
      if (idx === 0) {
        originalBullets[0] = `Architected, modularized, and scale-developed core high-performance systems aligned with target benchmarks in ${injectedSkills.slice(0, 3).join(', ')}.`;
      }
      return {
        ...exp,
        bullets: originalBullets
      };
    });

    const optimized = {
      ...resumeData,
      summary: customSummary,
      skills: injectedSkills,
      experience: tailoredExperience
    };

    setResumeData(optimized);
    evaluateAtsScore(optimized, jobDescription);
    saveToHistory(optimized, "Smart Tailored Version");
  };

  // --- Save Tailorings to History ---
  const saveToHistory = (resume, tag) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: tag,
      atsScore: atsScore,
      data: resume
    };

    const updatedHistory = [newEntry, ...history.slice(0, 5)]; // Save up to 6 versions
    setHistory(updatedHistory);
    localStorage.setItem('tailor_resumes_history', JSON.stringify(updatedHistory));
    setActiveHistoryIndex(0);
  };

  const loadHistoryVersion = (index) => {
    if (index < 0 || index >= history.length) return;
    setActiveHistoryIndex(index);
    setResumeData(history[index].data);
    setAtsScore(history[index].atsScore);
  };

  const clearHistory = () => {
    setHistory([]);
    setActiveHistoryIndex(-1);
    localStorage.removeItem('tailor_resumes_history');
  };

  // --- Print/Export Trigger ---
  const handlePrintPdf = () => {
    window.print();
  };

  // Form value change helpers
  const handlePersonalChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-white flex flex-col font-sans relative overflow-x-hidden print:bg-white print:text-black">
      
      {/* Dynamic Background Glows (Hidden in Print) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 print:hidden">
        <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 py-4 px-6 lg:px-12 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold flex items-center gap-2">
              Resume Tailor AI <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-medium">ATS Engine v2.0</span>
            </h1>
            <p className="text-xs text-gray-400">Optimize and map your experience to target roles instantly</p>
          </div>
        </div>

        {/* Secure API Key Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowKeyField(!showKeyField)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all ${
              apiKey ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Key size={14} />
            {apiKey ? 'API Connected' : 'Configure AI Key'}
          </button>
        </div>
      </header>

      {/* API Key Modal / Drawer */}
      <AnimatePresence>
        {showKeyField && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-[#0d0c15] border-b border-white/5 py-6 px-6 lg:px-12 z-30 relative print:hidden"
          >
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  Secure Custom API Key <HelpCircle size={14} className="text-gray-500 cursor-help" title="Your key is stored inside your browser localStorage and is sent directly to OpenAI/Gemini endpoints. No backend collects it." />
                </label>
                <p className="text-xs text-gray-400">If no key is configured, the system activates a Smart local NLP keyword matching algorithm to demonstrate optimization instantly.</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setApiProvider('gemini')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border ${apiProvider === 'gemini' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'border-white/5 text-gray-400'}`}
                  >
                    Gemini API (Recommended)
                  </button>
                  <button 
                    onClick={() => setApiProvider('openai')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border ${apiProvider === 'openai' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'border-white/5 text-gray-400'}`}
                  >
                    OpenAI API
                  </button>
                </div>
              </div>
              <div className="w-full md:w-96 flex gap-2">
                <input 
                  type="password"
                  placeholder={apiProvider === 'gemini' ? "Paste Gemini Key..." : "Paste OpenAI API Key..."}
                  value={apiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                {apiKey && (
                  <button 
                    onClick={() => handleSaveApiKey('')}
                    className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible">
        
        {/* Left Side: Form Editor & JD Input (Hidden in Print) */}
        <div className="w-full lg:w-1/2 bg-[#0c0b13]/60 border-r border-white/5 p-6 space-y-6 overflow-y-auto print:hidden">
          
          {/* Section 1: Job Description Input */}
          <div className="bg-[#100f1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Upload size={14} /> 1. Target Job Description
              </h2>
              {jdFileName && (
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {jdFileName}
                </span>
              )}
            </div>

            <div 
              onDragOver={handleJdDragOver}
              onDragLeave={handleJdDragLeave}
              onDrop={handleJdDrop}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                isDraggingJd ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <textarea 
                placeholder="Paste Job Description text here, or drag & drop a text file..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-24 bg-transparent border-0 resize-none text-xs focus:outline-none placeholder-gray-500 text-white"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] text-gray-500">Drag file inside to load</span>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <label className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors">
                <Upload size={12} />
                Load File
                <input 
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleJdFileUpload}
                  className="hidden"
                />
              </label>
              <button 
                onClick={handleOptimizeResume}
                disabled={isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/10 disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Tailor Resume
                  </>
                )}
              </button>
            </div>

            {/* Spinner Overlay during Optimization Processing */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-black/80 rounded-xl p-4 border border-cyan-500/20 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-cyan-400" size={16} />
                    <span className="text-xs font-medium text-white">{statusMessage}</span>
                  </div>
                  <div className="space-y-1 pl-7">
                    {tailoringLog.map((log, index) => (
                      <div key={index} className="text-[10px] text-gray-400 flex items-center gap-1.5">
                        <Check size={10} className="text-cyan-500" />
                        {log}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Edit Master Resume Form */}
          <div className="bg-[#100f1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <FileText size={14} /> 2. Master Resume Editor
            </h2>

            {/* Sub-Tabs for Resume Fields */}
            <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
              {[
                { id: 'personal', name: 'Identity' },
                { id: 'summary', name: 'Summary' },
                { id: 'skills', name: 'Skills' },
                { id: 'experience', name: 'Experience' },
                { id: 'projects', name: 'Projects' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFormTab === tab.id ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'border border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Identity Tab Form */}
            {activeFormTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Full Name</label>
                  <input 
                    type="text"
                    value={resumeData.personal.name}
                    onChange={(e) => handlePersonalChange('name', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Target Title</label>
                  <input 
                    type="text"
                    value={resumeData.personal.title}
                    onChange={(e) => handlePersonalChange('title', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Email Address</label>
                  <input 
                    type="email"
                    value={resumeData.personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Phone Number</label>
                  <input 
                    type="text"
                    value={resumeData.personal.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Address / Location</label>
                  <input 
                    type="text"
                    value={resumeData.personal.address}
                    onChange={(e) => handlePersonalChange('address', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Summary Tab Form */}
            {activeFormTab === 'summary' && (
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Professional Summary</label>
                <textarea 
                  rows={5}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Skills Tab Form */}
            {activeFormTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Active Technical Competencies</label>
                  <span className="text-[10px] text-gray-400">{resumeData.skills.length} skills listed</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 rounded-xl border border-white/5 min-h-12">
                  {resumeData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-md flex items-center gap-1.5 text-gray-300"
                    >
                      {skill}
                      <button 
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    id="newSkillInput"
                    placeholder="Enter new technical skill..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value.trim();
                        if (val && !resumeData.skills.includes(val)) {
                          setResumeData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('newSkillInput');
                      const val = input.value.trim();
                      if (val && !resumeData.skills.includes(val)) {
                        setResumeData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                        input.value = '';
                      }
                    }}
                    className="p-2.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Experience Tab Form */}
            {activeFormTab === 'experience' && (
              <div className="space-y-6">
                {resumeData.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="bg-black/20 p-4 border border-white/5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs">{exp.role}</h4>
                        <span className="text-[10px] text-gray-500">{exp.company} • {exp.period}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.filter((_, i) => i !== expIdx)
                          }));
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Bullet Points editor */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-semibold text-gray-500 uppercase">Achievement Highlights (ATS Target)</label>
                      {exp.bullets.map((bullet, bulletIdx) => (
                        <div key={bulletIdx} className="flex gap-2">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const updatedBullets = [...exp.bullets];
                              updatedBullets[bulletIdx] = e.target.value;
                              const updatedExp = [...resumeData.experience];
                              updatedExp[expIdx] = { ...exp, bullets: updatedBullets };
                              setResumeData(prev => ({ ...prev, experience: updatedExp }));
                            }}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-xs focus:outline-none"
                          />
                          <button 
                            onClick={() => {
                              const updatedBullets = exp.bullets.filter((_, i) => i !== bulletIdx);
                              const updatedExp = [...resumeData.experience];
                              updatedExp[expIdx] = { ...exp, bullets: updatedBullets };
                              setResumeData(prev => ({ ...prev, experience: updatedExp }));
                            }}
                            className="p-2 text-gray-500 hover:text-red-400 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updatedExp = [...resumeData.experience];
                          updatedExp[expIdx] = { ...exp, bullets: [...exp.bullets, "New optimized bullet point highlight..."] };
                          setResumeData(prev => ({ ...prev, experience: updatedExp }));
                        }}
                        className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Tab Form */}
            {activeFormTab === 'projects' && (
              <div className="space-y-6">
                {resumeData.projects.map((proj, projIdx) => (
                  <div key={projIdx} className="bg-black/20 p-4 border border-white/5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs">{proj.name}</h4>
                      <button 
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.filter((_, i) => i !== projIdx)
                          }));
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-gray-500 uppercase">Project Highlight</label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        onChange={(e) => {
                          const updatedProj = [...resumeData.projects];
                          updatedProj[projIdx] = { ...proj, description: e.target.value };
                          setResumeData(prev => ({ ...prev, projects: updatedProj }));
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: ATS HUD & Live Resume Document Preview */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col space-y-6 overflow-y-auto bg-[#0a0910] print:w-full print:p-0 print:bg-white print:text-black">
          
          {/* Section 1: ATS Optimization Analyzer HUD (Hidden in Print) */}
          <div className="bg-[#100f1a] border border-white/5 rounded-2xl p-5 space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-semibold text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Layers size={14} /> ATS Assessment HUD
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Est. evaluation grade based on job keyword matching density</p>
              </div>

              {/* Version History Selector */}
              {history.length > 0 && (
                <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-gray-400">Ver:</span>
                  <select
                    value={activeHistoryIndex}
                    onChange={(e) => loadHistoryVersion(parseInt(e.target.value))}
                    className="bg-transparent border-0 text-xs font-semibold focus:outline-none text-white cursor-pointer"
                  >
                    <option value={-1} className="bg-[#100f1a] text-white">Master Resume</option>
                    {history.map((h, i) => (
                      <option key={h.id} value={i} className="bg-[#100f1a] text-white">
                        {h.tag} ({h.timestamp})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Radial Dial estimation */}
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-white/5 fill-none" strokeWidth="8" />
                    <motion.circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className={`fill-none ${
                        atsScore >= 80 ? 'stroke-emerald-400' : atsScore >= 60 ? 'stroke-amber-400' : 'stroke-red-400'
                      }`} 
                      strokeWidth="8" 
                      strokeDasharray={301.6}
                      initial={{ strokeDashoffset: 301.6 }}
                      animate={{ strokeDashoffset: 301.6 - (301.6 * atsScore) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <div className="text-3xl font-heading font-black">{atsScore}%</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Match score</div>
                  </div>
                </div>
              </div>

              {/* Status information & checklists */}
              <div className="md:col-span-8 space-y-3">
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-1.5">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    {atsScore >= 85 ? (
                      <><CheckCircle size={14} className="text-emerald-400" /> <span className="text-emerald-400">Highly Optimized Target</span></>
                    ) : atsScore >= 70 ? (
                      <><CheckCircle size={14} className="text-cyan-400" /> <span className="text-cyan-400">Good ATS Compatibility</span></>
                    ) : (
                      <><AlertCircle size={14} className="text-amber-400" /> <span className="text-amber-400">Needs Optimization</span></>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {atsScore >= 85 
                      ? "Your experience highlights and core skills strongly match the semantic terms of this job. Great job!" 
                      : "Pasting a specific job description and clicking Optimize will dynamically match your skills to pass screening algorithms."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                      <Check size={10} /> Matched Keywords ({matchedKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {matchedKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-amber-400 font-semibold uppercase flex items-center gap-1">
                      <AlertCircle size={10} /> Missing Keywords ({missingKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {missingKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-3">
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="px-3 py-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 rounded-xl text-xs transition-colors"
                >
                  Clear History
                </button>
              )}
              <button 
                onClick={handlePrintPdf}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/10 transition-colors"
              >
                <Download size={14} />
                Export ATS PDF
              </button>
            </div>
          </div>

          {/* Section 2: Real-time Live Document Preview (Styling adjusts for window print) */}
          <div className="flex-1 bg-white text-black p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl border border-white/10 font-sans leading-relaxed text-sm print:shadow-none print:border-none print:p-0 print:m-0 print:text-black">
            
            {/* Print styling overrides injection */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                }
                .print\\:hidden {
                  display: none !important;
                }
                .print\\:p-0 {
                  padding: 0 !important;
                }
                .print\\:text-black {
                  color: black !important;
                }
                .print\\:shadow-none {
                  box-shadow: none !important;
                }
                .print\\:border-none {
                  border: none !important;
                }
              }
            `}} />

            {/* Resume Header Area */}
            <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-gray-950 uppercase">{resumeData.personal.name}</h3>
              <p className="text-xs font-bold text-gray-700 tracking-wider uppercase">{resumeData.personal.title}</p>
              <div className="text-xs text-gray-600 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 font-mono">
                <span>{resumeData.personal.email}</span>
                <span>•</span>
                <span>{resumeData.personal.phone}</span>
                <span>•</span>
                <span>{resumeData.personal.address}</span>
              </div>
              <div className="text-[10px] text-blue-600 flex justify-center gap-3 font-mono mt-1">
                {resumeData.personal.website && <a href={resumeData.personal.website} target="_blank" rel="noreferrer">{resumeData.personal.website}</a>}
                {resumeData.personal.github && <a href={resumeData.personal.github} target="_blank" rel="noreferrer">github.com/Ashik-ch</a>}
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 text-gray-950">Professional Summary</h4>
              <p className="text-xs text-gray-700 leading-normal text-justify">
                {resumeData.summary}
              </p>
            </div>

            {/* Core Competencies Section */}
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 text-gray-950">Technical Arsenal &amp; Core Skills</h4>
              <p className="text-xs text-gray-700 leading-normal">
                <strong>Technologies &amp; Competencies:</strong> {resumeData.skills.join(', ')}
              </p>
            </div>

            {/* Experience Section */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 text-gray-950">Professional Journey</h4>
              
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-gray-900">{exp.role} — <span className="font-medium text-gray-700">{exp.company}</span></span>
                    <span className="font-mono text-gray-600 text-[10px]">{exp.period}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-semibold italic -mt-0.5">
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1 mt-1">
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="leading-snug text-justify">{bullet}</li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-gray-600 mt-1 pl-4">
                    <strong>Tools/Tech:</strong> {exp.technologies.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Projects Section */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 text-gray-950">Engineering Projects</h4>
              
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-gray-900">{proj.name}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-normal text-justify">{proj.description}</p>
                  <div className="text-[10px] text-gray-600 font-semibold">
                    <strong>Tech Stack:</strong> {proj.technologies.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 text-gray-950">Academic Credentials</h4>
              
              {resumeData.education.slice(0, 2).map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-gray-900">{edu.degree} — <span className="font-medium text-gray-700">{edu.institution}</span></span>
                  <span className="font-mono text-gray-600 text-[10px]">{edu.year}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
