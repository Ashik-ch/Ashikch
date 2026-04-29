import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { portfolioData } from "../data/portfolioData";

/* ---------------- IMAGES ---------------- */
const defaultImages = [
  "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
];

function TiltCard({
  children,
  className = "",
  tilt = 14,
  scale = 1.03,
}) {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    transform:
      "perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  });

  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rx = (py - 0.5) * tilt * -1;
      const ry = (px - 0.5) * tilt;

      setStyle({
        transform: `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`,
        transition: "transform .12s ease-out",
      });

      setSpot({
        x: px * 100,
        y: py * 100,
        opacity: 1,
      });
    },
    [tilt, scale]
  );

  const reset = () => {
    setStyle({
      transform:
        "perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      transition: "transform .35s ease-out",
    });

    setSpot((s) => ({ ...s, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`relative will-change-transform ${className}`}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
    >
      {children}

      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          opacity: spot.opacity,
          transition: "opacity .25s",
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,.18), transparent 35%)`,
        }}
      />
    </div>
  );
}

export default function Projects() {
  const projects = portfolioData.projects;

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
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <TiltCard className="group h-full">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    {/* Image */}
                    <img
                      src={defaultImages[index % defaultImages.length]}
                      alt={project.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-7">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 4)
                          .map((tech, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-white/15 text-white/90 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-xl"
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
                          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-white  transition hover:scale-105"
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
        </AnimatePresence>
      </div>
    </section>
  );
}