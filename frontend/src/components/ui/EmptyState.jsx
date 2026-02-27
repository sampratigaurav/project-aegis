import { FileX } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'There are currently no items to display in this view.', icon: Icon = FileX }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-black/20 border border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm">{message}</p>
        </div>
    );
}
