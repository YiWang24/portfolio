import { StackGroup } from "@/types/portfolio";

interface StackSectionProps {
  stack: StackGroup[];
}

export default function StackSection({ stack }: StackSectionProps) {
  return (
    <div className="space-y-8">
      {stack.map((group, index) => (
        <div key={index}>
          {/* Category Header */}
          <h3 className="font-mono text-sm uppercase text-white/40 mb-4">
            {group.category}
          </h3>

          {/* Technology Items */}
          <div className="flex flex-wrap gap-3">
            {group.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="px-3 py-1.5 bg-white/5 text-white/70 text-sm rounded hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
