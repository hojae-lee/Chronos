import Link from "next/link";
import Iridescence from "@/components/react-bits/Iridescence";
import BlurText from "@/components/react-bits/BlurText";
import RotatingText from "@/components/react-bits/RotatingText";
import ShinyText from "@/components/react-bits/ShinyText";
import AIChatDemo from "./AIChatDemo";

const HERO_COLOR: [number, number, number] = [0.22, 0.88, 0.6];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden flex flex-col min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #FAF9FE 0%, #EDE8FA 50%, #DAF0E8 100%)",
      }}
    >
      <div className="absolute inset-0 z-0">
        <Iridescence
          color={HERO_COLOR}
          speed={0.45}
          amplitude={0.1}
          mouseReact
        />
      </div>

      <div className="relative z-10 flex-1 flex items-center px-6 py-20">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="bg-background-base/80 backdrop-blur-md rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-lg border border-border-subtle/50">
            <BlurText
              text="모든 일정을 AI가 짜줍니다."
              animateBy="words"
              direction="bottom"
              delay={120}
              stepDuration={0.4}
              className="text-4xl md:text-5xl font-extrabold text-text-primary leading-tight tracking-tight"
            />

            <p className="text-lg text-text-secondary leading-relaxed flex flex-wrap items-center gap-1.5">
              AI에게 말을 걸면{" "}
              <RotatingText
                texts={["말 한 마디로", "AI 재배치로", "3D 회고로"]}
                splitBy="words"
                rotationInterval={2200}
                mainClassName="inline-flex text-brand-primary font-bold overflow-hidden"
                elementLevelClassName="text-brand-primary"
              />{" "}
              일정을 완전히 제어합니다.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/calendar"
                className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-bold text-base px-8 py-3.5 rounded-2xl transition-colors duration-150 active:scale-[0.98] w-fit shadow-md"
              >
                지금 바로 시작 <span aria-hidden>→</span>
              </Link>
              <ShinyText
                text="로그인 없이 바로 사용 가능"
                color="#6B6582"
                shineColor="#2ECC8F"
                speed={3}
                spread={90}
                className="text-sm font-medium pl-1"
              />
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <AIChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
