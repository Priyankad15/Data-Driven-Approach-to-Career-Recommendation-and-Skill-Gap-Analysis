import aiRobotImg from "@/assets/ai-robot.png";

const AIRobot = ({ size = "lg", animate = true }: { size?: "sm" | "md" | "lg"; animate?: boolean }) => {
  const s = size === "lg" ? 180 : size === "md" ? 80 : 50;
  return (
    <div className={animate ? "animate-float" : ""} style={{ width: s, height: s }}>
      <img src={aiRobotImg} alt="AI Mentor Robot" width={s} height={s} className="w-full h-full object-contain" />
    </div>
  );
};

export default AIRobot;

