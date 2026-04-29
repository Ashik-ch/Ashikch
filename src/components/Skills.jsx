import { motion } from "framer-motion";
import { Sparkles, Cpu, Wrench, Brain } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

/* ================= ANIMATION ================= */
const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/* ================= CHIP SECTION ================= */
function SkillSection({ icon, title, skills, glow }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative rounded-[34px] border border-white/60 bg-white/80 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
    >
      {/* Glow */}
      <div className={`absolute -top-8 right-0 h-28 w-28 rounded-full blur-3xl ${glow}`} />

      {/* Header */}
      <div className="relative mb-6 flex items-center gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            Expertise powering premium products
          </p>
        </div>
      </div>

      {/* Skills */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-wrap gap-3"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            variants={fadeUp}
            whileHover={{
              y: -6,
              scale: 1.04,
            }}
            className="group relative cursor-default overflow-hidden rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-fuchsia-400/0 opacity-0 transition group-hover:opacity-100" />

            <span className="relative z-10">{skill}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function Skills() {
  const { technical, tools, soft_skills } = portfolioData.skills;

  return (
    <section id="skills" className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-32"    >
      <div className="absolute left-0 top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.75 }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <Sparkles size={14} className="text-cyan-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-600">
              Core Strengths
            </span>
          </div>

          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Technical{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Arsenal
            </span>
          </h2>


          <p className="mt-5 text-lg text-gray-500">
            Building premium digital products with code, systems, and refined
            user experience.
          </p>
        </motion.div>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Tall Card */}
          <div className="lg:col-span-7 space-y-8">
            <SkillSection
              icon={<Cpu size={22} className="text-cyan-500" />}
              title="Technical Skills"
              skills={technical}
              glow="bg-cyan-400/20"
            />

            <SkillSection
              icon={<Wrench size={22} className="text-fuchsia-500" />}
              title="Tools & Platforms"
              skills={tools}
              glow="bg-fuchsia-400/20"
            />
          </div>

          {/* Right Premium Card */}
          <div className="lg:col-span-5">
            <SkillSection
              icon={<Brain size={22} className="text-blue-500" />}
              title="Soft Skills"
              skills={soft_skills}
              glow="bg-blue-400/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}