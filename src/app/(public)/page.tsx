import Link from "next/link";
import { ArrowRight, ShieldCheck, Wrench, CircleDollarSign, Clock, PhoneCall, Star, CheckCircle2, AlertTriangle } from "lucide-react";
import { MotionDiv, fadeIn, staggerContainer } from "@/components/animated/MotionDiv";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getFeaturedServices() {
  const servicesFile = path.join(process.cwd(), 'services.json');
  if (fs.existsSync(servicesFile)) {
    const data = JSON.parse(fs.readFileSync(servicesFile, 'utf-8'));
    return data.slice(0, 3); // Top 3 as featured
  }
  return [];
}

export default async function Home() {
  const featuredServices = await getFeaturedServices();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container relative z-30 px-4 mx-auto max-w-7xl">
          <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl space-y-6">
            <MotionDiv variants={fadeIn}>
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-semibold mb-2">
                Premium Auto Care in Sri Lanka
              </span>
            </MotionDiv>
            <MotionDiv variants={fadeIn}>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                Precision Tuning. <br />
                <span className="text-primary">Ultimate Performance.</span>
              </h1>
            </MotionDiv>
            <MotionDiv variants={fadeIn}>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                Experience unparalleled automotive repair and maintenance at PrimeTune Automotive. We combine cutting-edge tech with master mechanics to keep your vehicle running flawlessly.
              </p>
            </MotionDiv>

            <MotionDiv variants={fadeIn} className="flex flex-wrap items-center gap-4 pt-6">
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                {/* Continuous Breathing Glow */}
                <MotionDiv
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(220, 38, 38, 0.4)",
                      "0 0 30px rgba(220, 38, 38, 0.7)",
                      "0 0 15px rgba(220, 38, 38, 0.4)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-lg pointer-events-none"
                />

                <Link
                  href="/services"
                  className="relative flex items-center justify-center gap-3 px-8 py-3.5 font-bold text-white text-base bg-primary rounded-lg overflow-hidden group border border-red-500/50 shadow-2xl"
                >
                  {/* Internal Shine Sweep on Hover */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent to-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-in-out pointer-events-none" />

                  {/* Gradient Background Shift */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <span className="relative z-10 flex items-center gap-3">
                    Book a Service
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>
              </MotionDiv>
            </MotionDiv>
          </MotionDiv>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 -mt-20 relative z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: ShieldCheck, title: "Trusted Service", desc: "5-Star rated by our community." },
              { icon: Wrench, title: "Pro Mechanics", desc: "Expert technicians you can rely on." },
              { icon: CircleDollarSign, title: "Fair Pricing", desc: "Transparent costs, no hidden fees." },
              { icon: Clock, title: "Fast Turnaround", desc: "Get back on the road quicker." }
            ].map((item, i) => (
              <MotionDiv key={i} variants={fadeIn} className="bg-card border border-border p-8 rounded-xl flex flex-col items-center text-center group hover:border-primary transition-colors shadow-lg">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary/20 group-hover:text-primary">
                  <item.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </MotionDiv>
            ))}
          </MotionDiv>
        </div>
      </section>

      {/* Featured Services Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-2xl">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Our Expertise</h2>
              <h3 className="text-4xl font-extrabold text-foreground tracking-tight">Featured Services</h3>
            </MotionDiv>
            <Link href="/services" className="text-primary font-semibold hover:text-red-500 flex items-center gap-2 group">
              Browse All Services
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((srv: any, i: number) => (
              <MotionDiv key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="group cursor-pointer rounded-2xl overflow-hidden border border-border bg-card">
                <div className="relative h-64 overflow-hidden bg-secondary flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  {srv.image ? (
                    <img src={srv.image} alt={srv.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="text-muted-foreground text-sm z-20">No Image</span>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-foreground mb-1">{srv.name}</h4>
                  <p className="text-primary font-medium mb-4">Starting at LKR {srv.price?.toLocaleString()}</p>
                  <Link href={`/services/${srv.id}`} className="inline-flex items-center text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-20 relative overflow-hidden bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Need Urgent Help?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Breakdowns wait for no one. If you are stuck on the road or need immediate diagnosis, tap below to contact our fast-response support line.
            </p>
            <a href="tel:+94775056573" className="bg-primary hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95">
              <PhoneCall className="w-6 h-6" />
              Call 077 505 6573
            </a>
          </MotionDiv>
        </div>
      </section>

      {/* Why Choose Us & Garage Overview */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="space-y-6">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase">Our Commitment</h2>
              <h3 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Not just mechanics. <br /> Automotive perfectionists.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                At PrimeTune, we don't just fix cars; we restore confidence. Our state-of-the-art facility in Ganethanna is equipped with the latest diagnostic tools and highly trained specialists dedicated to your safety.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Over 10 years of combined mechanics experience.",
                  "Using exclusively premium parts and lubricants.",
                  "State-of-the-art diagnostic and scanning equipment.",
                  "A comfortable waiting area with refreshments."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </MotionDiv>
            <MotionDiv
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="relative"
            >
              <div className="absolute inset-x-0 -bottom-10 h-3/4 bg-primary/30 blur-[80px] rounded-full scale-110 z-0" />
              <MotionDiv
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img
                  src="https://lh3.googleusercontent.com/gps-cs-s/AHVAwerIfumCcYbUh1W-FGzoKwDU9LdGNPSyJt5kltyOsccN_ZBKNzQuyfaxLczxeM0B_AnINXOFooZLlX_RvufZB0xtZ10YokNRu2sH_ecNbUaytilzLX5Kd3WM12ta34iTs8cjR8Fh-S54RkM=s1360-w1360-h1020-rw"
                  alt="Garage overview"
                  className="rounded-2xl border border-border/50 shadow-[0_0_40px_rgba(220,38,38,0.15)] object-cover aspect-[4/3] w-full"
                  referrerPolicy="no-referrer"
                />
              </MotionDiv>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1 text-[#FABB05]">
                <Star className="w-8 h-8 fill-current" />
                <Star className="w-8 h-8 fill-current" />
                <Star className="w-8 h-8 fill-current" />
                <Star className="w-8 h-8 fill-current" />
                <Star className="w-8 h-8 fill-current" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Loved by Drivers</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              We proudly maintain a 5.0 Rating based on real experiences from our local community.
            </p>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                text: "Professional and knowledgeable staff. Fair pricing with no hidden charges. Friendly, reliable customer support — exactly what you want from a workshop!",
                author: "Mohamed Shakir",
              },
              {
                text: "My check engine light came on suddenly. They quickly found the issue and fixed it using the best specialized tools. I was impressed by their skill and great customer service.",
                author: "Murshid Baseer",
              },
              {
                text: "I brought my vehicle to this workshop and they did an outstanding job. Very thorough, very professional — I left fully satisfied and will be returning.",
                author: "Samarathunga Bandara",
              }
            ].map((review, i) => (
              <MotionDiv
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative bg-card border border-border rounded-2xl p-8 text-left flex flex-col group hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Quote mark decoration */}
                <div className="absolute top-5 right-5 text-6xl font-serif text-primary/10 leading-none select-none">&ldquo;</div>

                {/* 5 Stars */}
                <div className="flex gap-1 text-[#FABB05] mb-5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-foreground text-base leading-relaxed flex-grow italic">&ldquo;{review.text}&rdquo;</p>

                {/* Author */}
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{review.author}</div>
                    <div className="text-xs text-muted-foreground">Google Review ✓</div>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>

          <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <a
              href="https://www.google.com/search?sca_esv=6e72ffa629272dce&sxsrf=ANbL-n4bdWUAgx6wcCtSgYrpjgxUUBOZzA:1773471244734&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOT0NyOm4owix3rVVfhudxPW4FuU7UWP0W_Bk6lVd-9LEyA0puliaeDr39pXA5xl_x2YL7X-DStZnRLWOCXWVlg6rr2t8b4YhF_nwrVC__vWgdd5ytA%3D%3D&q=PrimeTune+Automotive+Reviews&sa=X&ved=2ahUKEwjukr6c556TAxXoXWwGHWmfGBIQ0bkNegQIOhAF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-primary hover:text-white border border-border hover:border-primary text-foreground font-bold px-6 py-3 rounded-full transition-all duration-300 group"
            >
              See all Google Reviews
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
