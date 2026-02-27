import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', text }) {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 opacity-70">
            <Loader2 className={`${sizeMap[size] || sizeMap.md} text-aegis-accent animate-spin mb-4`} />
            {text && <p className="text-gray-400 font-medium text-sm animate-pulse">{text}</p>}
        </div>
    );
}
