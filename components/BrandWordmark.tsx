const brandPillStyles: Record<string, string> = {
  "Asian Paints":
    "bg-gradient-to-br from-[#c41e3a] to-[#8b0000] text-white tracking-tight",
  Berger: "bg-[#003da5] text-white",
  Nerolac: "bg-[#00843d] text-white",
  Dulux: "bg-[#004b87] text-white italic",
  AkzoNobel: "bg-slate-900 text-[#00a0e3]",
  Fevicol: "bg-[#e31837] text-white",
  Hafele: "bg-[#1a1a1a] text-white tracking-widest",
  Legrand: "bg-[#e30613] text-white",
  "Century Ply": "bg-[#8b4513] text-amber-50",
  Hettich: "bg-[#003087] text-white",
  Bosch: "bg-[#ea0016] text-white",
  Astral: "bg-[#f58220] text-white",
  Finolex: "bg-[#0054a6] text-white",
  Pidilite: "bg-[#c8102e] text-white",
  Godrej: "bg-[#005a9c] text-white",
  Greenply: "bg-[#006838] text-white",
  Ebco: "bg-slate-800 text-white",
  Merino: "bg-[#6b2d5b] text-white",
  "Action Tesa": "bg-[#0072bc] text-white",
  Link: "bg-slate-700 text-white",
};

const brandCardStyles: Record<string, string> = {
  "Asian Paints": "text-[#c41e3a] font-extrabold tracking-tight",
  Berger: "text-[#003da5] font-bold tracking-wide",
  Nerolac: "text-[#00843d] font-bold",
  Dulux: "text-[#004b87] font-bold italic",
  AkzoNobel: "text-[#003366] font-semibold tracking-tight",
  Fevicol: "text-[#e31837] font-extrabold",
  Hafele: "text-[#1a1a1a] font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs",
  Legrand: "text-[#e30613] font-bold uppercase tracking-wide text-[11px] sm:text-sm",
  "Century Ply": "text-[#8b4513] font-bold leading-tight",
  Hettich: "text-[#003087] font-bold",
  Bosch: "text-[#ea0016] font-bold",
  Astral: "text-[#f58220] font-bold",
  Finolex: "text-[#0054a6] font-bold",
  Pidilite: "text-[#c8102e] font-bold",
  Godrej: "text-[#005a9c] font-bold",
  Greenply: "text-[#006838] font-bold",
  Ebco: "text-slate-800 font-bold",
  Merino: "text-[#6b2d5b] font-bold",
  "Action Tesa": "text-[#0072bc] font-bold",
  Link: "text-slate-700 font-bold",
};

export default function BrandWordmark({
  name,
  compact = false,
  variant = "pill",
}: {
  name: string;
  compact?: boolean;
  variant?: "pill" | "card";
}) {
  if (variant === "card") {
    const style = brandCardStyles[name] ?? "text-slate-800 font-bold";
    return (
      <span className={`text-center text-[11px] leading-snug sm:text-sm ${style}`}>
        {name === "AkzoNobel" ? (
          <>
            Akzo<span className="text-[#00a0e3]">Nobel</span>
          </>
        ) : name === "Fevicol" ? (
          <>
            Fevi<span className="text-[#f5c518]">col</span>
          </>
        ) : (
          name
        )}
      </span>
    );
  }

  const style = brandPillStyles[name] ?? "bg-slate-100 text-slate-800";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-3 font-bold ${style} ${
        compact ? "py-1.5 text-xs" : "py-2.5 text-sm sm:text-base"
      }`}
    >
      {name}
    </span>
  );
}
