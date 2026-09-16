export default function BackgroundGradient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-amber-900 text-white relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px] mix-blend-overlay"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[120px] mix-blend-overlay"></div>
      
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
