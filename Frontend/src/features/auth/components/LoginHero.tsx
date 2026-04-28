export default function LoginHero() {
    return (
        <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-[#111111]">
            <div
                className="absolute inset-0 bg-cover bg-[80%_center]"
                title="Japfa Operations"
                style={{ backgroundImage: "linear-gradient(to right, rgba(17, 17, 17, 0.8), rgba(17, 17, 17, 0.3)), url('/japfa-bg.png')" }}
            ></div>
            <div className="relative z-10 flex flex-col justify-center px-20">
                <h1 className="text-5xl font-black text-white leading-tight max-w-xl">
                    Streamlining Logistics, One Route at a Time.
                </h1>
                <div className="mt-8 flex items-center gap-4 text-primary">
                    <span className="h-1 w-12 bg-primary rounded-full"></span>
                    <p className="text-white/80 font-medium uppercase tracking-widest text-sm">Enterprise Fleet Management</p>
                </div>
            </div>
        </div>
    );
}