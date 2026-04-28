import TruckScene from '../../../shared/components/3d/truck/TruckScene';

interface LoadCanvas3DProps {
    sceneBackground: string;
    setSceneBackground: (color: string) => void;
}

export default function LoadCanvas3D({ sceneBackground, setSceneBackground }: LoadCanvas3DProps) {
    const bgColors = ['#0d0d0d', '#ffffff', '#333333'];

    return (
        <section className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
            {/* Scene Background Toggle */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                {bgColors.map((color) => (
                    <button
                        key={color}
                        onClick={() => setSceneBackground(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all active:scale-95 shadow-lg ${sceneBackground === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white/20 hover:border-white/40'}`}
                        style={{ backgroundColor: color }}
                        title={`${color === '#0d0d0d' ? 'Black' : color === '#ffffff' ? 'White' : 'Grey'} Background`}
                    />
                ))}
            </div>

            <TruckScene />

            {/* Legend */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 px-5 py-2.5 bg-white/10 dark:bg-[#111111]/90 backdrop-blur-xl rounded-full shadow-lg border border-white/10">
                {[
                    { color: 'bg-[#FF7A00] border-[#FF7A00]', label: 'Block A (Egg)' },
                    { color: 'bg-blue-500 border-blue-500', label: 'Block B (Chicken)' },
                    { color: 'bg-white/10 border-white/20', label: 'Empty Slot' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm border ${item.color}`}></div>
                        <span className="text-[9px] font-bold text-white/70 tracking-tighter uppercase">{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}