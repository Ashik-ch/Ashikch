import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowDown, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";

const INITIAL_PROJECT_COUNT = 6;

function TiltCard({ children, className = "", tilt = 14, scale = 1.03 }) {
  const bounds = useRef(null);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const zoom = useMotionValue(1);
  const rotateX = useSpring(x, { stiffness: 180, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 180, damping: 24 });
  const animatedScale = useSpring(zoom, { stiffness: 180, damping: 24 });

  const reset = () => {
    bounds.current = null;
    x.set(0);
    y.set(0);
    zoom.set(1);
  };

  return (
    <div
      className={className}
      onPointerEnter={(event) => {
        if (reducedMotion || event.pointerType !== "mouse") return;
        // Measure the stationary wrapper once, not the transformed card on every move.
        bounds.current = event.currentTarget.getBoundingClientRect();
        zoom.set(scale);
      }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== "mouse" || !bounds.current) return;
        const rect = bounds.current;
        const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        x.set((py - 0.5) * -tilt);
        y.set((px - 0.5) * tilt);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="relative h-full"
        style={{ rotateX, rotateY, scale: animatedScale, transformPerspective: 1400 }}
      >
        {children}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-radial from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const projects = portfolioData.projects;
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const firstNewProject = useRef(null);
  const visibleProjects = expanded ? projects : projects.slice(0, INITIAL_PROJECT_COUNT);
  const remainingCount = projects.length - visibleProjects.length;

  useEffect(() => {
    if (!expanded || !firstNewProject.current) return;
    firstNewProject.current.focus({ preventScroll: true });
    firstNewProject.current.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [expanded, reducedMotion]);

  return (
    <section id="projects" className="py-32 relative bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Featured {''}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Work
            </span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-10" />
        </motion.div>

        {/* Grid */}
          <div id="projects-grid" className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.name}
                ref={index === INITIAL_PROJECT_COUNT ? firstNewProject : undefined}
                tabIndex={index === INITIAL_PROJECT_COUNT ? -1 : undefined}
                className="scroll-mt-32 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-cyan-500"
                initial={reducedMotion ? false : { opacity: 0, y: 45, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: reducedMotion ? 0 : 0.75,
                  delay: reducedMotion ? 0 : (index % INITIAL_PROJECT_COUNT) * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <TiltCard className="group h-full">
                  <div className="relative flex w-full min-w-0 items-end aspect-[4/3] min-h-[340px] sm:min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-xl">
                    {/* Image */}
                    <img
                      src={project.img}
                      alt={project.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                    <div className="relative w-full flex flex-col justify-end p-7">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(project.tags ?? project.technologies)?.slice(0, 4)
                          .map((tech, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-white/15 text-white/90 bg-black/40 px-3 py-1 text-[11px] font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-white mb-2">
                        {project.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-white/70">
                        {project.description}
                      </p>

                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
                        >
                          <ExternalLink size={16} />
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        {remainingCount > 0 && (
          <div className="mt-16 flex items-center justify-center gap-6">
            <span aria-hidden="true" className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-cyan-300" />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-controls="projects-grid"
              aria-expanded={expanded}
              aria-label={`Show ${remainingCount} more projects`}
              className="group flex flex-col items-center gap-3 rounded-2xl px-4 py-2 text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200 bg-white text-cyan-600 shadow-lg shadow-cyan-500/10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                <ArrowDown aria-hidden="true" size={26} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-y-1" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Explore more</span>
              <span className="text-xs text-gray-400">{remainingCount} more projects</span>
            </button>
            <span aria-hidden="true" className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-cyan-300" />
          </div>
        )}
        <p role="status" className="sr-only">
          {expanded ? `All ${projects.length} projects are now shown.` : ''}
        </p>
      </div>
    </section>
  );
}
