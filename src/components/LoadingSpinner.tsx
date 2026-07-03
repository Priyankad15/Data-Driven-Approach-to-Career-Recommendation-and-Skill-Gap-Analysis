import AIRobot from "./AIRobot";

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-bg">
    <AIRobot size="lg" />
    <div className="mt-6 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
    </div>
    <p className="mt-4 text-muted-foreground font-medium">{message}</p>
  </div>
);

export default LoadingSpinner;
