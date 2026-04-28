import { Link } from 'react-router-dom';

export default function LoginFooter() {
    return (
        <div className="px-8 pb-8 flex justify-between items-center text-xs text-slate-400 font-medium mt-auto">
            <div className="flex gap-4">
                <Link className="hover:text-slate-600 transition-colors" to="/privacy-policy">Privacy Policy</Link>
                <Link className="hover:text-slate-600 transition-colors" to="/terms-of-service">Terms of Service</Link>
            </div>
            <span>© 2026 Logistics Corp</span>
        </div>
    );
}