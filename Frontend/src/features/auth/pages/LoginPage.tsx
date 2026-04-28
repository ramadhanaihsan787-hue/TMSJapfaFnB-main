import ThemeToggle from '../../../shared/components/ThemeToggle';
import { LoginHero, LoginForm, LoginFooter } from '../components';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-display antialiased relative">
            <ThemeToggle className="absolute top-6 right-6 md:top-8 md:right-8 z-50" />
            
            <LoginHero />

            <div className="w-full lg:w-[40%] flex flex-col bg-white dark:bg-[#111111]">
                <LoginForm />
                <LoginFooter />
            </div>
        </div>
    );
}