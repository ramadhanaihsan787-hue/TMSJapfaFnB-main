export default function CustomerMapPreview() {
    return (
        <div className="h-48 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-800">
            <img className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBksDPjW0G30QTXgkCV1SfVmkqCx7A7onJqH5GqHT3RoNersCJtDHegmfH7XXxpbHcMnM6GUcVRLaa2xc0-sRsWeVfYMdGY5LUiU-cgdVWh1MQtZaUUXZikkvJhBJf8DN1ma2R2UeWxG-YyElTTu8uqxCwOfxbtpb5mN2LtF8SUF5T17sswhfotRu08OpeAtpFnTVyEkhpaYwuSfemsGZJFyZOGYY5EyCKcdr1eXO9NawMmu3MV9gXmDx9ooJ7bzWei5Gj4_9H6mlA" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-orange-500/20 p-8 rounded-full border border-orange-500/50 animate-pulse"></div>
                <span className="material-symbols-outlined text-orange-600 absolute text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
        </div>
    );
}